// DOM Elements
const taskForm = document.getElementById('add-task-form');
const taskTableBody = document.getElementById('task-list-body');
const emptyState = document.getElementById('empty-state');

// Dashboard Elements
const totalCountDisplay = document.getElementById('total-count');
const completedCountDisplay = document.getElementById('completed-count');
const pendingCountDisplay = document.getElementById('pending-count');
const progressPercentageDisplay = document.getElementById('progress-percentage');
const progressBar = document.getElementById('progress-bar');

// State
let tasks = [];

// Constants
const STORAGE_KEY = 'scm_study_data';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    updateDashboard();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('deadline').value = today;
});

// Event Listeners
taskForm.addEventListener('submit', handleAddTask);

// Functions

function loadTasks() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        tasks = JSON.parse(storedData);
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    updateDashboard();
}

function handleAddTask(e) {
    e.preventDefault();

    const subject = document.getElementById('subject').value;
    const topic = document.getElementById('topic').value;
    const priority = document.getElementById('priority').value;
    const deadline = document.getElementById('deadline').value;
    const status = document.getElementById('status').value;

    const newTask = {
        id: Date.now(),
        subject,
        topic,
        priority,
        deadline,
        status,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    // Reset form
    taskForm.reset();
    // Reset date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('deadline').value = today;
}

function deleteTask(id) {
    if(confirm('Are you sure you want to delete this topic?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

function updateTaskStatus(id, newStatus) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        saveTasks();
        renderTasks(); // Re-render to update badges/styles if needed, though mostly for data consistency
    }
}

function renderTasks() {
    taskTableBody.innerHTML = '';
    
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');

    // Sort tasks: Incomplete first, then by deadline
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    sortedTasks.forEach(task => {
        const row = document.createElement('tr');
        
        // Priority Class
        const priorityClass = `priority-${task.priority.toLowerCase()}`;
        
        // Status Class for Badge
        const statusClass = `status-${task.status.toLowerCase().replace(' ', '-')}`;

        row.innerHTML = `
            <td data-label="Subject">${task.subject}</td>
            <td data-label="Topic"><strong>${task.topic}</strong></td>
            <td data-label="Priority">
                <span class="priority-dot ${priorityClass}"></span>${task.priority}
            </td>
            <td data-label="Deadline">${formatDate(task.deadline)}</td>
            <td data-label="Status">
                <select 
                    class="table-status-select ${statusClass}" 
                    onchange="updateTaskStatus(${task.id}, this.value)"
                >
                    <option value="Not Started" ${task.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                    <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td data-label="Action">
                <button class="btn-delete" onclick="deleteTask(${task.id})" title="Delete Topic">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        
        taskTableBody.appendChild(row);
    });
}

function updateDashboard() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Animate numbers
    animateValue(totalCountDisplay, parseInt(totalCountDisplay.innerText), total, 500);
    animateValue(completedCountDisplay, parseInt(completedCountDisplay.innerText), completed, 500);
    animateValue(pendingCountDisplay, parseInt(pendingCountDisplay.innerText), pending, 500);
    
    // Update progress bar
    progressPercentageDisplay.innerText = `${percentage}%`;
    progressBar.style.width = `${percentage}%`;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Utility for number animation
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Global scope binding for inline event handlers (onclick)
window.deleteTask = deleteTask;
window.updateTaskStatus = updateTaskStatus;
