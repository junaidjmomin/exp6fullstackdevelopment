const showAddFormBtn = document.getElementById('showAddFormBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const listPending = document.getElementById('listPending');
const listCompleted = document.getElementById('listCompleted');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');

let allTasks = [];

// Layout and Interactivity Elements
const searchBarInput = document.querySelector('.search-bar input');
const viewToggleTabs = document.querySelectorAll('.toggle-tab');
const kanbanBoard = document.querySelector('.kanban-board');
const btnUpgrade = document.querySelector('.btn-upgrade');
const navItems = document.querySelectorAll('.nav-item');
const profileAvatar = document.querySelector('.profile-avatar');
const columnGhosts = document.querySelectorAll('.kanban-column .btn-ghost');

// Button & Nav Interactions
btnUpgrade.addEventListener('click', () => {
    alert('Pro Upgrade coming soon! Secure your advanced features early.');
});

profileAvatar.addEventListener('click', () => {
    alert('Profile Settings coming soon!');
});

columnGhosts.forEach(btn => {
    btn.addEventListener('click', () => {
        alert('Column options menu (Rename, Sort, Clear) feature pending.');
    });
});

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(n => n.classList.remove('active'));
        e.currentTarget.classList.add('active');
        if(e.currentTarget.textContent.includes('Board') === false) {
            alert(e.currentTarget.textContent.trim() + ' view not yet implemented.');
        }
    });
});

// View Toggle
viewToggleTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        viewToggleTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        if (e.target.textContent === 'List') {
            kanbanBoard.classList.add('list-view');
        } else {
            kanbanBoard.classList.remove('list-view');
        }
    });
});

// Search
searchBarInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allTasks.filter(t => 
        t.title.toLowerCase().includes(term) || 
        (t.description && t.description.toLowerCase().includes(term))
    );
    renderBoard(filtered);
});

// Modal Toggles
showAddFormBtn.addEventListener('click', () => taskModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => {
    taskModal.classList.add('hidden');
    taskForm.reset();
});

// API Calls
const fetchTasks = async () => {
    try {
        const res = await fetch('/tasks');
        allTasks = await res.json();
        renderBoard(allTasks);
        
        // Ensure search filter applies if text exists during auto-refresh
        if(searchBarInput.value) {
            searchBarInput.dispatchEvent(new Event('input'));
        }
    } catch(err) {
        console.error('Failed to fetch tasks:', err);
    }
};

const renderBoard = (tasks) => {
    listPending.innerHTML = '';
    listCompleted.innerHTML = '';
    
    let pCount = 0;
    let cCount = 0;
    
    tasks.forEach(task => {
        const isCompleted = task.status === 'Completed';
        const targetList = isCompleted ? listCompleted : listPending;
        if(isCompleted) cCount++; else pCount++;

        const taskEl = document.createElement('div');
        taskEl.className = `task-card`;
        
        const deadlineText = task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'No set date';

        // Checkbox acts as quick status toggle
        taskEl.innerHTML = `
            <div class="card-header">
                <div class="checkbox ${isCompleted ? 'checked' : ''}" onclick="toggleStatus('${task._id}', '${task.status}')"></div>
                <div class="task-body">
                    <h4>${task.title}</h4>
                    ${task.description ? `<p>${task.description.substring(0, 60)}${task.description.length > 60 ? '...' : ''}</p>` : ''}
                </div>
            </div>
            <div class="card-footer">
                <span class="meta-date" style="display: flex; align-items: center; gap: 4px;"><i data-lucide="calendar" style="width: 12px; height: 12px;"></i> ${deadlineText}</span>
                <button class="btn-ghost" onclick="deleteTask(event, '${task._id}')"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i></button>
            </div>
        `;
        targetList.appendChild(taskEl);
    });

    pendingCount.textContent = pCount;
    completedCount.textContent = cCount;
    
    // Re-initialize Lucide icons for dynamically added elements
    lucide.createIcons();
};

// Form Post
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTask = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        deadline: document.getElementById('deadline').value || null,
        status: document.getElementById('status').value
    };

    await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
    });
    
    taskForm.reset();
    taskModal.classList.add('hidden');
    fetchTasks();
});

// Inline Toggles & Delete
window.toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    await fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    fetchTasks();
};

window.deleteTask = async (e, id) => {
    e.stopPropagation(); // Prevents card click
    await fetch(`/tasks/${id}`, {
        method: 'DELETE'
    });
    fetchTasks();
};

// Start
fetchTasks();
// Initialize Lucide icons on page load
lucide.createIcons();
