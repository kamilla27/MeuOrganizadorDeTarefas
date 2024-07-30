document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const dueDateInput = document.getElementById('dueDateInput');
    const categoryInput = document.getElementById('categoryInput');
    const taskList = document.getElementById('taskList');
    const feedbackMessage = document.getElementById('feedbackMessage');

    const searchInput = document.getElementById('searchInput');
    const filterPriority = document.getElementById('filterPriority');
    const filterDueDate = document.getElementById('filterDueDate');

    // Carregar tarefas do armazenamento local
    loadTasks();

    // Adicionar tarefa ao enviar o formulário
    taskForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o envio do formulário padrão

        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        const dueDate = dueDateInput.value;
        const category = categoryInput.value.trim();

        if (taskText === '') {
            displayFeedback('Por favor, insira uma descrição para a tarefa.', 'error');
            return;
        }

        addTask(taskText, priority, dueDate, category);
        taskInput.value = '';
        prioritySelect.value = 'low';
        dueDateInput.value = '';
        categoryInput.value = '';

        displayFeedback('Tarefa adicionada com sucesso!', 'success');
    });

    // Adicionar tarefa ao pressionar Enter
    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Impede o comportamento padrão de envio do formulário
            taskForm.requestSubmit(); // Envia o formulário
        }
    });

    // Função para adicionar uma tarefa
    function addTask(text, priority = 'low', dueDate = '', category = '') {
        const li = document.createElement('li');

        // Criar elementos da tarefa
        const prioritySpan = document.createElement('span');
        prioritySpan.classList.add('task-priority', priority);
        prioritySpan.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);

        const taskContent = document.createElement('span');
        taskContent.textContent = `${text} ${dueDate ? `- Vencimento: ${dueDate}` : ''}`;

        const categorySpan = document.createElement('span');
        categorySpan.classList.add('task-category');
        categorySpan.textContent = category ? ` (${category})` : '';

        li.appendChild(prioritySpan);
        li.appendChild(taskContent);
        li.appendChild(categorySpan);

        // Criar e adicionar ações para editar e excluir
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('task-actions');
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.addEventListener('click', function() {
            const newText = prompt('Edite sua tarefa:', text);
            const newDueDate = prompt('Edite a data de vencimento (YYYY-MM-DD):', dueDate);
            const newCategory = prompt('Edite a categoria:', category);
            if (newText !== null && newText.trim() !== '') {
                taskContent.textContent = `${newText.trim()} ${newDueDate ? `- Vencimento: ${newDueDate}` : ''}`;
                categorySpan.textContent = newCategory ? ` (${newCategory})` : '';
                saveTasks();
            }
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.addEventListener('click', function() {
            if (confirm('Tem certeza de que deseja excluir esta tarefa?')) {
                li.remove();
                saveTasks();
            }
        });

        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        li.appendChild(actionsDiv);

        // Adicionar funcionalidade para marcar como concluída
        li.addEventListener('click', function() {
            li.classList.toggle('completed');
            saveTasks();
        });

        // Adicionar a nova tarefa à lista
        taskList.appendChild(li);
        saveTasks();
        filterTasks(); // Refiltra as tarefas após adicionar uma nova
    }

    // Função para mostrar feedback para o usuário
    function displayFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = type;
        setTimeout(() => feedbackMessage.textContent = '', 3000); // Limpa a mensagem após 3 segundos
    }

    // Função para salvar tarefas no armazenamento local
    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(function(li) {
            tasks.push({
                text: li.querySelector('span').textContent.split(' - ')[0],
                priority: li.querySelector('.task-priority').classList[1],
                completed: li.classList.contains('completed'),
                dueDate: li.querySelector('span').textContent.includes('Vencimento: ') ?
                          li.querySelector('span').textContent.split('Vencimento: ')[1] : '',
                category: li.querySelector('.task-category').textContent.replace(/\(|\)/g, '').trim()
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Função para carregar tarefas do armazenamento local
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(function(task) {
            addTask(task.text, task.priority, task.dueDate, task.category);
            if (task.completed) {
                taskList.lastChild.classList.add('completed');
            }
        });
        filterTasks(); // Aplica filtros carregados
    }

    // Função para filtrar tarefas
    function filterTasks() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedPriority = filterPriority.value;
        const selectedDueDate = filterDueDate.value;

        taskList.querySelectorAll('li').forEach(function(li) {
            const text = li.querySelector('span').textContent.toLowerCase();
            const priority = li.querySelector('.task-priority').classList[1];
            const dueDate = li.querySelector('span').textContent.split('Vencimento: ')[1] || '';

            const matchesSearch = text.includes(searchTerm);
            const matchesPriority = !selectedPriority || priority === selectedPriority;
            const matchesDueDate = !selectedDueDate || dueDate === selectedDueDate;

            if (matchesSearch && matchesPriority && matchesDueDate) {
                li.style.display = '';
            } else {
                li.style.display = 'none';
            }
        });
    }

    // Adicionar eventos de filtro
    searchInput.addEventListener('input', filterTasks);
    filterPriority.addEventListener('change', filterTasks);
    filterDueDate.addEventListener('change', filterTasks);
});

