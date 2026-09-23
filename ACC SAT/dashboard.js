//Dashboard Script - Joshua George (ACC SAT)
//================

//Default Tasks
const startingTasks = [
  {
    id: 1,
    title: "TASK 1",
    duration: "2 days",
    info: "Create login screen",
    requirements: [
      {
        text: "Task Requirement 1",
        status: "COMPLETED"
      },
      {
        text: "Task Requirement 2",
        status: "COMPLETED"
      },
      {
        text: "Task Requirement 3",
        status: "IN PROGRESS"
      },
      {
        text: "Task Requirement 4",
        status: "IN PROGRESS"
      },
      {
        text: "Task Requirement 5",
        status: "NOT STARTED"
      }
    ]
  },
  {
    id: 2,
    title: "TASK 2",
    duration: "3 days",
    info: "Create dashboard",
    requirements: [
      {
        text: "Create dashboard cards",
        status: "IN PROGRESS"
      },
      {
        text: "Make cards clickable",
        status: "NOT STARTED"
      }
    ]
  },
  {
    id: 3,
    title: "TASK 3",
    duration: "2 days",
    info: "Test the software",
    requirements: [
      {
        text: "Test login",
        status: "NOT STARTED"
      },
      {
        text: "Test task page",
        status: "NOT STARTED"
      }
    ]
  }
];

//Local Storage Function
function saveTasks(tasks) {
  localStorage.setItem(
    "teamdeckTasks",
    JSON.stringify(tasks)
  );
}

//Load Tasks from Local Storage (or use defaults)
function loadTasks() {
  const savedTasks = localStorage.getItem("teamdeckTasks");

  if (savedTasks === null) {
    saveTasks(startingTasks);
    return startingTasks;
  }

  return JSON.parse(savedTasks);
}

//Validate Task Edit Input
function validateTask(title, duration, info) {
  const errors = [];

  if (title.trim() === "") {
    errors.push("Task title cannot be empty.");
  } else if (title.trim().length < 3) {
    errors.push("Task title must contain at least 3 characters.");
  }

  if (duration.trim() === "") {
    errors.push("Duration cannot be empty.");
  } else if (isNaN(duration)) {
    errors.push("Duration must be a number.");
  } else if (Number(duration) < 1 || Number(duration) > 365) {
    errors.push(
      "Duration must be between 1 and 365 days."
    );
  } else if (!Number.isInteger(Number(duration))) {
    errors.push("Duration must be a whole number of days.");
  } 

  if (info.trim() === "") {
    errors.push("Task information cannot be empty.");
  }

  return errors;
}

//Get Next Task ID
function getNextTaskId() {
  if (tasks.length === 0) {
    return 1;
  }

  const taskIds = tasks.map(function (task) {
    return task.id;
  });

  return Math.max(...taskIds) + 1;
}

//Clear Task Form
function clearTaskForm() {
  newTaskTitle.value = "";
  newTaskDuration.value = "";
  newTaskInfo.value = "";
  formMessage.textContent = "";
}

//========================
//Dashboard Element Constants
//========================
const taskCards = document.getElementById("taskCards");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const addButton = document.getElementById("addButton");

const deleteButton = document.getElementById("deleteButton");

let deleteMode = false;

const taskForm = document.getElementById("taskForm");
const saveTaskButton = document.getElementById("saveTaskButton");
const cancelTaskButton = document.getElementById("cancelTaskButton");

const newTaskTitle = document.getElementById("newTaskTitle");
const newTaskDuration = document.getElementById("newTaskDuration");
const newTaskInfo = document.getElementById("newTaskInfo");

const formMessage = document.getElementById("formMessage");
const dashboardMessage =
  document.getElementById("dashboardMessage");

const overallProgressFill =
  document.getElementById("overallProgressFill");

const overallProgressText =
  document.getElementById("overallProgressText");

const addUserButton =
  document.getElementById("addUserButton");

