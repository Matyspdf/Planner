document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const closeModal = document.getElementById('closeModal');
    const taskForm = document.getElementById('taskForm');
    const tasksContainer = document.getElementById('tasksContainer');
    const searchInput = document.getElementById('searchInput');
    const themeToggle = document.getElementById('themeToggle');
    const filterButtons = document.querySelectorAll('.filter-button');

    // Gestionnaire du thème
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    };

    // Initialiser le thème
    const savedTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    setTheme(savedTheme);

    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    };

    // Gestionnaire de la modal
    const openModal = () => {
        taskModal.style.display = 'block';
        setTimeout(() => {
            taskModal.classList.add('active');
        }, 10);
    };

    const closeModalHandler = () => {
        taskModal.classList.remove('active');
        setTimeout(() => {
            taskModal.style.display = 'none';
        }, 300);
    };

    // Gestionnaire des tâches
    const createTaskElement = (task) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
            <p>${task.description || ''}</p>
            ${task.dueDate ? `<p><i class="far fa-calendar"></i> ${task.dueDate}</p>` : ''}
            ${task.subtasks.length ? `
                <div class="subtasks">
                    ${task.subtasks.map(subtask => `
                        <div class="subtask-item">
                            <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
                            <span>${subtask.text}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            ${task.tags.length ? `
                <div class="tags">
                    ${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        `;

        return taskElement;
    };

    const addTask = (task) => {
        const taskElement = createTaskElement(task);
        tasksContainer.prepend(taskElement);
        saveTasks();
    };

    // Gestionnaire du formulaire
    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        const task = {
            id: Date.now(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            category: document.getElementById('taskCategory').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            time: document.getElementById('taskTime').value,
            subtasks: Array.from(document.querySelectorAll('#subtasksList .subtask-item'))
                .map(item => ({
                    text: item.querySelector('span').textContent,
                    completed: false
                })),
            tags: Array.from(document.querySelectorAll('#tagsList .tag-item'))
                .map(item => item.querySelector('span').textContent),
            completed: false,
            createdAt: new Date().toISOString()
        };

        addTask(task);
        taskForm.reset();
        closeModalHandler();
    };

    // Gestionnaire des sous-tâches
    const addSubtask = () => {
        const input = document.getElementById('subtaskInput');
        const text = input.value.trim();
        
        if (text) {
            const subtasksList = document.getElementById('subtasksList');
            const subtaskItem = document.createElement('div');
            subtaskItem.className = 'subtask-item';
            subtaskItem.innerHTML = `
                <span>${text}</span>
                <button type="button" class="remove-button">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            subtasksList.appendChild(subtaskItem);
            input.value = '';
        }
    };

    // Gestionnaire des tags
    const addTag = () => {
        const input = document.getElementById('tagInput');
        const text = input.value.trim();
        
        if (text) {
            const tagsList = document.getElementById('tagsList');
            const tagItem = document.createElement('div');
            tagItem.className = 'tag-item';
            tagItem.innerHTML = `
                <span>${text}</span>
                <button type="button" class="remove-button">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            tagsList.appendChild(tagItem);
            input.value = '';
        }
    };

    // Gestionnaire de recherche
    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const tasks = document.querySelectorAll('.task-card');
        
        tasks.forEach(task => {
            const title = task.querySelector('.task-title').textContent.toLowerCase();
            const description = task.querySelector('p').textContent.toLowerCase();
            const isVisible = title.includes(searchTerm) || description.includes(searchTerm);
            task.style.display = isVisible ? 'block' : 'none';
        });
    };

    // Gestionnaire des filtres
    const handleFilter = (e) => {
        const filterType = e.target.dataset.filter;
        filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const tasks = document.querySelectorAll('.task-card');
        tasks.forEach(task => {
            switch(filterType) {
                case 'all':
                    task.style.display = 'block';
                    break;
                case 'today':
                    const dueDate = task.querySelector('.task-date')?.textContent;
                    const isToday = dueDate === new Date().toLocaleDateString();
                    task.style.display = isToday ? 'block' : 'none';
                    break;
                case 'important':
                    const priority = task.querySelector('.task-priority').textContent;
                    task.style.display = priority === 'high' ? 'block' : 'none';
                    break;
                case 'completed':
                    const isCompleted = task.classList.contains('completed');
                    task.style.display = isCompleted ? 'block' : 'none';
                    break;
            }
        });
    };

    // Gestionnaire de stockage local
    const saveTasks = () => {
        const tasks = Array.from(tasksContainer.children).map(taskElement => {
            return {
                title: taskElement.querySelector('.task-title').textContent,
                priority: taskElement.querySelector('.task-priority').textContent,
                description: taskElement.querySelector('p').textContent,
                dueDate: taskElement.querySelector('.fa-calendar') ? 
                    taskElement.querySelector('.fa-calendar').parentElement.textContent.trim() : '',
                subtasks: Array.from(taskElement.querySelectorAll('.subtask-item')).map(subtask => ({
                    text: subtask.querySelector('span').textContent,
                    completed: subtask.querySelector('input').checked
                })),
                tags: Array.from(taskElement.querySelectorAll('.tag')).map(tag => tag.textContent)
            };
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const loadTasks = () => {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            tasksContainer.innerHTML = ''; // Clear existing tasks
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                tasksContainer.appendChild(taskElement);
            });
        }
    };

    // Charger les tâches sauvegardées
    loadTasks();

    // Event Listeners
    addTaskBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalHandler);
    taskModal.querySelector('.modal-overlay').addEventListener('click', closeModalHandler);
    taskForm.addEventListener('submit', handleFormSubmit);
    document.getElementById('addSubtaskBtn').addEventListener('click', addSubtask);
    document.getElementById('addTagBtn').addEventListener('click', addTag);
    searchInput.addEventListener('input', handleSearch);
    themeToggle.addEventListener('click', toggleTheme);
    filterButtons.forEach(btn => btn.addEventListener('click', handleFilter));

    // Délégation d'événements pour les boutons de suppression
    document.addEventListener('click', (e) => {
        if (e.target.closest('.remove-button')) {
            e.target.closest('.subtask-item, .tag-item').remove();
        }
    });
});
