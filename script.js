// --- Data Initialization ---
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [
  "Shopping",
  "Work",
  "Personal",
];

// Aesthetic Icons Mapping
const aestheticIcons = {
  Work: "📄",
  Shopping: "🛍️",
  Personal: "🎀",
  General: "📝",
  Meetings: "🤝",
  Bills: "💸",
};

// --- DOM Elements ---
const todoInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const dateDisplay = document.getElementById("date-display");
const categoryListUI = document.getElementById("category-list");
const newCategoryInput = document.getElementById("new-category-name");
const addCategoryBtn = document.getElementById("add-category-btn");

let currentCategory = "all";

// --- Date Display ---
const options = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
};
dateDisplay.innerText = new Date().toLocaleDateString("en-US", options);

// --- Task Rendering Function ---
function renderTasks(filter = "all") {
  todoList.innerHTML = "";

  const filteredTodos = todos.filter((todo) => {
    // GLOBAL FILTER: Agar "all" hai toh sab dikhao
    if (filter === "all") return true;

    // STATUS FILTERS: Completed, Incomplete, In-Progress
    if (["completed", "incomplete", "in-progress"].includes(filter)) {
      return todo.status === filter;
    }

    // CATEGORY FILTERS: Shopping, Work, etc.
    return todo.category === filter;
  });

  if (filteredTodos.length === 0) {
    todoList.innerHTML = `<p style="text-align:center; color:#999; margin-top:20px;">No tasks found here. ✨</p>`;
  } else {
    filteredTodos.forEach((todo) => {
      const actualIndex = todos.findIndex((t) => t === todo);
      const li = document.createElement("li");
      li.className = `todo-item ${todo.status}`;

      const icon = aestheticIcons[todo.category] || "📝";
      const taskContent = todo.isEditing
        ? `<input type="text" id="edit-input-${actualIndex}" class="edit-mode-input" value="${todo.text}" onkeypress="handleEditKey(event, ${actualIndex})">`
        : `<span style="font-weight: 600; display:block;">${todo.text}</span>`;

      const editActionHtml = todo.isEditing
        ? `<i class="fa-solid fa-floppy-disk" style="color: #2ecc71; cursor:pointer;" onclick="saveEdit(${actualIndex})"></i>`
        : todo.status !== "completed"
          ? `<i class="fa-solid fa-pen-to-square" style="color: #3498db; cursor:pointer;" onclick="toggleEdit(${actualIndex})"></i>`
          : "";

      li.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                    <span style="font-size:1.2rem;">${icon}</span>
                    <div style="flex:1;">
                        ${taskContent}
                        <small style="font-size:10px; color:#aaa; text-transform:uppercase;">${todo.category || "General"}</small>
                    </div>
                </div>
                <div class="actions" style="display:flex; gap:12px; align-items:center;">
                    ${editActionHtml}
                    <i class="fa-solid fa-spinner ${todo.status === "in-progress" ? "fa-spin" : ""}" 
                       style="color: #f39c12; cursor:pointer;" onclick="updateStatus(${actualIndex}, 'in-progress')"></i>
                    <i class="fa-solid fa-circle-check" 
                       style="color: ${todo.status === "completed" ? "#2ecc71" : "#ccc"}; cursor:pointer;" onclick="updateStatus(${actualIndex}, 'completed')"></i>
                    <i class="fa-solid fa-trash" style="cursor:pointer;" onclick="deleteTask(${actualIndex})"></i>
                </div>`;
      todoList.appendChild(li);
    });
  }
  localStorage.setItem("todos", JSON.stringify(todos));
}

// --- Category Functions ---
function renderCategories() {
  categoryListUI.innerHTML = "";
  categories.forEach((cat) => {
    const div = document.createElement("div");
    div.className = "category-item-container";

    const btn = document.createElement("button");
    // FIX: currentCategory match logic
    btn.className = `filter-btn ${currentCategory === cat ? "active" : ""}`;

    const icon = aestheticIcons[cat] || "📁";
    btn.innerHTML = `<span class="aesthetic-icon">${icon}</span> ${cat}`;

    btn.onclick = () => {
      currentCategory = cat; // Category update
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderTasks(cat);
    };

    const delBtn = document.createElement("i");
    delBtn.className = "fa-solid fa-trash-can delete-category-btn";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      showInlineConfirm(div, cat);
    };

    div.appendChild(btn);
    div.appendChild(delBtn);
    categoryListUI.appendChild(div);
  });
  localStorage.setItem("categories", JSON.stringify(categories));
}

function showInlineConfirm(container, catName) {
  container.innerHTML = `
        <div class="inline-confirm-box">
            <span>Delete?</span>
            <div style="display:flex; gap:8px;">
                <i class="fa-solid fa-check confirm-yes" title="Yes"></i>
                <i class="fa-solid fa-xmark confirm-no" title="No"></i>
            </div>
        </div>
    `;

  container.querySelector(".confirm-yes").onclick = (e) => {
    e.stopPropagation();
    categories = categories.filter((c) => c !== catName);
    todos = todos.filter((t) => t.category !== catName);
    if (currentCategory === catName) currentCategory = "all";
    renderCategories();
    renderTasks(currentCategory);
    showToast("List Deleted!");
  };

  container.querySelector(".confirm-no").onclick = (e) => {
    e.stopPropagation();
    renderCategories();
  };
}

// --- Event Listeners & Helpers ---
addCategoryBtn.addEventListener("click", () => {
  const name = newCategoryInput.value.trim();
  if (name && !categories.includes(name)) {
    categories.push(name);
    newCategoryInput.value = "";
    renderCategories();
    showToast("New List Added!");
  }
});

function toggleEdit(index) {
  todos[index].isEditing = true;
  renderTasks(currentCategory);
  setTimeout(() => {
    const input = document.getElementById(`edit-input-${index}`);
    if (input) input.focus();
  }, 10);
}

function saveEdit(index) {
  const editInput = document.getElementById(`edit-input-${index}`);
  if (editInput) {
    const newText = editInput.value.trim();
    if (newText.length >= 2) {
      todos[index].text = newText;
      todos[index].isEditing = false;
      renderTasks(currentCategory);
      showToast("Task Updated!");
    } else {
      showToast("Text too short!");
    }
  }
}

function handleEditKey(event, index) {
  if (event.key === "Enter") saveEdit(index);
}

function updateStatus(index, newStatus) {
  todos[index].status =
    todos[index].status === newStatus ? "incomplete" : newStatus;
  renderTasks(currentCategory);
}

function deleteTask(index) {
  todos.splice(index, 1);
  renderTasks(currentCategory);
  showToast("Task Deleted!");
}

addBtn.addEventListener("click", () => {
  const text = todoInput.value.trim();
  if (text.length < 2) return showToast("Task too short!");

  // FIX: Category selection logic
  const statusFilters = ["all", "completed", "incomplete", "in-progress"];
  const categoryToSave = statusFilters.includes(currentCategory)
    ? "General"
    : currentCategory;

  todos.push({
    text,
    status: "incomplete",
    category: categoryToSave,
    isEditing: false,
  });
  todoInput.value = "";
  renderTasks(currentCategory);
  showToast(`Task Added to ${categoryToSave}!`);
});

todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addBtn.click();
});

function showToast(message) {
  const toast = document.getElementById("simple-toast");
  if (toast) {
    toast.innerText = message;
    toast.classList.add("toast-show");
    setTimeout(() => toast.classList.remove("toast-show"), 2500);
  }
}

// Main Sidebar Menu Filters
document.querySelectorAll(".menu .filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.filter;
    renderTasks(currentCategory);
  });
});

// Initial Render
renderCategories();
renderTasks("all");
