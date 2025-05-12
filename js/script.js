document.addEventListener("DOMContentLoaded", function () {
  const addTaskButton = document.getElementById("add-task");
  const tasksTodaySection = document.querySelector(".tasks-today");
  const tasksDoneList = document.getElementById("done-task-list");
  const emptyTask = document.querySelector(".empty-task");

  // 🟢 بازیابی تسک‌ها از localStorage
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach(task => {
    addTaskToToday(task.title, task.desc, task.priority);
  });

    // 🟢 بازیابی تسک‌های انجام‌شده از localStorage
    const savedDoneTasks = JSON.parse(localStorage.getItem("doneTasks")) || [];
    savedDoneTasks.forEach(task => {
      moveToDone(task.title, task.priority);
    });


  function updateTodayCount() {
    const count = document.querySelectorAll(".task-item").length;
    document.getElementById("today-count").textContent = `${count} تسک را باید انجام دهید.`;
  }

  function updateDoneCount() {
    const count = document.querySelectorAll("#done-task-list li").length;
    document.getElementById("done-count").textContent = `${count} تسک انجام شده است.`;
  }

  function createTaskForm(existingTask = null) {
    const formWrapper = document.createElement("div");
    formWrapper.classList.add("task-form");

    const titleVal = existingTask?.dataset.title || "";
    const descVal = existingTask?.dataset.desc || "";
    const prioVal = existingTask?.dataset.priority || "low";

    formWrapper.innerHTML = `
      <input type="text" id="task-title" placeholder="نام تسک" value="${titleVal}" />
      <textarea id="task-desc" placeholder="توضیحات">${descVal}</textarea>
      <div class="tag-selector">
        <button type="button" id="tag-toggle"><img src="./assets/images/tag-right.svg" alt="select"/>تگ‌ها</button>
        <div class="tag-options hidden">
          <div class="priority">
            <span data-priority="low" class="tag low ${prioVal === "low" ? "selected" : ""}">پایین</span>
            <span data-priority="medium" class="tag medium ${prioVal === "medium" ? "selected" : ""}">متوسط</span>
            <span data-priority="high" class="tag high ${prioVal === "high" ? "selected" : ""}">بالا</span>
          </div>
        </div>
      </div>
      <hr>
      <button id="submit-task">${existingTask ? "ویرایش تسک" : "اضافه کردن تسک"}</button>
    `;

    const firstTask = tasksTodaySection.querySelector(".task-item");
    if (firstTask) {
      tasksTodaySection.insertBefore(formWrapper, firstTask);
    } else {
      tasksTodaySection.insertBefore(formWrapper, emptyTask);
    }
    let selectedPriority = prioVal;

    const toggle = formWrapper.querySelector("#tag-toggle");
    const tagOptions = formWrapper.querySelector(".tag-options");

    toggle.addEventListener("click", () => {
      tagOptions.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!formWrapper.contains(e.target)) {
        tagOptions.classList.add("hidden");
      }
    });

    formWrapper.querySelectorAll(".tag").forEach((tag) => {
      tag.addEventListener("click", () => {
        formWrapper.querySelectorAll(".tag").forEach((t) => t.classList.remove("selected"));
        tag.classList.add("selected");
        selectedPriority = tag.dataset.priority;
        toggle.textContent = `${tag.textContent}`;
        tagOptions.classList.add("hidden");
        const priorityBackColors = {
          low: "#C3FFF1",
          medium: "#FFEFD6",
          high: "#FFE2DB",
        };
        const priorityColors = {
          low: "#11A483",
          medium: "#FFAF37",
          high: "#FF5F37",
        };
        toggle.style.color = priorityColors[selectedPriority];
        toggle.style.backgroundColor = priorityBackColors[selectedPriority];
      });
    });

    formWrapper.querySelector("#submit-task").addEventListener("click", () => {
      const title = formWrapper.querySelector("#task-title").value.trim();
      const desc = formWrapper.querySelector("#task-desc").value.trim();
      if (title === "") return alert("لطفاً نام تسک را وارد کنید.");

      if (existingTask) {
        existingTask.remove();
        updateTodayCount();
      }

      addTaskToToday(title, desc, selectedPriority);
      formWrapper.remove();
      emptyTask.style.display = "none";
      saveTasks(); 
    });
  }

  function addTaskToToday(title, desc, priority) {
    if (emptyTask) emptyTask.style.display = 'none';
    const task = document.createElement("div");
    task.classList.add("task-item");
    task.dataset.title = title;
    task.dataset.desc = desc;
    task.dataset.priority = priority;

    const priorityColor = {
      low: "#90f677",
      medium: "#ffc107",
      high: "#e63946",
    };

    task.innerHTML = `
      <div class="task-header">
        <div class="task-right">
          <input type="checkbox" class="complete-checkbox" />
          <span class="title">${title}</span>
          <span class="tag ${priority}">${getPriorityLabel(priority)}</span>
        </div>
        <div class="btns">
          <div class="threedot-container">
            <div class="threedot">⋮</div>
          </div>
          <div class="actions hidden">
            <button class="edit-btn"><img src="./assets/images/edit.svg" alt="ویرایش" /></button>
            <button class="delete-btn"><img src="./assets/images/Delete.svg" alt="حذف" /></button>
          </div>
        </div>
      </div>
      ${desc ? `<p class="description">${desc}</p>` : ""}
      <span class="priority-indicator" style="background-color:${priorityColor[priority]}"></span>
    `;

    tasksTodaySection.insertBefore(task, emptyTask);
    updateTodayCount();

    task.querySelector(".complete-checkbox").addEventListener("change", () => {
      moveToDone(title, priority);
      task.remove();
      updateTodayCount();
      updateDoneCount();
      saveTasks(); // ذخیره بعد از تکمیل
    });

    task.querySelector(".threedot").addEventListener("click", () => {
      const option = task.querySelector(".actions");
      option.classList.toggle("hidden");
    });

    task.querySelector(".delete-btn").addEventListener("click", () => {
      task.remove();
      updateTodayCount();
      saveTasks(); // ذخیره بعد از حذف
    });

    task.querySelector(".edit-btn").addEventListener("click", () => {
      createTaskForm(task);
    });
  }

  function moveToDone(title, priority) {
    const doneItem = document.createElement("li");
    doneItem.classList.add("completed");
    doneItem.innerHTML = `
      <div class="dones-container">
        <div class="dones">
          <input type="checkbox" checked/>
          <div class="nameOfDoneTask">
            <span>${title}</span>
          </div>
        </div>
        <div class="delete-task">
          <button class="delete"><img src="./assets/images/Delete.svg" alt="حذف" /></button>
        </div>
      </div>
    `;
    document.querySelector(".tasks-done").style.display = "block";

    doneItem.style.setProperty("--stripe-color", getPriorityColor(priority));
    doneItem.classList.add(`stripe-${priority}`);
    tasksDoneList.appendChild(doneItem);

    doneItem.querySelector(".delete").addEventListener("click", () => {
     doneItem.remove();
     updateDoneCount();
     saveDoneTasks();

     if (tasksDoneList.children.length === 0) {
      document.querySelector(".tasks-done").style.display = "none";
    }
    });

    saveDoneTasks(); // ذخیره تسک‌های انجام‌شده
  }

  function getPriorityLabel(priority) {
    return priority === "low" ? "پایین" : priority === "medium" ? "متوسط" : "بالا";
  }

  function getPriorityColor(priority) {
    return priority === "low"
      ? "#90f677"
      : priority === "medium"
      ? "#ffc107"
      : "#e63946";
  }
  // 🔵 تابع ذخیره در localStorage
  function saveTasks() {
    const tasks = [];
    document.querySelectorAll(".task-item").forEach(task => {
      tasks.push({
        title: task.dataset.title,
        desc: task.dataset.desc,
        priority: task.dataset.priority
      });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // 🔵 تابع ذخیره تسک‌های انجام‌شده
  function saveDoneTasks() {
    const doneTasks = [];
    tasksDoneList.querySelectorAll("li").forEach(task => {
      const title = task.querySelector("span").textContent;
      const priority = task.classList.contains("stripe-high") ? "high" :
                       task.classList.contains("stripe-medium") ? "medium" : "low";
      doneTasks.push({ title, priority });
    });
    localStorage.setItem("doneTasks", JSON.stringify(doneTasks));
  }

  addTaskButton.addEventListener("click", () => {
    emptyTask.style.display = "none";
    if (document.querySelector(".task-form")) return;
    createTaskForm();
  });

  updateTodayCount();
  updateDoneCount();

  // === Sidebar Toggle Logic ===
  const hamb = document.querySelector(".hamb");
  const resSidebar = document.querySelector(".res-sidebar");
  const cross = document.querySelector(".res-top img");

  function openSidebar() {
    resSidebar.style.display = "block";
    resSidebar.classList.add("active");
  }

  function closeSidebar() {
    resSidebar.style.display = "none";
    resSidebar.classList.remove("active");
  }

  hamb.addEventListener("click", (e) => {
    e.stopPropagation();
    openSidebar();
  });

  cross.addEventListener("click", (e) => {
    e.stopPropagation();
    closeSidebar();
  });

  document.addEventListener("click", (e) => {
    if (
      resSidebar.classList.contains("active") &&
      !resSidebar.contains(e.target) &&
      !hamb.contains(e.target)
    ) {
      closeSidebar();
    }
  });
});
