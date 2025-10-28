document.addEventListener("DOMContentLoaded", () => {
  const newProjectBtn = document.getElementById("newProjectBtn");
  const projectList = document.getElementById("projectList");

  let projects = JSON.parse(localStorage.getItem("projects")) || [];
  let activeProject = localStorage.getItem("activeProject") || null;

  function saveProjects() {
    localStorage.setItem("projects", JSON.stringify(projects));
  }

  function setActiveProject(name) {
    activeProject = name;
    localStorage.setItem("activeProject", name);
  }

  function renderProjects() {
    projectList.innerHTML = "";

    projects.forEach((name) => {
      const group = document.createElement("div");
      group.classList.add("project-group");

      const container = document.createElement("div");
      container.classList.add("project-container");

      const title = document.createElement("span");
      title.classList.add("project-name");
      title.textContent = name;

      const chevron = document.createElement("span");
      chevron.classList.add("project-chevron");
      chevron.textContent = "▾";

      container.appendChild(title);
      container.appendChild(chevron);
      group.appendChild(container);

      const sublinks = document.createElement("div");
      sublinks.classList.add("project-sublinks");
      sublinks.innerHTML = `
        <a href="upload.html" class="side-sublink active">Upload New File</a>
        <a href="history.html" class="side-sublink inactive">History</a>
      `;

      sublinks.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => setActiveProject(name));
      });

      if (name === activeProject) {
        sublinks.style.display = "flex";
        group.classList.add("open");
      } else {
        sublinks.style.display = "none";
      }

      container.addEventListener("click", (e) => {
        e.preventDefault();
        const openNow = sublinks.style.display === "flex";
        document.querySelectorAll(".project-sublinks").forEach((el) => (el.style.display = "none"));
        document.querySelectorAll(".project-group").forEach((el) => el.classList.remove("open"));
        if (!openNow) {
          sublinks.style.display = "flex";
          group.classList.add("open");
          setActiveProject(name);
        }
      });

      group.appendChild(sublinks);
      projectList.appendChild(group);
    });
  }

  if (newProjectBtn) {
    newProjectBtn.addEventListener("click", () => {
      const name = `Project ${projects.length + 1}`;
      projects.push(name);
      saveProjects();
      setActiveProject(name);
      renderProjects();
    });
  }

  renderProjects();
});
