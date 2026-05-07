// Tasks Page JavaScript

let allTasks = [];

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    renderNavbar();

    // Show create button for admins
    if (isAdmin()) {
        document.getElementById('createTaskBtn').style.display = 'block';
    }

    await loadTasks();

    // Setup filters
    document.getElementById('searchInput').addEventListener('input', filterTasks);
    document.getElementById('statusFilter').addEventListener('change', filterTasks);
    document.getElementById('priorityFilter').addEventListener('change', filterTasks);
});

async function loadTasks() {
    try {
        const profile = getProfile();
        let response;
        
        if (isAdmin()) {
            response = await apiCall('/tasks');
        } else {
            response = await apiCall('/tasks/member/' + profile.id);
        }
        
        allTasks = await response.json();
        displayTasks(allTasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        document.getElementById('tasksList').innerHTML = '<div class="alert alert-error">Error loading tasks</div>';
    }
}

function displayTasks(tasks) {
    const container = document.getElementById('tasksList');
    
    if (!tasks || tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Tasks Found</h3>
                <p>There are no tasks to display.</p>
                ${isAdmin() ? '<a href="create-task.html" class="btn btn-primary">Create Your First Task</a>' : ''}
            </div>
        `;
        return;
    }

    let html = '';
    tasks.forEach(task => {
        html += `
            <div class="card task-card ${task.priority}" style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: 5px;">${task.title}</h3>
                        <p style="color: #666; margin-bottom: 10px;">${task.description || 'No description'}</p>
                        <div style="display: flex; gap: 15px; flex-wrap: wrap; font-size: 14px;">
                            <span><strong>Status:</strong> <span class="status-badge ${getStatusClass(task.status)}">${formatStatus(task.status)}</span></span>
                            <span><strong>Priority:</strong> <span class="status-badge priority-${task.priority}">${task.priority}</span></span>
                            <span><strong>Assigned:</strong> ${task.assigned_to_profile?.full_name || 'Unassigned'}</span>
                            <span><strong>Due:</strong> ${formatDate(task.due_date)}</span>
                            <span><strong>Project:</strong> ${task.project?.name || 'N/A'}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                        <button class="btn btn-small btn-primary" onclick="viewTask('${task.id}')">View</button>
                        ${!isAdmin() && (task.status === 'in_progress' || task.status === 'needs_rework') ? `
                            <button class="btn btn-small btn-success" onclick="submitTask('${task.id}')">Submit</button>
                        ` : ''}
                        ${!isAdmin() && task.status === 'not_started' ? `
                            <button class="btn btn-small btn-warning" onclick="startTask('${task.id}')">Start</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filterTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    
    let filtered = allTasks;
    
    if (searchTerm) {
        filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(searchTerm) || 
            (t.description && t.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (statusFilter) {
        filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    if (priorityFilter) {
        filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    
    displayTasks(filtered);
}

async function viewTask(id) {
    const modal = document.getElementById('taskModal');
    const content = document.getElementById('taskModalContent');
    modal.classList.add('active');
    content.innerHTML = '<div class="loading">Loading...</div>';

    try {
        const response = await apiCall('/tasks/' + id);
        const task = await response.json();

        let notesHtml = '';
        if (task.progress_notes && task.progress_notes.length > 0) {
            task.progress_notes.forEach(note => {
                notesHtml += `
                    <div class="comment">
                        <div class="comment-header">
                            <span>${note.user?.full_name || 'Unknown'}</span>
                            <span>${timeAgo(note.created_at)}</span>
                        </div>
                        <div class="comment-text">${note.note}</div>
                    </div>
                `;
            });
        } else {
            notesHtml = '<p style="color: #666;">No notes yet</p>';
        }

        let reviewsHtml = '';
        if (task.task_reviews && task.task_reviews.length > 0) {
            task.task_reviews.forEach(review => {
                const isApproved = review.action === 'approved';
                reviewsHtml += `
                    <div class="comment" style="border-left: 3px solid ${isApproved ? '#27ae60' : '#e74c3c'};">
                        <div class="comment-header">
                            <span>${review.reviewer?.full_name || 'Admin'} - ${isApproved ? 'Approved' : 'Rework Requested'}</span>
                            <span>${timeAgo(review.created_at)}</span>
                        </div>
                        <div class="comment-text">${review.feedback}</div>
                    </div>
                `;
            });
        }

        content.innerHTML = `
            <div class="form-group">
                <label>Title</label>
                <p style="padding: 10px; background: #f9f9f9; border-radius: 4px;">${task.title}</p>
            </div>
            <div class="form-group">
                <label>Description</label>
                <p style="padding: 10px; background: #f9f9f9; border-radius: 4px;">${task.description || 'No description'}</p>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Status</label>
                    <p><span class="status-badge ${getStatusClass(task.status)}">${formatStatus(task.status)}</span></p>
                </div>
                <div class="form-group">
                    <label>Priority</label>
                    <p><span class="status-badge priority-${task.priority}">${task.priority}</span></p>
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Assigned To</label>
                    <p style="padding: 10px; background: #f9f9f9; border-radius: 4px;">${task.assigned_to_profile?.full_name || 'Unassigned'}</p>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <p style="padding: 10px; background: #f9f9f9; border-radius: 4px;">${formatDate(task.due_date)}</p>
                </div>
            </div>
            
            ${reviewsHtml ? `
                <h4 style="margin-top: 20px; margin-bottom: 10px;">Admin Reviews</h4>
                ${reviewsHtml}
            ` : ''}
            
            <h4 style="margin-top: 20px; margin-bottom: 10px;">Progress Notes</h4>
            ${notesHtml}
            
            ${!isAdmin() ? `
                <div class="form-group" style="margin-top: 15px;">
                    <label>Add Note</label>
                    <textarea id="newNote" placeholder="Add a progress note..."></textarea>
                </div>
                <button class="btn btn-primary" onclick="addNote('${task.id}')">Add Note</button>
            ` : ''}
        `;

        document.getElementById('modalTaskTitle').textContent = task.title;
    } catch (error) {
        console.error('Error loading task:', error);
        content.innerHTML = '<div class="alert alert-error">Error loading task details</div>';
    }
}

function closeModal() {
    document.getElementById('taskModal').classList.remove('active');
}

async function addNote(taskId) {
    const noteText = document.getElementById('newNote').value;
    if (!noteText.trim()) {
        alert('Please enter a note');
        return;
    }

    const profile = getProfile();

    try {
        const response = await apiCall('/tasks/' + taskId + '/notes', {
            method: 'POST',
            body: JSON.stringify({
                note: noteText,
                userId: profile.id
            })
        });

        if (response.ok) {
            viewTask(taskId); // Refresh modal
        } else {
            alert('Failed to add note');
        }
    } catch (error) {
        console.error('Error adding note:', error);
        alert('Error adding note');
    }
}

async function startTask(taskId) {
    if (!confirm('Start working on this task?')) return;

    try {
        const response = await apiCall('/tasks/' + taskId, {
            method: 'PUT',
            body: JSON.stringify({ status: 'in_progress' })
        });

        if (response.ok) {
            loadTasks();
        } else {
            alert('Failed to start task');
        }
    } catch (error) {
        console.error('Error starting task:', error);
        alert('Error starting task');
    }
}

async function submitTask(taskId) {
    if (!confirm('Submit this task for review?')) return;

    try {
        const response = await apiCall('/tasks/' + taskId + '/submit', {
            method: 'PUT'
        });

        if (response.ok) {
            alert('Task submitted for review!');
            loadTasks();
        } else {
            alert('Failed to submit task');
        }
    } catch (error) {
        console.error('Error submitting task:', error);
        alert('Error submitting task');
    }
}

// Close modal when clicking outside
document.getElementById('taskModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});
