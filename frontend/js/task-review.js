// Task Review JavaScript

let currentReviewTaskId = null;

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAdminAccess()) return;
    renderNavbar();
    
    await loadPendingReviewTasks();
    await loadRecentlyReviewed();
});

async function loadPendingReviewTasks() {
    try {
        const response = await apiCall('/tasks/status/pending_review');
        const tasks = await response.json();
        
        const container = document.getElementById('pendingReviewList');
        
        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No Tasks Pending Review</h3><p>All submitted tasks have been reviewed.</p></div>';
            return;
        }

        let html = '';
        tasks.forEach(task => {
            // Get latest note from member
            const latestNote = task.progress_notes && task.progress_notes.length > 0 
                ? task.progress_notes[task.progress_notes.length - 1] 
                : null;

            html += `
                <div class="card task-card ${task.priority}" style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <h3 style="margin-bottom: 5px;">${task.title}</h3>
                            <p style="color: #666; margin-bottom: 10px;">${task.description || 'No description'}</p>
                            <div style="display: flex; gap: 15px; flex-wrap: wrap; font-size: 14px; margin-bottom: 10px;">
                                <span><strong>Submitted by:</strong> ${task.assigned_to_profile?.full_name || 'Unknown'}</span>
                                <span><strong>Project:</strong> ${task.project?.name || 'N/A'}</span>
                                <span><strong>Priority:</strong> <span class="status-badge priority-${task.priority}">${task.priority}</span></span>
                            </div>
                            ${latestNote ? `
                                <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-top: 10px;">
                                    <strong>Member Comment:</strong>
                                    <p style="margin-top: 5px; color: #555;">${latestNote.note}</p>
                                </div>
                            ` : ''}
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-success" onclick="openReviewModal('${task.id}', 'approve')">Approve</button>
                            <button class="btn btn-danger" onclick="openReviewModal('${task.id}', 'rework')">Request Rework</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading tasks:', error);
        document.getElementById('pendingReviewList').innerHTML = '<div class="alert alert-error">Error loading tasks</div>';
    }
}

async function loadRecentlyReviewed() {
    try {
        // Get verified completed and needs rework tasks
        const [completedRes, reworkRes] = await Promise.all([
            apiCall('/tasks/status/verified_completed'),
            apiCall('/tasks/status/needs_rework')
        ]);
        
        const completed = await completedRes.json();
        const rework = await reworkRes.json();
        
        const allReviewed = [...completed, ...rework]
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 10);
        
        const container = document.getElementById('recentlyReviewedList');
        
        if (allReviewed.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No recently reviewed tasks</p></div>';
            return;
        }

        let html = '';
        allReviewed.forEach(task => {
            const isApproved = task.status === 'verified_completed';
            html += `
                <div class="card" style="margin-bottom: 10px; border-left: 3px solid ${isApproved ? '#27ae60' : '#e74c3c'};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${task.title}</strong>
                            <p style="font-size: 14px; color: #666;">
                                ${task.assigned_to_profile?.full_name || 'Unknown'} - 
                                <span class="status-badge ${getStatusClass(task.status)}">${formatStatus(task.status)}</span>
                            </p>
                        </div>
                        <small style="color: #888;">${timeAgo(task.updated_at)}</small>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading reviewed tasks:', error);
        document.getElementById('recentlyReviewedList').innerHTML = '<div class="alert alert-error">Error loading tasks</div>';
    }
}

function openReviewModal(taskId, action) {
    currentReviewTaskId = taskId;
    const modal = document.getElementById('reviewModal');
    const content = document.getElementById('reviewModalContent');
    
    const isApprove = action === 'approve';
    
    content.innerHTML = `
        <div class="form-group">
            <label>Action</label>
            <p style="padding: 10px; background: ${isApprove ? '#d4edda' : '#f8d7da'}; border-radius: 4px; font-weight: bold;">
                ${isApprove ? 'Approve Task' : 'Request Rework'}
            </p>
        </div>
        <div class="form-group">
            <label>Feedback ${!isApprove ? '*' : '(Optional)'}</label>
            <textarea id="reviewFeedback" placeholder="${isApprove ? 'Great job! Task approved.' : 'Please specify what needs to be fixed...'}"></textarea>
        </div>
        <div style="display: flex; gap: 10px;">
            <button class="btn ${isApprove ? 'btn-success' : 'btn-danger'}" onclick="submitReview('${action}')">
                ${isApprove ? 'Confirm Approval' : 'Request Rework'}
            </button>
            <button class="btn btn-secondary" onclick="closeReviewModal()">Cancel</button>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.remove('active');
    currentReviewTaskId = null;
}

async function submitReview(action) {
    const feedback = document.getElementById('reviewFeedback').value;
    const profile = getProfile();
    
    if (action === 'rework' && !feedback.trim()) {
        alert('Please provide feedback for rework request');
        return;
    }

    try {
        const endpoint = action === 'approve' ? '/reviews/approve/' : '/reviews/rework/';
        
        const response = await apiCall(endpoint + currentReviewTaskId, {
            method: 'POST',
            body: JSON.stringify({
                reviewerId: profile.id,
                feedback: feedback || 'Task approved. Good work!'
            })
        });

        if (response.ok) {
            // Log activity
            await apiCall('/activities', {
                method: 'POST',
                body: JSON.stringify({
                    userId: profile.id,
                    action: action === 'approve' ? 'Approved task' : 'Requested rework',
                    entityType: 'task',
                    entityId: currentReviewTaskId,
                    details: feedback || null
                })
            });

            alert(action === 'approve' ? 'Task approved!' : 'Rework requested!');
            closeReviewModal();
            loadPendingReviewTasks();
            loadRecentlyReviewed();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to submit review');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Error submitting review');
    }
}

// Close modal when clicking outside
document.getElementById('reviewModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeReviewModal();
    }
});
