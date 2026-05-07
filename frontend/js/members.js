// Members Page JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    renderNavbar();
    
    await loadMembers();
});

async function loadMembers() {
    try {
        const response = await apiCall('/members');
        const members = await response.json();
        
        const container = document.getElementById('membersList');
        
        if (!members || members.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No Members Found</h3></div>';
            return;
        }

        let html = '';
        
        for (const member of members) {
            // Get stats for each member
            let stats = { total: 0, verified_completed: 0, in_progress: 0, pending_review: 0 };
            
            try {
                const statsRes = await apiCall('/members/' + member.id + '/stats');
                stats = await statsRes.json();
            } catch (e) {
                console.error('Error loading stats for', member.id);
            }

            html += `
                <div class="card">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <div style="width: 60px; height: 60px; background: ${member.role === 'team_lead' ? '#9b59b6' : '#3498db'}; 
                                    border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; 
                                    justify-content: center; color: white; font-size: 24px; font-weight: bold;">
                            ${member.full_name.charAt(0).toUpperCase()}
                        </div>
                        <h3 style="margin-bottom: 5px;">${member.full_name}</h3>
                        <p style="color: #666; font-size: 14px;">${member.email}</p>
                        <span class="role-badge role-${member.role.replace('_', '-')}">${formatRole(member.role)}</span>
                    </div>
                    
                    ${member.role === 'team_member' ? `
                        <div style="border-top: 1px solid #eee; padding-top: 15px;">
                            <h4 style="margin-bottom: 10px;">Performance</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                                <div style="text-align: center; padding: 10px; background: #f9f9f9; border-radius: 4px;">
                                    <div style="font-size: 20px; font-weight: bold;">${stats.total}</div>
                                    <div style="color: #666;">Total Tasks</div>
                                </div>
                                <div style="text-align: center; padding: 10px; background: #d4edda; border-radius: 4px;">
                                    <div style="font-size: 20px; font-weight: bold; color: #27ae60;">${stats.verified_completed}</div>
                                    <div style="color: #666;">Completed</div>
                                </div>
                                <div style="text-align: center; padding: 10px; background: #cce5ff; border-radius: 4px;">
                                    <div style="font-size: 20px; font-weight: bold; color: #3498db;">${stats.in_progress}</div>
                                    <div style="color: #666;">In Progress</div>
                                </div>
                                <div style="text-align: center; padding: 10px; background: #fff3cd; border-radius: 4px;">
                                    <div style="font-size: 20px; font-weight: bold; color: #f39c12;">${stats.pending_review}</div>
                                    <div style="color: #666;">Pending</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading members:', error);
        document.getElementById('membersList').innerHTML = '<div class="alert alert-error">Error loading members</div>';
    }
}
