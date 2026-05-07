// Notifications Page JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    renderNavbar();
    
    await loadNotifications();
});

async function loadNotifications() {
    try {
        const profile = getProfile();
        const response = await apiCall('/notifications/user/' + profile.id);
        const notifications = await response.json();
        
        const container = document.getElementById('notificationsList');
        
        if (!notifications || notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Notifications</h3>
                    <p>You don't have any notifications yet.</p>
                </div>
            `;
            return;
        }

        let html = '';
        notifications.forEach(notif => {
            html += `
                <div class="card" style="margin-bottom: 10px; ${notif.is_read ? 'opacity: 0.7;' : 'border-left: 3px solid #3498db;'}" 
                     onclick="markAsRead('${notif.id}')" id="notif-${notif.id}">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <strong>${notif.title}</strong>
                            ${!notif.is_read ? '<span class="status-badge status-pending-review" style="margin-left: 10px;">New</span>' : ''}
                            <p style="color: #666; margin-top: 5px;">${notif.message}</p>
                        </div>
                        <small style="color: #888; white-space: nowrap;">${timeAgo(notif.created_at)}</small>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading notifications:', error);
        document.getElementById('notificationsList').innerHTML = '<div class="alert alert-error">Error loading notifications</div>';
    }
}

async function markAsRead(id) {
    try {
        await apiCall('/notifications/' + id + '/read', { method: 'PUT' });
        
        // Update UI
        const notifElement = document.getElementById('notif-' + id);
        if (notifElement) {
            notifElement.style.opacity = '0.7';
            notifElement.style.borderLeft = 'none';
            const newBadge = notifElement.querySelector('.status-badge');
            if (newBadge) newBadge.remove();
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

async function markAllAsRead() {
    try {
        const profile = getProfile();
        await apiCall('/notifications/user/' + profile.id + '/read-all', { method: 'PUT' });
        loadNotifications();
    } catch (error) {
        console.error('Error marking all as read:', error);
        alert('Failed to mark all as read');
    }
}
