// Fetch all todos on page load
window.onload = function () {
    fetchTodos();
};
let updateId = ''

let options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };

// Fetch All todos from backend
function fetchTodos() {
    fetch('/api/todos')
        .then(response => response.json())  // After the POST request is made, the server returns a response and we parses the response body as JSON
        .then(data => {
            const todoList = document.getElementById('todoList');
            todoList.innerHTML = '';
            if (data.message == 'todos not found') {
                todoList.innerHTML = 'Todos Not Found';
            } else {
                data.forEach(todo => {
                    todoList.innerHTML += `
                        <li class="list-group-item d-flex justify-content-between align-items-center" key=${todo._id.$oid}>
                            <div class="w-50 pe-5">
                                ${updateId == todo._id.$oid ? `<input 
                                        type="text" 
                                        id="changeTask"
                                        value="${todo.task}" />` `<button class="btn btn-warning">Update</button>` : ''
                        }
                                
                                <h5 ${todo.completed == "Completed" ? 'style="text-decoration:line-through;"' : ""}>${todo.task}</h5>
                                <div class="d-flex flex-wrap">
                                    <span class="text-sm">Created At: ${todo.created_at}</span>
                                    <span class="text-sm mx-5">Updated At: ${todo.updated_at}</span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between w-50">
                                <div class="mx-2">
                                    Status : ${todo.completed == "Completed" ? `<span class="text-sm btn-success p-1 btn rounded-lg cursor-text">Completed</span>`
                                        : (todo.completed == "Delayed" ? `<span class="text-sm rounded-lg p-1 btn btn-danger cursor-text">Delayed</span>` : 
                                        `<span class="text-sm rounded-lg p-1 btn btn-warning cursor-text">In-Progress</span>`)}
                                </div>
                                <div class="d-flex justify-content-between">
                                    ${todo.completed !== 'Completed' ?
                                    `<select class="border border-dark-subtle rounded rounded-4 mx-5" value=${todo.completed} onChange="toggleStatus('${todo._id.$oid}', value)">
                                            <option value="In-Progress" ${todo.completed === 'In-Progress' ? 'selected' : ''}>In-Progress</option>
                                            <option value="Completed" ${todo.completed === 'Completed' ? 'selected' : ''}>Mark as Done</option>
                                            <option value="Delayed" ${todo.completed === 'Delayed' ? 'selected' : ''}>Delayed</option>
                                        </select>
                                        <div class="flex justify-content-start my-2 ms-4" >
                                        <button class="btn btn-primary btn-sm ms-4" onclick="editTodo('${todo.task}', '${todo._id.$oid}')">Edit</button>` : ''
                                    }
                                        <button class="btn btn-danger btn-sm me-4" onclick="deleteTodo('${todo._id.$oid}')">Delete</button>
                                        </div>
                                </div>
                            </div>
                        </li >
                    `;
                });
            }
        });
}

// Add a new todo on Form Submit or Todo Edit
document.getElementById('addTodoForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const taskInput = document.getElementById('taskInput').value;
    if (updateId == '') {
        if (taskInput.length >= 5 && taskInput.length <= 100) {
            fetch('/api/todos', {
                method: 'POST',
                headers: {                                     
                    'Content-Type': 'application/json',         // this ensures that the server can parse the data correctly
                },
                body: JSON.stringify(                   // server need the request body should be a string for POST Request 
                    {
                        task: taskInput,
                        created_at: new Date().toLocaleString('en-US', options).replace(',', ''),      // this function formats the date and time based on locale and converts time into 12 hrs format
                        completed: "In-Progress",
                        updated_at: new Date().toLocaleString('en-US', options).replace(',', '')
                    }),
            })
            .then(response => response.json())
            .then(data => {
                updateId = ''
                document.getElementById('taskInput').value = '';
                fetchTodos();
            });
        }else{
            alert('Task must be between 5 and 100 characters.');
        }
    }
    else {
        if (taskInput.length >= 5 && taskInput.length <= 100) {
            fetch(`/api/editTodo/${updateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    {
                        task: taskInput,
                        updated_at: new Date().toLocaleString('en-US', options).replace(',', '')
                    }),
            })
                .then(response => response.json())
                .then(data => {
                    updateId = ''
                    document.getElementById('taskInput').value = '';
                    fetchTodos();
                });
        }else{
            alert('Task must be between 5 and 100 characters.');
        }
    }
    cleanForm();
});


// Reusable function to clear values
function cleanForm() {
    const updateControls = document.getElementById("updateControls");
    updateControls.className = 'col-8 d-none';
    const addTodo = document.getElementById("addTodo")
    addTodo.className = 'col-8'
    updateId = ''
}

document.getElementById("resetBtn").addEventListener("click", () => {
    cleanForm()
});

// Edit Todos Tasks value
function editTodo(task, updid) {
    updateId = ''
    const inputField = document.getElementById("taskInput");
    if (inputField) {
        inputField.value = task;
    }
    const addTodo = document.getElementById("addTodo")
    addTodo.className = 'col-8 d-none'
    const updateTodo = document.getElementById("updateControls")
    updateTodo.className = 'col-8'
    updateId = updid
}

// Toggle todo change status by its id and status
function toggleStatus(id, status) {
    try {
        fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: status, updatedAt: new Date().toLocaleString('en-US', options).replace(',', '') })
        })
            .then(response => response.json())
            .then(data => fetchTodos());
    } catch (error) {
        console.log(error);
    }
}


// Delete a todo by providing id
function deleteTodo(id) {
    try {
        fetch(`/api/todos/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => fetchTodos());
    } catch (error) {
        console.log(error);
    }
}