const editUserButton =
  document.getElementById("editUserButton");

const deleteUserButton =
  document.getElementById("deleteUserButton");

const userMessage =
  document.getElementById("userMessage");

function calculateProgress(task) {
  if (task.requirements.length === 0) {
    return 0;
  }

  const completedRequirements = task.requirements.filter(
    function (requirement) {
      return requirement.status === "COMPLETED";
    }
  );

  const progress =
    completedRequirements.length / task.requirements.length * 100;

  return Math.round(progress);
}

function calculateOverallProgress() {
  let totalRequirements = 0;
  let completedRequirements = 0;

  tasks.forEach(function (task) {
    totalRequirements += task.requirements.length;

    task.requirements.forEach(function (requirement) {
      if (requirement.status === "COMPLETED") {
        completedRequirements += 1;
      }
    });
  });

  if (totalRequirements === 0) {
    return 0;
  }

  return Math.round(
    completedRequirements / totalRequirements * 100
  );
}

function updateOverallProgress() {
  const overallProgress = calculateOverallProgress();

  overallProgressFill.style.width = overallProgress + "%";

  overallProgressText.textContent = overallProgress + "%";
}

function renderTaskCards(tasksToDisplay) {
  taskCards.innerHTML = "";

  if (tasksToDisplay.length === 0) {
    taskCards.innerHTML = "<p>No tasks found.</p>";
    return;
  }

  tasksToDisplay.forEach(function (task) {
    const progress = calculateProgress(task);

    const card = document.createElement("div");
    card.classList.add("task-card");
    card.dataset.taskId = task.id;

    card.innerHTML = `
      <div class="task-preview"></div>

      <div class="task-info">
        <h3>${task.title}</h3>
        <p>DURATION: ${task.duration}</p>
        <p>${task.info}</p>
      </div>

      <div class="task-footer">
        <span>${progress}% complete</span>
        <div
          class="mini-ring"
          style="
            background: conic-gradient(
              from -90deg,
              #252525 0deg ${progress * 3.6}deg,
              #5e5e5e ${progress * 3.6}deg 360deg
            );
          "
        >
          <div class="mini-ring-centre"></div>
        </div>
      </div>
    `;

    card.addEventListener("click", function () {
      if (deleteMode) {
        deleteTask(task.id);
        return;
      }

      localStorage.setItem("selectedTaskId", task.id);
      window.location.href = "task.html";
    });

    taskCards.appendChild(card);
  });
}

function deleteTask(taskId) {
  const taskToDelete = tasks.find(function (task) {
    return task.id === taskId;
  });

  const confirmed = confirm(
    "Delete " + taskToDelete.title + "?"
  );

  if (confirmed === false) {
    return;
  }

  const taskIndex = tasks.findIndex(function (task) {
    return task.id === taskId;
  });

  tasks.splice(taskIndex, 1);

  saveTasks(tasks);

  deleteMode = false;

  deleteButton.textContent = "🗑";

  updateDisplayedTasks();

  updateOverallProgress();

  dashboardMessage.textContent =
    "Task Deleted.";
}

addButton.addEventListener("click", function () {
  taskForm.classList.remove("hidden");
  formMessage.textContent = "";
});

cancelTaskButton.addEventListener("click", function () {
  taskForm.classList.add("hidden");
  clearTaskForm();
});

saveTaskButton.addEventListener("click", function () {
  const title = newTaskTitle.value.trim();
  const duration = newTaskDuration.value.trim();
  const info = newTaskInfo.value.trim();

  const errors = validateTask(title, duration, info);

  if (errors.length > 0) {
    formMessage.innerHTML = errors.join("<br>");
    return;
  }

  const newTask = {
    id: getNextTaskId(),
    title: title.toUpperCase(),
    duration: Number(duration) + " days",
    info: info,
    requirements: []
  };

  tasks.push(newTask);

  saveTasks(tasks);

  taskForm.classList.add("hidden");
  clearTaskForm();

  renderTaskCards(tasks);
  updateOverallProgress();

  dashboardMessage.textContent =
    "Task added successfully.";
});

