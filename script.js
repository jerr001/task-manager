const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const priorityInput = document.getElementById("priorityInput");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let filteredTasks = tasks;

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function formatDate(date) {
  if (!date) return "No date set";
  const options = { month: "short", day: "numeric", year: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
}

function formatTime(time) {
  if (!time) return "No time set";
  const [hours, minutes] = time.split(":");
  const period = hours >= 12 ? "PM" : "AM";
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours}:${minutes} ${period}`;
}

function renderTasks(taskArray = tasks) {
  taskList.innerHTML = "";
  taskArray.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.draggable = true;
    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${index})" />
      <div class="task-content">
        <span class="priority-label priority-${task.priority.toLowerCase()}">${task.priority}</span>
        <span class="date-label">${formatDate(task.date)}</span>
        <span class="time-label">${formatTime(task.time)}</span>
        <span>${task.text}</span>
      </div>
      <div class="actions">
        <button class="edit" onclick="editTask(${index})">Edit</button>
        <button onclick="deleteTask(${index})">Delete</button>
      </div>
    `;
    li.addEventListener("dragstart", () => li.classList.add("dragging"));
    li.addEventListener("dragend", () => li.classList.remove("dragging"));
    taskList.appendChild(li);
  });
}

taskList.addEventListener("dragover", (e) => {
  e.preventDefault();
  const draggingItem = document.querySelector(".dragging");
  const siblings = [...taskList.querySelectorAll(".task-item:not(.dragging)")];
  const nextSibling = siblings.find(sibling => {
    return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
  });
  taskList.insertBefore(draggingItem, nextSibling);
});

taskList.addEventListener("drop", () => {
  const draggingItem = document.querySelector(".dragging");
  const newOrder = [...taskList.querySelectorAll(".task-item")];
  const reorderedTasks = newOrder.map(item => {
    const text = item.querySelector(".task-content span:last-child").textContent;
    return tasks.find(task => task.text === text);
  });
  tasks = reorderedTasks;
  filteredTasks = tasks;
  saveTasks();
  renderTasks();
});

function addTask() {
  const taskText = taskInput.value.trim();
  const taskDate = dateInput.value;
  const taskTime = timeInput.value;
  if (!taskText) {
    alert("Please enter a task!");
    return;
  }
  const task = {
    text: taskText,
    date: taskDate || null,
    time: taskTime || null,
    priority: priorityInput.value,
    completed: false
  };
  tasks.push(task);
  filteredTasks = tasks;
  saveTasks();
  renderTasks();
  taskInput.value = "";
  dateInput.value = "";
  timeInput.value = "";
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  filteredTasks = tasks;
  saveTasks();
  renderTasks();
}

function editTask(index) {
  const newTaskText = prompt("Edit task:", tasks[index].text);
  const newDate = prompt("Edit date (e.g., 2025-04-30):", tasks[index].date || "");
  const newTime = prompt("Edit time (e.g., 14:30):", tasks[index].time || "");
  const newPriority = prompt("Edit priority (High, Medium, Low):", tasks[index].priority);
  if (newTaskText !== null && newTaskText.trim() !== "") {
    tasks[index].text = newTaskText.trim();
    tasks[index].date = newDate && newDate.match(/^\d{4}-\d{2}-\d{2}$/) ? newDate : tasks[index].date;
    tasks[index].time = newTime && newTime.match(/^\d{2}:\d{2}$/) ? newTime : tasks[index].time;
    tasks[index].priority = ["High", "Medium", "Low"].includes(newPriority) ? newPriority : tasks[index].priority;
    filteredTasks = tasks;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(index) {
  tasks.splice(index, 1);
  filteredTasks = tasks;
  saveTasks();
  renderTasks();
}

function searchTasks() {
  const searchText = searchInput.value.toLowerCase();
  filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(searchText));
  renderTasks(filteredTasks);
}

function clearAllTasks() {
  if (confirm("Are you sure you want to clear all tasks?")) {
    tasks = [];
    filteredTasks = tasks;
    saveTasks();
    renderTasks();
  }
}

renderTasks();