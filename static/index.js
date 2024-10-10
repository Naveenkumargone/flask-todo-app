// Fetch all todos on page load
window.onload = function () {
    fetchTodos();
};
let updateId = ''
let options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
document.getElementById('resetBtn').style.display = 'none'
document.getElementById('updateTodo').style.display = 'none'

// Fetch todos from backend
function fetchTodos() {
    fetch('/api/todos')
        .then(response => response.json())
        .then(data => {
            const todoList = document.getElementById('todoList');
            todoList.innerHTML = '';
            if (data.message == 'todos not found') {
                todoList.innerHTML = 'Todos Not Found';
            } else {
                data.forEach(todo => {
                    todoList.innerHTML += `
                        <li class="list-group-item d-flex justify-content-between align-items-center" key=${todo._id.$oid}>
                            <div>
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
                            <div>
                               Status : ${todo.completed == "Completed" ? `<span class="text-sm btn-success p-1 rounded-lg">Completed</span>` : `<span class="text-sm rounded-lg p-1 btn-warning">In-Progress</span>`}
                            </div>
                            <div>
                                ${todo.completed !== 'Completed' ?
                            `<button class="btn btn-success btn-sm" onclick="toggleComplete('${todo._id.$oid}', 'Completed')">Mark as Done</button>
                                    <button class="btn btn-warning btn-sm" onclick="toggleComplete('${todo._id.$oid}', 'In-Progress')">In-Progress</button>
                                    <button class="btn btn-danger btn-sm " onclick="toggleComplete('${todo._id.$oid}', 'Delayed')">Delayed</button>
                                    <div class="flex justify-content-start my-2" >
                                        <button class="btn btn-primary btn-sm ms-3" onclick="editTodo('${todo.task}', '${todo._id.$oid}')">Edit</button>` : ''}
                                        <button class="btn btn-danger btn-sm" onclick="deleteTodo('${todo._id.$oid}')">Delete</button>
                                    </div>
                            </div>
                        </li>
                    `;
                });
            }
        });
}

// Add a new todo
document.getElementById('addTodoForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const taskInput = document.getElementById('taskInput').value;
    if (updateId == '') {
        const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    task: taskInput,
                    created_at: new Date().toLocaleString('en-US', options).replace(',', ''),
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
    }
    if (updateId != '') {
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
    }
    cleanForm();
});


function updateTask(todoId, newTask) {
    // Make a PUT request to update the task
    fetch(`/api/edittodo/${todoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task: newTask }) // Send the updated task title
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Task updated successfully:', data);
        })
        .catch((error) => {
            console.error('Error updating task:', error);
        });
}

function cleanForm() {
    document.getElementById("updateTodo").style.display = 'none'
    document.getElementById("resetBtn").style.display = 'none'
    document.getElementById("addTodo").style.display = 'block'
    updateId = ''
}

document.getElementById("resetBtn").addEventListener("click", () => {
    cleanForm()
});

// Toggle todo completion status
function editTodo(task, updid) {
    updateId = ''
    const inputField = document.getElementById("taskInput");
    if (inputField) {
        inputField.value = task;
    }
    document.getElementById("updateTodo").style.display = 'block'
    document.getElementById("resetBtn").style.display = 'block'

    updateId = updid
    const addTodo = document.getElementById("addTodo")
    addTodo.style.display = 'none'
}

// Toggle todo completion status
function toggleComplete(id, status) {
    console.log(id, status);
    fetch(`/api/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: status, updatedAt: new Date().toLocaleString('en-US', options).replace(',', '') })
    })
        .then(response => response.json())
        .then(data => fetchTodos());
}

// Delete a todo
function deleteTodo(id) {
    fetch(`/api/todos/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => fetchTodos());
}