deleteButton.addEventListener("click", function () {
  deleteMode = !deleteMode;

  if (deleteMode) {
    deleteButton.textContent = "^";

    dashboardMessage.textContent =
      "Delete mode: click a task card to delete it.";

    document.querySelectorAll(".task-card").forEach(function (card) {
      card.classList.add("delete-mode");
    });
  } else {
    deleteButton.textContent = "🗑";

    dashboardMessage.textContent =
      "Delete cancelled.";

    document.querySelectorAll(".task-card").forEach(function (card) {
      card.classList.remove("delete-mode");
    });
  }
});

editUserButton.addEventListener("click", function () {
  if (selectedUserId === null) {
    userMessage.textContent =
      "Select a user before editing.";
    return;
  }

  const userToEdit = users.find(function (user) {
    return user.id === selectedUserId;
  });

  const newName = prompt(
    "Enter a new user name:",
    userToEdit.name
  );

  if (newName === null) {
    return;
  }

  const name = newName.trim();

  if (name.length < 2) {
    userMessage.textContent =
      "User name must contain at least 2 characters.";
    return;
  }

  const newGroup = prompt(
    "Enter a new task group:",
    userToEdit.group
  );

  if (newGroup === null) {
    return;
  }

  const group = newGroup.trim();

  if (group === "") {
    userMessage.textContent =
      "Task group cannot be empty.";
    return;
  }

  userToEdit.name = name;
  userToEdit.group = group;

  saveUsers(users);

  renderUsers();

  userMessage.textContent =
    "User details updated.";
});

deleteUserButton.addEventListener("click", function () {
  if (selectedUserId === null) {
    userMessage.textContent =
      "Select a user before deleting.";
    return;
  }

  const userToDelete = users.find(function (user) {
    return user.id === selectedUserId;
  });

  const confirmed = confirm(
    "Delete user " + userToDelete.name + "?"
  );

  if (confirmed === false) {
    return;
  }

  users = users.filter(function (user) {
    return user.id !== selectedUserId;
  });

  tasks.forEach(function (task) {
    task.requirements.forEach(function (requirement) {
      if (requirement.assignedUserIds) {
        requirement.assignedUserIds =
          requirement.assignedUserIds.filter(function (userId) {
            return userId !== selectedUserId;
          });
      }
    });
  });

  saveUsers(users);
  saveTasks(tasks);

  selectedUserId = null;

  renderUsers();
  updateDisplayedTasks();
  updateOverallProgress();

  userMessage.textContent =
    "User deleted and removed from assigned requirements.";
});

function updateDisplayedTasks() {
  const searchText = searchInput.value.toLowerCase().trim();

  const matchingTasks = tasks.filter(function (task) {
    return (
      task.title.toLowerCase().includes(searchText) ||
      task.info.toLowerCase().includes(searchText)
    );
  });

  const sortedTasks = [...matchingTasks];

  if (sortSelect.value === "titleAZ") {
    sortedTasks.sort(function (taskA, taskB) {
      return taskA.title.localeCompare(taskB.title);
    });
  }

  if (sortSelect.value === "titleZA") {
    sortedTasks.sort(function (taskA, taskB) {
      return taskB.title.localeCompare(taskA.title);
    });
  }

  if (sortSelect.value === "progressHigh") {
    sortedTasks.sort(function (taskA, taskB) {
      return calculateProgress(taskB) - calculateProgress(taskA);
    });
  }

  if (sortSelect.value === "progressLow") {
    sortedTasks.sort(function (taskA, taskB) {
      return calculateProgress(taskA) - calculateProgress(taskB);
    });
  }

  renderTaskCards(sortedTasks);
}

searchInput.addEventListener("input", function () {
  updateDisplayedTasks();
});

sortSelect.addEventListener("change", function () {
  updateDisplayedTasks();
});

