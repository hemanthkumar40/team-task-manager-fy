// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    renderNavbar();
    
    await loadProfile();
    await loadStats();
});

async function loadProfile() {
    const profile = getProfile();
    
    document.getElementById('profileName').textContent = profile.full_name || 'N/A';
    document.getElementById('profileEmail').textContent = profile.email || 'N/A';
    document.getElementById('profileRole').innerHTML = `<span class="role-badge role-${profile.role.replace('_', '-')}">${formatRole(profile.role)}</span>`;
    document.getElementById('profileCreated').textContent = formatDate(profile.created_at);
}

async function loadStats() {
    try {
        const profile = getProfile();
        const response = await apiCall('/members/' + profile.id + '/stats');
        const stats = await response.json();
        
        document.getElementById('statTotal').textContent = stats.total || 0;
        document.getElementById('statCompleted').textContent = stats.verified_completed || 0;
        document.getElementById('statPending').textContent = stats.in_progress || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}
