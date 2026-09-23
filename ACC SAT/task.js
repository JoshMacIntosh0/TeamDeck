const savedTasks = localStorage.getItem("teamdeckTasks");

const tasks = JSON.parse(savedTasks);

const savedUsers = localStorage.getItem("teamdeckUsers");
const users = JSON.parse(savedUsers) || [];

tasks.forEach(function (task) {
  task.requirements.forEach(function (requirement) {
    if (!requirement.assignedUserIds) {
      requirement.assignedUserIds = [];
    }
  });
});

const selectedTaskId = Number(
  localStorage.getItem("selectedTaskId")
);

const currentTask = tasks.find(function (task) {
  return task.id === selectedTaskId;
});

const taskTitle = document.getElementById("taskTitle");

const requirements = document.getElementById("requirements");

const taskMessage = document.getElementById("taskMessage");

const userList = document.getElementById("userList");

const editTaskForm =
  document.getElementById("editTaskForm");

const editTaskTitle =
  document.getElementById("editTaskTitle");

const editTaskDuration =
  document.getElementById("editTaskDuration");

const editTaskInfo =
  document.getElementById("editTaskInfo");

const saveEditButton =
  document.getElementById("saveEditButton");

const cancelEditButton =
  document.getElementById("cancelEditButton");

const editFormMessage =
  document.getElementById("editFormMessage");

const addRequirementButton =
  document.getElementById("addRequirementButton");

const editTaskButton =
  document.getElementById("editTaskButton");

const taskProgressFill = document.getElementById("taskProgressFill");

const overallProgressFill =
  document.getElementById("overallProgressFill");

const overallProgressText =
  document.getElementById("overallProgressText");

function getStatusClass(status) {
  if (status === "COMPLETED") {
    return "completed";
  }

  if (status === "IN PROGRESS") {
    return "in-progress";
  }

  return "not-started";
}

function calculateProgress(task) {
  if (task.requirements.length === 0) {
    return 0;
  }

  const completed = task.requirements.filter(function (requirement) {
    return requirement.status === "COMPLETED";
  });

  return Math.round(
    completed.length / task.requirements.length * 100
  );
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

function validateRequirement(requirementText) {
  if (requirementText.trim() === "") {
    return "Requirement cannot be empty.";
  }

  if (requirementText.trim().length < 3) {
    return "Requirement must contain at least 3 characters.";
  }

  return "";
}

function updateOverallProgress() {
  const overallProgress = calculateOverallProgress();

  overallProgressFill.style.width = overallProgress + "%";

  overallProgressText.textContent = overallProgress + "%";
}

function removeUserFromRequirement(requirementIndex, userId) {
  const requirement =
    currentTask.requirements[requirementIndex];

  requirement.assignedUserIds =
    requirement.assignedUserIds.filter(function (assignedId) {
      return assignedId !== userId;
    });

  localStorage.setItem(
    "teamdeckTasks",
    JSON.stringify(tasks)
  );

  renderTaskPage();
  renderUsers();

  taskMessage.textContent =
    "User removed from requirement.";
}

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

    userList.appendChild(userCard);
  });
}

function deleteRequirement(index) {
  const requirementToDelete =
    currentTask.requirements[index];

  const confirmed = confirm(
    "Delete requirement: " +
    requirementToDelete.text +
    "?"
  );

  if (confirmed === false) {
    return;
  }

  currentTask.requirements.splice(index, 1);

  localStorage.setItem(
    "teamdeckTasks",
    JSON.stringify(tasks)
  );

  renderTaskPage();
  renderUsers();

  taskMessage.textContent =
    "Requirement deleted.";
}