addUserButton.addEventListener("click", function () {
  const userName = prompt("Enter the user's name:");

  if (userName === null) {
    return;
  }

  const name = userName.trim();

  if (name.length < 2) {
    userMessage.textContent =
      "User name must contain at least 2 characters.";
    return;
  }

  const taskGroup = prompt(
    "Enter the task group:",
    "Task Group"
  );

  if (taskGroup === null) {
    return;
  }

  const group = taskGroup.trim();

  if (group === "") {
    userMessage.textContent =
      "Task group cannot be empty.";
    return;
  }

  users.push({
    id: getNextUserId(),
    name: name,
    group: group,
    colour: getRandomUserColour()
  });

  saveUsers(users);
  renderUsers();

  userMessage.textContent =
    name + " was added.";
});

const tasks = loadTasks();

const startingUsers = [
  {
    id: 1,
    name: "Joshua",
    group: "Task Group",
    colour: "#c76df0"
  },
  {
    id: 2,
    name: "Haniel",
    group: "Task Group",
    colour: "#f0bf1d"
  },
  {
    id: 3,
    name: "Irene",
    group: "Task Group",
    colour: "#ff3b30"
  }
];

function saveUsers(users) {
  localStorage.setItem(
    "teamdeckUsers",
    JSON.stringify(users)
  );
}

function loadUsers() {
  const savedUsers = localStorage.getItem("teamdeckUsers");

  if (savedUsers === null) {
    saveUsers(startingUsers);
    return startingUsers;
  }

  return JSON.parse(savedUsers);
}

let users = loadUsers();
let selectedUserId = null;

const userList = document.getElementById("userList");

function getUserProgress(userId) {
  let assignedRequirements = 0;
  let completedRequirements = 0;

  tasks.forEach(function (task) {
    task.requirements.forEach(function (requirement) {
      if (
        requirement.assignedUserIds &&
        requirement.assignedUserIds.includes(userId)
      ) {
        assignedRequirements += 1;

        if (requirement.status === "COMPLETED") {
          completedRequirements += 1;
        }
      }
    });
  });

  if (assignedRequirements === 0) {
    return 0;
  }

  return Math.round(
    completedRequirements / assignedRequirements * 100
  );
}

function renderUsers() {
  userList.innerHTML = "";

  users.forEach(function (user) {
    const progress = getUserProgress(user.id);

    const userCard = document.createElement("div");
    userCard.classList.add("user-card");
    userCard.dataset.userId = user.id;

    userCard.innerHTML = `
      <div
        class="avatar"
        style="color: ${user.colour};"
      >●</div>

      <div class="user-text">
        <strong>${user.name}</strong>
        <span>${user.group}</span>
      </div>

      <div
        class="ring"
        style="
          background: conic-gradient(
            from -90deg,
            ${user.colour} 0deg ${progress * 3.6}deg,
            #555 ${progress * 3.6}deg 360deg
          );
        "
      >
        <div class="ring-centre"></div>
      </div>
    `;

    userCard.addEventListener("click", function () {
      selectedUserId = user.id;

      document.querySelectorAll(".user-card").forEach(function (card) {
        card.classList.remove("selected-user");
      });

      userCard.classList.add("selected-user");

      userMessage.textContent =
        user.name + " selected.";
    });

    userList.appendChild(userCard);
  });
}

updateDisplayedTasks();
updateOverallProgress();
renderUsers();

function getRandomUserColour() {
  const colours = [
    "#c76df0",
    "#f0bf1d",
    "#ff3b30",
    "#33c3ff",
    "#42d17d",
    "#ff7a33"
  ];

  const randomIndex = Math.floor(
    Math.random() * colours.length
  );

  return colours[randomIndex];
}

function getNextUserId() {
  if (users.length === 0) {
    return 1;
  }

  const userIds = users.map(function (user) {
    return user.id;
  });

  return Math.max(...userIds) + 1;
}

