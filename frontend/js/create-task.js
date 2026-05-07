// Create Task JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAdminAccess()) return;
    renderNavbar();
    
    await loadProjects();
    await loadMembers();
    
    // Form submit handler
    document.getElementById('createTaskForm').addEventListener('submit', handleSubmit);
});

async function loadProjects() {
    try {
        const response = await apiCall('/projects');
        const projects = await response.json();
        
        const select = document.getElementById('projectId');
        
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

async function loadMembers() {
    try {
        const response = await apiCall('/members/team-members');
        const members = await response.json();
        
        const select = document.getElementById('assignedTo');
        
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.full_name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const profile = getProfile();
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('description').value;
    const projectId = document.getElementById('projectId').value;
    const assignedTo = document.getElementById('assignedTo').value;
    const dueDate = document.getElementById('dueDate').value;
    const priority = document.getElementById('priority').value;

    if (!title || !projectId) {
        showAlert('Please fill in required fields', 'error');
        return;
    }

    try {
        showAlert('Creating task...', 'info');

        const response = await apiCall('/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title,
                description,
                projectId,
                assignedTo: assignedTo || null,
                dueDate: dueDate || null,
                priority,
                createdBy: profile.id
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error || 'Failed to create task', 'error');
            return;
        }

        // Create notification for assigned member
        if (assignedTo) {
            await apiCall('/notifications', {
                method: 'POST',
                body: JSON.stringify({
                    userId: assignedTo,
                    title: 'New Task Assigned',
                    message: `You have been assigned a new task: ${title}`
                })
            });
        }

        // Log activity
        await apiCall('/activities', {
            method: 'POST',
            body: JSON.stringify({
                userId: profile.id,
                action: 'Created task',
                entityType: 'task',
                entityId: data.task.id,
                details: title
            })
        });

        showAlert('Task created successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'tasks.html';
        }, 1500);

    } catch (error) {
        console.error('Error creating task:', error);
        showAlert('Error creating task', 'error');
    }
}

function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = 'alert alert-' + type;
    alertBox.style.display = 'block';
}