function renderTaskPage() {
  taskTitle.textContent = currentTask.title;

  const progress = calculateProgress(currentTask);

  taskProgressFill.style.width = progress + "%";

  updateOverallProgress();

  requirements.innerHTML = "";

  currentTask.requirements.forEach(function (requirement, index) {
    const statusClass = getStatusClass(requirement.status);

    const requirementRow = document.createElement("div");

    requirementRow.classList.add("requirement-row");

    requirementRow.innerHTML = `
      <div class="requirement-name">
        <span>${requirement.text}</span>
        <div class="assigned-users" data-requirement-index="${index}"></div>
      </div>

      <div class="requirement-controls">
        <select
          class="assigned-user-select"
          data-requirement-index="${index}"
        >
          <option value="">Assign user</option>
        </select>

        <select
          class="status-select ${statusClass}"
          data-requirement-index="${index}"
        >
          <option value="COMPLETED">COMPLETED</option>
          <option value="IN PROGRESS">IN PROGRESS</option>
          <option value="NOT STARTED">NOT STARTED</option>
        </select>

        <button
          class="delete-requirement-button"
          type="button"
          data-requirement-index="${index}"
        >
          ×
        </button>
        </div>
        `;

    const assignedUserSelect =
      requirementRow.querySelector(".assigned-user-select");

    users.forEach(function (user) {
      const userOption = document.createElement("option");

      userOption.value = user.id;
      userOption.textContent = user.name;

      assignedUserSelect.appendChild(userOption);
    });

    const assignedUsersBox =
      requirementRow.querySelector(".assigned-users");

    requirement.assignedUserIds.forEach(function (userId) {
      const assignedUser = users.find(function (user) {
        return user.id === userId;
      });

      if (!assignedUser) {
        return;
      }

      const userTag = document.createElement("button");

      userTag.classList.add("assigned-user-tag");
      userTag.type = "button";
      userTag.textContent = assignedUser.name + " ×";

      userTag.style.borderColor = assignedUser.colour;
      userTag.style.color = assignedUser.colour;
      userTag.style.backgroundColor = "#252525";

      userTag.addEventListener("click", function () {
        removeUserFromRequirement(index, userId);
      });

      assignedUsersBox.appendChild(userTag);
    });

    const statusSelect =
      requirementRow.querySelector(".status-select");

    statusSelect.value = requirement.status;

    statusSelect.addEventListener("change", function () {
      updateRequirementStatus(
        index,
        statusSelect.value
      );
    });

  
    assignedUserSelect.addEventListener("change", function () {
      const selectedUserId = Number(assignedUserSelect.value);

      if (selectedUserId === 0) {
        return;
      }

      if (
        !requirement.assignedUserIds.includes(selectedUserId)
      ) {
        requirement.assignedUserIds.push(selectedUserId);
      }

      localStorage.setItem(
        "teamdeckTasks",
        JSON.stringify(tasks)
      );

      renderTaskPage();
      renderUsers();

      taskMessage.textContent =
        "User assigned to requirement.";
    }); 
    
    const deleteRequirementButton =
      requirementRow.querySelector(".delete-requirement-button");

    deleteRequirementButton.addEventListener("click", function () {
      deleteRequirement(index);
    });

    requirements.appendChild(requirementRow);
  });
}

function updateRequirementStatus(index, newStatus) {
  currentTask.requirements[index].status = newStatus;

  localStorage.setItem(
    "teamdeckTasks",
    JSON.stringify(tasks)
  );

  renderTaskPage();
  renderUsers();

  taskMessage.textContent =
    "Requirement status changed to " + newStatus + ".";
}

function validateRequirement(requirementText) {
  if (requirementText.trim() === "") {
    return "Requirement cannot be empty.";
  }

  if (requirementText.trim().length < 3) {
    return "Requirement must contain at least 3 characters.";
  }

  return "";
}

addRequirementButton.addEventListener("click", function () {
  const requirementText = prompt(
    "Enter a new task requirement:"
  );

  if (requirementText === null) {
    return;
  }

  const error = validateRequirement(requirementText);

  if (error !== "") {
    taskMessage.textContent = error;
    return;
  }

  currentTask.requirements.push({
    text: requirementText.trim(),
    status: "NOT STARTED"
  });

  localStorage.setItem(
    "teamdeckTasks",
    JSON.stringify(tasks)
  );

  window.location.reload();

  renderTaskPage();
  renderUsers();

  taskMessage.textContent =
    "New requirement added.";

});


function validateTask(title, duration, info) {
  const errors = [];

  if (title.trim() === "") {
    errors.push("Task title cannot be empty.");
  } else if (title.trim().length < 1) {
    errors.push("Task title must contain at least 1 character.");
  }

  if (duration.trim() === "") {
    errors.push("Duration cannot be empty.");
  } else if (isNaN(duration) || Number(duration) <= 0) {
    errors.push("Duration must be a positive number.");
  } 

  if (info.trim() === "") {
    errors.push("Task information cannot be empty.");
  } else if (info.trim().length < 1) {
    errors.push("Task information must contain at least 1 character.");
  }

  return errors;
}

editTaskButton.addEventListener("click", function () {
  editTaskTitle.value = currentTask.title;

  editTaskDuration.value = currentTask.duration;

  editTaskInfo.value = currentTask.info;

  editFormMessage.textContent = "";

  editTaskForm.classList.remove("hidden");
});


//Save Edited Task Details
saveEditButton.addEventListener("click", function () {
  const title = editTaskTitle.value.trim();
  const duration = editTaskDuration.value.trim();
  const info = editTaskInfo.value.trim();

  const errors = validateTask(title, duration, info);

  if (errors.length > 0) {
    editFormMessage.innerHTML = errors.join("<br>");
    return;
  }

  currentTask.title = title.toUpperCase();
  currentTask.duration = Number(duration) + " days";
  currentTask.info = info;

  localStorage.setItem(
    "teamdeckTasks",
    JSON.stringify(tasks)
  );

  editTaskForm.classList.add("hidden");

  renderTaskPage();

  taskMessage.textContent =
    "Task details updated.";
});

cancelEditButton.addEventListener("click", function () {
  editTaskForm.classList.add("hidden");

  editFormMessage.textContent = "";
});

renderTaskPage();
renderUsers();
