// Configuration file
// Contains API URL and other settings

const API_URL = '/api';

// Helper function to get auth token
function getToken() {
    return localStorage.getItem('token');
}

// Helper function to get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Helper function to get current profile
function getProfile() {
    const profile = localStorage.getItem('profile');
    return profile ? JSON.parse(profile) : null;
}

// Helper function to check if user is admin
function isAdmin() {
    const profile = getProfile();
    return profile && profile.role === 'team_lead';
}

// Helper function to format date
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Helper function to format status
function formatStatus(status) {
    const statusMap = {
        'not_started': 'Not Started',
        'in_progress': 'In Progress',
        'pending_review': 'Pending Review',
        'verified_completed': 'Verified Completed',
        'needs_rework': 'Needs Rework',
        'overdue': 'Overdue',
        'completed': 'Completed'
    };
    return statusMap[status] || status;
}

// Helper function to get status class
function getStatusClass(status) {
    return 'status-' + status.replace('_', '-');
}

// Helper function to format role
function formatRole(role) {
    return role === 'team_lead' ? 'Team Lead' : 'Team Member';
}

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const response = await fetch(API_URL + endpoint, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    });

    return response;
}

// Time ago helper
function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return formatDate(dateStr);
}
