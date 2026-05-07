// Create Project JavaScript

let selectedMembers = [];

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAdminAccess()) return;
    renderNavbar();
    
    await loadTeamMembers();
    
    // Form submit handler
    document.getElementById('createProjectForm').addEventListener('submit', handleSubmit);
});

async function loadTeamMembers() {
    try {
        const response = await apiCall('/members/team-members');
        const members = await response.json();
        
        const container = document.getElementById('membersList');
        
        if (!members || members.length === 0) {
            container.innerHTML = '<p style="color: #666;">No team members available</p>';
            return;
        }

        let html = '';
        members.forEach(member => {
            html += `
                <label style="display: flex; align-items: center; padding: 8px; cursor: pointer;">
                    <input type="checkbox" name="members" value="${member.id}" 
                           onchange="toggleMember('${member.id}')" style="margin-right: 10px;">
                    <span>${member.full_name} (${member.email})</span>
                </label>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading members:', error);
        document.getElementById('membersList').innerHTML = '<p class="alert alert-error">Error loading members</p>';
    }
}

function toggleMember(memberId) {
    const index = selectedMembers.indexOf(memberId);
    if (index > -1) {
        selectedMembers.splice(index, 1);
    } else {
        selectedMembers.push(memberId);
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const profile = getProfile();
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('description').value;
    const startDate = document.getElementById('startDate').value;
    const deadline = document.getElementById('deadline').value;

    if (!name) {
        showAlert('Please enter a project name', 'error');
        return;
    }

    try {
        showAlert('Creating project...', 'info');

        // Create project
        const response = await apiCall('/projects', {
            method: 'POST',
            body: JSON.stringify({
                name,
                description,
                startDate,
                deadline,
                createdBy: profile.id
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error || 'Failed to create project', 'error');
            return;
        }

        // Add members to project
        if (selectedMembers.length > 0) {
            for (const memberId of selectedMembers) {
                await apiCall('/projects/' + data.project.id + '/members', {
                    method: 'POST',
                    body: JSON.stringify({ memberId })
                });
            }
        }

        // Log activity
        await apiCall('/activities', {
            method: 'POST',
            body: JSON.stringify({
                userId: profile.id,
                action: 'Created project',
                entityType: 'project',
                entityId: data.project.id,
                details: name
            })
        });

        showAlert('Project created successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'projects.html';
        }, 1500);

    } catch (error) {
        console.error('Error creating project:', error);
        showAlert('Error creating project', 'error');
    }
}

function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = 'alert alert-' + type;
    alertBox.style.display = 'block';
}
