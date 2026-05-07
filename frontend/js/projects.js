// Projects Page JavaScript

let allProjects = [];

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAuth()) return;
    renderNavbar();

    // Show create button for admins
    if (isAdmin()) {
        document.getElementById('createProjectBtn').style.display = 'block';
    }

    await loadProjects();

    // Setup filters
    document.getElementById('searchInput').addEventListener('input', filterProjects);
    document.getElementById('statusFilter').addEventListener('change', filterProjects);
});

async function loadProjects() {
    try {
        const profile = getProfile();
        let response;
        
        if (isAdmin()) {
            response = await apiCall('/projects');
        } else {
            response = await apiCall('/projects/member/' + profile.id);
        }
        
        allProjects = await response.json();
        displayProjects(allProjects);
    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('projectsList').innerHTML = '<div class="alert alert-error">Error loading projects</div>';
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projectsList');
    
    if (!projects || projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Projects Found</h3>
                <p>There are no projects to display.</p>
                ${isAdmin() ? '<a href="create-project.html" class="btn btn-primary">Create Your First Project</a>' : ''}
            </div>
        `;
        return;
    }

    let html = '';
    projects.forEach(project => {
        const memberCount = project.project_members ? project.project_members.length : 0;
        
        html += `
            <div class="card" style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: 5px;">${project.name}</h3>
                        <p style="color: #666; margin-bottom: 10px;">${project.description || 'No description'}</p>
                        <div style="display: flex; gap: 15px; flex-wrap: wrap; font-size: 14px;">
                            <span><strong>Status:</strong> <span class="status-badge ${getStatusClass(project.status)}">${formatStatus(project.status)}</span></span>
                            <span><strong>Members:</strong> ${memberCount}</span>
                            <span><strong>Start:</strong> ${formatDate(project.start_date)}</span>
                            <span><strong>Deadline:</strong> ${formatDate(project.deadline)}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        ${isAdmin() ? `
                            <button class="btn btn-small btn-primary" onclick="editProject('${project.id}')">Edit</button>
                            <button class="btn btn-small btn-danger" onclick="deleteProject('${project.id}')">Delete</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filterProjects() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = allProjects;
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (statusFilter) {
        filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    displayProjects(filtered);
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        const response = await apiCall('/projects/' + id, { method: 'DELETE' });
        
        if (response.ok) {
            alert('Project deleted successfully!');
            loadProjects();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete project');
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project');
    }
}

function editProject(id) {
    window.location.href = 'create-project.html?id=' + id;
}
