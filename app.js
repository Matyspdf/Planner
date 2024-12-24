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
        // Réinitialiser le formulaire
        taskForm.reset();
        document.getElementById('subtasksList').innerHTML = '';
        document.getElementById('tagsList').innerHTML = '';
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
        taskElement.dataset.id = task.id || Date.now();
        
        // Ajouter le bouton de suppression
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-task-btn';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.onclick = () => {
            taskElement.remove();
            saveTasks();
        };

        // Ajouter le bouton de modification
        const editButton = document.createElement('button');
        editButton.className = 'edit-task-btn';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.onclick = () => {
            // Logique pour éditer la tâche
            openModal();
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate;
            
            // Charger les sous-tâches
            const subtasksList = document.getElementById('subtasksList');
            subtasksList.innerHTML = '';
            task.subtasks.forEach(subtask => {
                const subtaskElement = document.createElement('div');
                subtaskElement.className = 'subtask-item';
                subtaskElement.innerHTML = `
                    <span>${subtask.text}</span>
                    <button class="remove-item"><i class="fas fa-times"></i></button>
                `;
                subtasksList.appendChild(subtaskElement);
            });

            // Charger les tags
            const tagsList = document.getElementById('tagsList');
            tagsList.innerHTML = '';
            task.tags.forEach(tag => {
                const tagElement = document.createElement('div');
                tagElement.className = 'tag-item';
                tagElement.innerHTML = `
                    <span>${tag}</span>
                    <button class="remove-item"><i class="fas fa-times"></i></button>
                `;
                tagsList.appendChild(tagElement);
            });
        };

        taskElement.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
            <p class="task-description">${task.description || ''}</p>
            ${task.dueDate ? `<p class="task-date"><i class="far fa-calendar"></i> ${task.dueDate}</p>` : ''}
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
            <div class="task-actions"></div>
        `;

        // Ajouter les boutons à la div des actions
        taskElement.querySelector('.task-actions').appendChild(editButton);
        taskElement.querySelector('.task-actions').appendChild(deleteButton);

        // Ajouter les event listeners pour les checkbox des sous-tâches
        taskElement.querySelectorAll('.subtask-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => saveTasks());
        });

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
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            subtasks: Array.from(document.querySelectorAll('#subtasksList .subtask-item'))
                .map(item => ({
                    text: item.querySelector('span').textContent,
                    completed: false
                })),
            tags: Array.from(document.querySelectorAll('#tagsList .tag-item'))
                .map(item => item.querySelector('span').textContent)
        };

        addTask(task);
        closeModalHandler();
        taskForm.reset();
        document.getElementById('subtasksList').innerHTML = '';
        document.getElementById('tagsList').innerHTML = '';
    };

    // Gestionnaire des sous-tâches
    const addSubtask = () => {
        const subtaskInput = document.getElementById('subtaskInput');
        const subtaskText = subtaskInput.value.trim();
        
        if (subtaskText) {
            const subtaskElement = document.createElement('div');
            subtaskElement.className = 'subtask-item';
            subtaskElement.innerHTML = `
                <span>${subtaskText}</span>
                <button class="remove-item"><i class="fas fa-times"></i></button>
            `;
            document.getElementById('subtasksList').appendChild(subtaskElement);
            subtaskInput.value = '';
        }
    };

    // Gestionnaire des tags
    const addTag = () => {
        const tagInput = document.getElementById('tagInput');
        const tagText = tagInput.value.trim();
        
        if (tagText) {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                <span>${tagText}</span>
                <button class="remove-item"><i class="fas fa-times"></i></button>
            `;
            document.getElementById('tagsList').appendChild(tagElement);
            tagInput.value = '';
        }
    };

    // Gestionnaire de recherche
    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const tasks = document.querySelectorAll('.task-card');
        
        tasks.forEach(task => {
            const title = task.querySelector('.task-title').textContent.toLowerCase();
            const description = task.querySelector('.task-description').textContent.toLowerCase();
            const isVisible = title.includes(searchTerm) || description.includes(searchTerm);
            task.style.display = isVisible ? 'block' : 'none';
        });
    };

    // Gestionnaire des filtres
    const handleFilter = (e) => {
        const filter = e.target.dataset.filter;
        filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const tasks = document.querySelectorAll('.task-card');
        tasks.forEach(task => {
            const priority = task.querySelector('.task-priority').textContent.toLowerCase();
            
            switch(filter) {
                case 'all':
                    task.style.display = 'block';
                    break;
                case 'high':
                case 'medium':
                case 'low':
                    task.style.display = priority === filter ? 'block' : 'none';
                    break;
            }
        });
    };

    // Gestionnaire de stockage local
    const saveTasks = () => {
        const tasks = Array.from(tasksContainer.children).map(taskElement => {
            return {
                id: taskElement.dataset.id,
                title: taskElement.querySelector('.task-title').textContent,
                description: taskElement.querySelector('.task-description').textContent,
                priority: taskElement.querySelector('.task-priority').textContent,
                dueDate: taskElement.querySelector('.task-date') ? 
                    taskElement.querySelector('.task-date').textContent.replace('calendar', '').trim() : '',
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

    // Event Listeners
    addTaskBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalHandler);
    taskModal.querySelector('.modal-overlay').addEventListener('click', closeModalHandler);
    taskForm.addEventListener('submit', handleFormSubmit);
    document.getElementById('addSubtaskBtn').addEventListener('click', addSubtask);
    document.getElementById('addTagBtn').addEventListener('click', addTag);
    searchInput.addEventListener('input', handleSearch);
    filterButtons.forEach(btn => btn.addEventListener('click', handleFilter));
    themeToggle.addEventListener('click', toggleTheme);

    // Gestionnaire pour supprimer les sous-tâches et tags
    document.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item')) {
            e.target.closest('.subtask-item, .tag-item').remove();
        }
    });

    // Charger les tâches au démarrage
    loadTasks();
});
