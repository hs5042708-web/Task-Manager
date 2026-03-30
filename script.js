// 1. Data Load karna
let todos = JSON.parse(localStorage.getItem("todos")) || [];
const todoInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const dateDisplay = document.getElementById("date-display");

// Aaj ki Date
const options = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
};
dateDisplay.innerText = new Date().toLocaleDateString("en-US", options);

// 2. Task Render karne wala function
function renderTasks(filter = "all") {
  todoList.innerHTML = "";

  // Filtered list nikalna
  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed;
    if (filter === "incomplete") return !todo.completed;
    return true;
  });

  // --- UPDATED LOGIC: Empty State Check ---
  // Agar 'All Tasks' selected ho aur koi bhi incomplete task na bacha ho
  const incompleteCount = todos.filter((t) => !t.completed).length;

  if (filter === "all" && incompleteCount === 0 && todos.length > 0) {
    todoList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-mug-hot" style="font-size: 50px; color: #3498db; margin-bottom: 15px;"></i>
                <h2 style="color: #2c3e50;">All Done! Enjoy! ✨</h2>
                <p style="color: #7f8c8d;">You have completed all your tasks for now.</p>
            </div>
        `;
  }
  // Agar list bilkul hi empty hai (start mein)
  else if (todos.length === 0) {
    todoList.innerHTML = `<p style="text-align:center; color:#999; margin-top:20px;">No tasks added yet. Start by adding one!</p>`;
  }
  // Agar tasks hain, to render karo
  else {
    filteredTodos.forEach((todo, index) => {
      const li = document.createElement("li");
      li.className = `todo-item ${todo.completed ? "completed" : ""}`;

      li.innerHTML = `
                <span>${todo.text}</span>
                <div class="actions" style="position: relative;">
                    <i class="fa-solid fa-circle-check" onclick="toggleComplete(${index})"></i>
                    <i class="fa-solid fa-pen" onclick="showEditPopup(${index})"></i>
                    <i class="fa-solid fa-trash" onclick="showConfirmPopup(${index})"></i>
                    
                    <div class="action-popup" id="edit-popup-${index}" style="display:none;">
                        <input type="text" id="edit-input-${index}" value="${todo.text}" class="edit-input-field">
                        <button class="btn-confirm" onclick="saveEdit(${index})">Save</button>
                        <button class="btn-cancel" onclick="hideAllPopups()">X</button>
                    </div>

                    <div class="action-popup" id="delete-popup-${index}" style="display:none;">
                        <span>Delete?</span>
                        <button class="btn-confirm" style="background:#e74c3c" onclick="deleteTask(${index})">Yes</button>
                        <button class="btn-cancel" onclick="hideAllPopups()">No</button>
                    </div>
                </div>
            `;
      todoList.appendChild(li);
    });
  }
  localStorage.setItem("todos", JSON.stringify(todos));
}

// 3. Popup Controls
function showEditPopup(index) {
  hideAllPopups();
  const popup = document.getElementById(`edit-popup-${index}`);
  popup.style.display = "flex";
  const input = document.getElementById(`edit-input-${index}`);
  input.focus();
  input.select();
}

function showConfirmPopup(index) {
  hideAllPopups();
  const popup = document.getElementById(`delete-popup-${index}`);
  popup.style.display = "flex";
}

function hideAllPopups() {
  document
    .querySelectorAll(".action-popup")
    .forEach((p) => (p.style.display = "none"));
}

// 4. Logic Functions
function saveEdit(index) {
  const input = document.getElementById(`edit-input-${index}`);
  const newText = input.value.trim();
  if (newText !== "") {
    todos[index].text = newText;
    renderTasks();
    showToast("Task Updated!");
  }
}

function deleteTask(index) {
  todos.splice(index, 1);
  renderTasks();
  showToast("Task Deleted!");
}

function toggleComplete(index) {
  todos[index].completed = !todos[index].completed;
  renderTasks();
}

function showToast(message) {
  const toast = document.getElementById("simple-toast");
  toast.innerText = message;
  toast.className = "toast-hidden toast-show";
  setTimeout(() => {
    toast.className = "toast-hidden";
  }, 2000);
}

// 5. Add Task
addBtn.addEventListener("click", () => {
  const text = todoInput.value.trim();
  if (text) {
    todos.push({ text, completed: false });
    todoInput.value = "";
    renderTasks();
    showToast("Task Added!");
  }
});

// 6. Filters
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active").classList.remove("active");
    btn.classList.add("active");
    renderTasks(btn.dataset.filter);
  });
});

renderTasks();
