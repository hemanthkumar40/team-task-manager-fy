// Authentication helper functions

// Check if user is logged in
function checkAuth() {
    const user = getCurrentUser();
    const token = getToken();
    
    if (!user || !token) {
        // Redirect to login if not on login/signup/index page
        const currentPage = window.location.pathname.split('/').pop();
        if (!['login.html', 'signup.html', 'index.html', ''].includes(currentPage)) {
            window.location.href = 'login.html';
        }
        return false;
    }
    return true;
}

// Check admin access
function checkAdminAccess() {
    if (!checkAuth()) return false;
    
    const profile = getProfile();
    if (!profile || profile.role !== 'team_lead') {
        window.location.href = 'member-dashboard.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Render navbar based on role
function renderNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const profile = getProfile();
    const isTeamLead = profile && profile.role === 'team_lead';
    const currentPage = window.location.pathname.split('/').pop();

    let navLinks = '';
    
    if (isTeamLead) {
        navLinks = `
            <li><a href="admin-dashboard.html" class="${currentPage === 'admin-dashboard.html' ? 'active' : ''}">Dashboard</a></li>
            <li><a href="projects.html" class="${currentPage === 'projects.html' ? 'active' : ''}">Projects</a></li>
            <li><a href="tasks.html" class="${currentPage === 'tasks.html' ? 'active' : ''}">Tasks</a></li>
            <li><a href="task-review.html" class="${currentPage === 'task-review.html' ? 'active' : ''}">Review</a></li>
            <li><a href="members.html" class="${currentPage === 'members.html' ? 'active' : ''}">Members</a></li>
            <li><a href="notifications.html" class="${currentPage === 'notifications.html' ? 'active' : ''}">Notifications</a></li>
            <li><a href="#" onclick="logout()">Logout</a></li>
        `;
    } else {
        navLinks = `
            <li><a href="member-dashboard.html" class="${currentPage === 'member-dashboard.html' ? 'active' : ''}">Dashboard</a></li>
            <li><a href="tasks.html" class="${currentPage === 'tasks.html' ? 'active' : ''}">My Tasks</a></li>
            <li><a href="projects.html" class="${currentPage === 'projects.html' ? 'active' : ''}">My Projects</a></li>
            <li><a href="notifications.html" class="${currentPage === 'notifications.html' ? 'active' : ''}">Notifications</a></li>
            <li><a href="profile.html" class="${currentPage === 'profile.html' ? 'active' : ''}">Profile</a></li>
            <li><a href="#" onclick="logout()">Logout</a></li>
        `;
    }

    navbar.innerHTML = `
        <a href="${isTeamLead ? 'admin-dashboard.html' : 'member-dashboard.html'}" class="logo">Team Task Manager</a>
        <ul class="nav-links">
            ${navLinks}
        </ul>
    `;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check if not on public pages
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['login.html', 'signup.html', 'index.html', ''];
    
    if (!publicPages.includes(currentPage)) {
        checkAuth();
        renderNavbar();
    }
});
