// Reports Page JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAdminAccess()) return;
    renderNavbar();
    
    await loadStats();
    await loadStatusBreakdown();
    await loadMemberPerformance();
    await loadRecentActivity();
});

async function loadStats() {
    try {
        const response = await apiCall('/activities/stats/dashboard');
        const stats = await response.json();
        
        document.getElementById('totalProjects').textContent = stats.projects || 0;
        document.getElementById('totalTasks').textContent = stats.tasks.total || 0;
        document.getElementById('completedTasks').textContent = stats.tasks.verified_completed || 0;
        document.getElementById('totalMembers').textContent = stats.members || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadStatusBreakdown() {
    try {
        const response = await apiCall('/activities/stats/dashboard');
        const stats = await response.json();
        
        const container = document.getElementById('statusBreakdown');
        const total = stats.tasks.total || 1; // Avoid division by zero
        
        const statuses = [
            { name: 'Not Started', count: stats.tasks.not_started, class: 'status-not-started' },
            { name: 'In Progress', count: stats.tasks.in_progress, class: 'status-in-progress' },
            { name: 'Pending Review', count: stats.tasks.pending_review, class: 'status-pending-review' },
            { name: 'Verified Completed', count: stats.tasks.verified_completed, class: 'status-verified-completed' },
            { name: 'Needs Rework', count: stats.tasks.needs_rework, class: 'status-needs-rework' },
            { name: 'Overdue', count: stats.tasks.overdue, class: 'status-overdue' }
        ];
        
        let html = '';
        statuses.forEach(status => {
            const percentage = ((status.count / total) * 100).toFixed(1);
            html += `
                <tr>
                    <td><span class="status-badge ${status.class}">${status.name}</span></td>
                    <td>${status.count}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="flex: 1; background: #eee; height: 10px; border-radius: 5px;">
                                <div style="width: ${percentage}%; background: #3498db; height: 100%; border-radius: 5px;"></div>
                            </div>
                            <span>${percentage}%</span>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading status breakdown:', error);
        document.getElementById('statusBreakdown').innerHTML = '<tr><td colspan="3">Error loading data</td></tr>';
    }
}

async function loadMemberPerformance() {
    try {
        const response = await apiCall('/members/team-members');
        const members = await response.json();
        
        const container = document.getElementById('memberPerformance');
        
        if (!members || members.length === 0) {
            container.innerHTML = '<tr><td colspan="5">No team members</td></tr>';
            return;
        }

        let html = '';
        
        for (const member of members) {
            const statsRes = await apiCall('/members/' + member.id + '/stats');
            const stats = await statsRes.json();
            
            html += `
                <tr>
                    <td>${member.full_name}</td>
                    <td>${stats.total || 0}</td>
                    <td style="color: #27ae60; font-weight: bold;">${stats.verified_completed || 0}</td>
                    <td style="color: #3498db;">${stats.in_progress || 0}</td>
                    <td style="color: #f39c12;">${stats.pending_review || 0}</td>
                </tr>
            `;
        }
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading member performance:', error);
        document.getElementById('memberPerformance').innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
    }
}

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
        activities.slice(0, 10).forEach(activity => {
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
