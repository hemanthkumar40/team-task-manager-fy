// Member Dashboard JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Check auth
    if (!checkAuth()) return;

    // Set username
    const profile = getProfile();
    document.getElementById('userName').textContent = profile.full_name || 'Member';

    // Load dashboard data
    await loadMemberStats();
    await loadMyTasks();
    await loadNotifications();
    await loadUpcomingDeadlines();
});

// Load member statistics
async function loadMemberStats() {
    try {
        const profile = getProfile();
        const response = await apiCall('/members/' + profile.id + '/stats');
        const stats = await response.json();

        document.getElementById('assignedTasks').textContent = stats.total || 0;
        document.getElementById('inProgressTasks').textContent = stats.in_progress || 0;
        document.getElementById('pendingReview').textContent = stats.pending_review || 0;
        document.getElementById('completedTasks').textContent = stats.verified_completed || 0;
        document.getElementById('reworkTasks').textContent = stats.needs_rework || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load my tasks
async function loadMyTasks() {
    try {
        const profile = getProfile();
        const response = await apiCall('/tasks/member/' + profile.id);
        const tasks = await response.json();
        
        const container = document.getElementById('myTasksList');
        
        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No tasks assigned</p></div>';
            return;
        }

        let html = '';
        tasks.slice(0, 5).forEach(task => {
            html += `
                <div class="task-card card ${task.priority}" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <strong>${task.title}</strong>
                            <p style="font-size: 14px; color: #666; margin-top: 5px;">
                                <span class="status-badge ${getStatusClass(task.status)}">${formatStatus(task.status)}</span>
                                ${task.due_date ? ` - Due: ${formatDate(task.due_date)}` : ''}
                            </p>
                        </div>
                        <a href="tasks.html?id=${task.id}" class="btn btn-small btn-primary">View</a>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading tasks:', error);
        document.getElementById('myTasksList').innerHTML = '<div class="alert alert-error">Error loading tasks</div>';
    }
}

// Load notifications
async function loadNotifications() {
    try {
        const profile = getProfile();
        const response = await apiCall('/notifications/user/' + profile.id);
        const notifications = await response.json();
        
        const container = document.getElementById('notificationsList');
        
        if (!notifications || notifications.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No notifications</p></div>';
            return;
        }

        let html = '';
        notifications.slice(0, 5).forEach(notif => {
            html += `
                <div class="card" style="margin-bottom: 10px; ${notif.is_read ? 'opacity: 0.7;' : 'border-left: 3px solid #3498db;'}">
                    <strong>${notif.title}</strong>
                    <p style="font-size: 14px; color: #666; margin-top: 5px;">${notif.message}</p>
                    <small style="color: #888;">${timeAgo(notif.created_at)}</small>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading notifications:', error);
        document.getElementById('notificationsList').innerHTML = '<div class="alert alert-error">Error loading notifications</div>';
    }
}

// Load upcoming deadlines
async function loadUpcomingDeadlines() {
    try {
        const profile = getProfile();
        const response = await apiCall('/tasks/member/' + profile.id);
        const tasks = await response.json();
        
        const container = document.getElementById('deadlinesTable');
        
        // Filter tasks with due dates and sort by date
        const tasksWithDeadlines = tasks
            .filter(t => t.due_date && t.status !== 'verified_completed')
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        
        if (!tasksWithDeadlines || tasksWithDeadlines.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="empty-state">No upcoming deadlines</td></tr>';
            return;
        }

        let html = '';
        tasksWithDeadlines.slice(0, 10).forEach(task => {
            const isOverdue = new Date(task.due_date) < new Date();
            html += `
                <tr ${isOverdue ? 'style="background-color: #fff5f5;"' : ''}>
                    <td>${task.title}</td>
                    <td>${task.project?.name || 'N/A'}</td>
                    <td style="${isOverdue ? 'color: #e74c3c; font-weight: bold;' : ''}">${formatDate(task.due_date)}</td>
                    <td><span class="status-badge ${getStatusClass(task.status)}">${formatStatus(task.status)}</span></td>
                    <td>
                        <a href="tasks.html?id=${task.id}" class="btn btn-small btn-primary">View</a>
                    </td>
                </tr>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading deadlines:', error);
        document.getElementById('deadlinesTable').innerHTML = '<tr><td colspan="5" class="alert alert-error">Error loading deadlines</td></tr>';
    }
}
