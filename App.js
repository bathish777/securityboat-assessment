const socket = io();

const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const tasksDiv = document.getElementById('tasks');

socket.on('task-created', (task) => {
  // Handle a new task created event
  // Add the task to the tasksDiv
  appendTask(task);
});

socket.on('task-updated', (task) => {
  // Handle a task updated event
  // Update the UI to reflect the changes
  updateTask(task);
});

socket.on('task-deleted', (taskId) => {
  // Handle a task deleted event
  // Remove the task from the tasksDiv
  removeTask(taskId);
});

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value;
  const description = descriptionInput.value;

  // Send a request to the server to create a new task
  socket.emit('create-task', { title, description });

  // Clear the form inputs
  titleInput.value = '';
  descriptionInput.value = '';
});

function appendTask(task) {
  const taskElement = document.createElement('div');
  taskElement.innerHTML = `
    <div>
      <strong>Title:</strong> ${task.title}
    </div>
    <div>
      <strong>Description:</strong> ${task.description}
    </div>
  `;
  tasksDiv.appendChild(taskElement);
}

function updateTask(task) {
  const taskElements = document.querySelectorAll('.task');
  for (const element of taskElements) {
    if (element.dataset.id === task._id) {
      element.innerHTML = `
        <div>
          <strong>Title:</strong> ${task.title}
        </div>
        <div>
          <strong>Description:</strong> ${task.description}
        </div>
      `;
      break;
    }
  }
}

function removeTask(taskId) {
  const taskElement = document.querySelector(`[data-id="${taskId}"]`);
  if (taskElement) {
    taskElement.remove();
  }
}
