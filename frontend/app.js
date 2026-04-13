const showAddFormBtn = document.getElementById('showAddFormBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const listPending = document.getElementById('listPending');
const listCompleted = document.getElementById('listCompleted');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');

let allTasks = [];


const searchBarInput = document.querySelector('.search-bar input');
const viewToggleTabs = document.querySelectorAll('.toggle-tab');
const kanbanBoard = document.querySelector('.kanban-board');
const btnUpgrade = document.querySelector('.btn-upgrade');
const navItems = document.querySelectorAll('.nav-item');
const profileAvatar = document.querySelector('.profile-avatar');
const columnGhosts = document.querySelectorAll('.kanban-column .btn-ghost');


btnUpgrade.addEventListener('click', () => {
    alert('Pro features are now unlocked for you automatically!');
});

const profileModal = document.getElementById('profileModal');
profileAvatar.addEventListener('click', () => {
    profileModal.classList.remove('hidden');
});
document.getElementById('closeProfileBtn').addEventListener('click', () => profileModal.classList.add('hidden'));

columnGhosts.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const type = e.currentTarget.getAttribute('data-column');
        if(confirm(`Clear all Tasks in ${type} column?`)) {
            const tasksToDelete = allTasks.filter(t => type === 'completed' ? t.status === 'Completed' : t.status !== 'Completed');
            for(let t of tasksToDelete) {
                await fetch(`/tasks/${t._id}`, {method: 'DELETE'});
            }
            fetchTasks();
        }
    });
});

const boardView = document.getElementById('boardView');
const calendarView = document.getElementById('calendarView');
const analyticsView = document.getElementById('analyticsView');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(n => n.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        boardView.classList.add('hidden');
        calendarView.classList.add('hidden');
        analyticsView.classList.add('hidden');
        
        const txt = e.currentTarget.textContent.trim();
        if(txt.includes('Board')) boardView.classList.remove('hidden');
        if(txt.includes('Calendar')) { calendarView.classList.remove('hidden'); renderCalendar(); }
        if(txt.includes('Analytics')) { analyticsView.classList.remove('hidden'); renderAnalytics(); }
    });
});

function renderAnalytics() {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'Completed').length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statRate').textContent = rate + '%';
    document.getElementById('statPending').textContent = pending;
}

function renderCalendar() {
    const cal = document.getElementById('calendarContainer');
    cal.innerHTML = '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(d => {
        cal.innerHTML += `<div class="calendar-day" style="min-height:auto; font-weight:bold; text-align:center; padding-bottom: 2px; min-height: 20px;">${d}</div>`;
    });
    
    for(let i=1; i<=30; i++) {
        const dayTasks = allTasks.filter(t => t.deadline && new Date(t.deadline).getDate() === i);
        let taskHtml = dayTasks.map(t => `<div class="cal-task">${t.title.substring(0,10)}</div>`).join('');
        cal.innerHTML += `<div class="calendar-day"><h4>${i}</h4>${taskHtml}</div>`;
    }
}


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


searchBarInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allTasks.filter(t => 
        t.title.toLowerCase().includes(term) || 
        (t.description && t.description.toLowerCase().includes(term))
    );
    renderBoard(filtered);
});


showAddFormBtn.addEventListener('click', () => taskModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => {
    taskModal.classList.add('hidden');
    taskForm.reset();
});


const fetchTasks = async () => {
    try {
        const res = await fetch('/tasks');
        allTasks = await res.json();
        renderBoard(allTasks);
        
        
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
    
    
    lucide.createIcons();
};


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
    e.stopPropagation(); 
    await fetch(`/tasks/${id}`, {
        method: 'DELETE'
    });
    fetchTasks();
};


fetchTasks();

lucide.createIcons();
