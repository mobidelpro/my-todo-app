document.addEventListener("DOMContentLoaded", function () {
    const addTaskButton = document.getElementById("add-task");
    const tasksTodaySection = document.querySelector(".tasks-today");
    const tasksDoneList = document.getElementById("done-task-list");
    const emptyTask = document.querySelector(".empty-task");
  
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
        <div class="priority">
          <span data-priority="low" class="tag low ${prioVal === 'low' ? 'selected' : ''}">پایین</span>
          <span data-priority="medium" class="tag medium ${prioVal === 'medium' ? 'selected' : ''}">متوسط</span>
          <span data-priority="high" class="tag high ${prioVal === 'high' ? 'selected' : ''}">بالا</span>
        </div>
        <button id="submit-task">${existingTask ? "ویرایش تسک" : "اضافه کردن تسک"}</button>
      `;
  
      tasksTodaySection.insertBefore(formWrapper, emptyTask);
      let selectedPriority = prioVal;
  
      formWrapper.querySelectorAll(".tag").forEach(tag => {
        tag.addEventListener("click", () => {
          formWrapper.querySelectorAll(".tag").forEach(t => t.classList.remove("selected"));
          tag.classList.add("selected");
          selectedPriority = tag.dataset.priority;
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
      });
    }
  
    function addTaskToToday(title, desc, priority) {
      const task = document.createElement("div");
      task.classList.add("task-item");
      task.dataset.title = title;
      task.dataset.desc = desc;
      task.dataset.priority = priority;
  
      const priorityColor = {
        low: "#90f677",
        medium: "#ffc107",
        high: "#e63946"
      };
  
      task.innerHTML = `
        <div class="task-header">
          <input type="checkbox" class="complete-checkbox" />
          <span class="title">${title}</span>
          <span class="priority-indicator" style="background-color:${priorityColor[priority]};width:12px;height:12px;border-radius:50%;"></span>
          <div class="actions">
            <button class="delete-btn">
              <img src="./assets/images/Delete.svg" alt="حذف" width="20" />
            </button>
            <button class="edit-btn">
              <img src="./assets/images/edit.svg" alt="ویرایش" width="20" />
            </button>
          </div>
        </div>
        ${desc ? `<p class="description">${desc}</p>` : ""}
      `;
  
      tasksTodaySection.appendChild(task);
      updateTodayCount();
  
      task.querySelector(".complete-checkbox").addEventListener("change", () => {
        moveToDone(title);
        task.remove();
        updateTodayCount();
        updateDoneCount();
      });
  
      task.querySelector(".delete-btn").addEventListener("click", () => {
        task.remove();
        updateTodayCount();
      });
  
      task.querySelector(".edit-btn").addEventListener("click", () => {
        createTaskForm(task);
      });
    }
  
    function moveToDone(title) {
      const doneItem = document.createElement("li");
      doneItem.classList.add("completed"); // ← برای خط خوردن
      doneItem.innerHTML = `
        ${title}
        <input type="checkbox" checked disabled />
      `;
      tasksDoneList.appendChild(doneItem);
      updateDoneCount();
    }
  
    addTaskButton.addEventListener("click", () => {
      if (document.querySelector(".task-form")) return;
      createTaskForm();
    });
  
    // آپدیت اولیه
    updateTodayCount();
    updateDoneCount();
  });
  