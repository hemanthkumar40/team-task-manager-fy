// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Check admin access
    if (!checkAdminAccess()) return;

    // Set username
    const profile = getProfile();
    document.getElementById('userName').textContent = profile.full_name || 'Admin';

    // Load dashboard data
    await loadDashboardStats();
    await loadPendingTasks();
    await loadRecentActivity();
    await loadRecentProjects();
});

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await apiCall('/activities/stats/dashboard');
        const stats = await response.json();

        document.getElementById('totalProjects').textContent = stats.projects || 0;
        document.getElementById('totalTasks').textContent = stats.tasks.total || 0;
        document.getElementById('pendingReview').textContent = stats.tasks.pending_review || 0;
        document.getElementById('completedTasks').textContent = stats.tasks.verified_completed || 0;
        document.getElementById('reworkTasks').textContent = stats.tasks.needs_rework || 0;
        document.getElementById('activeMembers').textContent = stats.members || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load pending review tasks
async function loadPendingTasks() {
    try {
        const response = await apiCall('/tasks/status/pending_review');
        const tasks = await response.json();
        
        const container = document.getElementById('pendingTasksList');
        
        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No tasks pending review</p></div>';
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
                                ${task.assigned_to_profile?.full_name || 'Unassigned'} - ${task.project?.name || 'No project'}
                            </p>
                        </div>
                        <a href="task-review.html" class="btn btn-small btn-warning">Review</a>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading pending tasks:', error);
        document.getElementById('pendingTasksList').innerHTML = '<div class="alert alert-error">Error loading tasks</div>';
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const response = await apiCall('/activities');
        const activities = await response.json();
        
        const container = document.getElementById('activityList');
        
        if (!activities || activities.length === 0) {
            container.innerHTML = '<li class="empty-state">No recent activity</li>';
            return;
        }

        let html = '';
        activities.slice(0, 5).forEach(activity => {
            html += `
                <li class="activity-item">
                    <div class="activity-time">${timeAgo(activity.created_at)}</div>
                    <div class="activity-text">
                        <strong>${activity.user?.full_name || 'System'}</strong> - ${activity.action}
                        ${activity.details ? `<br><small style="color: #666;">${activity.details}</small>` : ''}
                    </div>
                </li>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading activity:', error);
        document.getElementById('activityList').innerHTML = '<li class="alert alert-error">Error loading activity</li>';
    }
}

// Load recent projects
async function loadRecentProjects() {
    try {
        const response = await apiCall('/projects');
        const projects = await response.json();
        
        const container = document.getElementById('projectsTable');
        
        if (!projects || projects.length === 0) {
            container.innerHTML = '<tr><td colspan="4" class="empty-state">No projects yet</td></tr>';
            return;
        }

        let html = '';
        projects.slice(0, 5).forEach(project => {
            html += `
                <tr>
                    <td>${project.name}</td>
                    <td><span class="status-badge ${getStatusClass(project.status)}">${formatStatus(project.status)}</span></td>
                    <td>${formatDate(project.deadline)}</td>
                    <td>
                        <a href="projects.html?id=${project.id}" class="btn btn-small btn-primary">View</a>
                    </td>
                </tr>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('projectsTable').innerHTML = '<tr><td colspan="4" class="alert alert-error">Error loading projects</td></tr>';
    }
}
