document.addEventListener("DOMContentLoaded", () => {
  const browseBtn = document.getElementById("browseBtn");
  const fileInput = document.getElementById("fileInput");
  const fileDisplay = document.getElementById("fileDisplay");
  const fileName = document.getElementById("fileName");
  const fileSize = document.getElementById("fileSize");
  const deleteFile = document.getElementById("deleteFile");

  // === File Upload Logic ===
  if (browseBtn && fileInput) {
    browseBtn.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        alert("Please select a PDF file.");
        fileInput.value = "";
        return;
      }

      const sizeKB = (file.size / 1024).toFixed(1);
      fileName.textContent = file.name;
      fileSize.textContent = `${sizeKB} KB`;
      fileDisplay.style.display = "block";
    });
  }

  if (deleteFile) {
    deleteFile.addEventListener("click", () => {
      fileDisplay.style.display = "none";
      fileInput.value = "";
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const newProjectBtn = document.getElementById("newProjectBtn");
  const projectList = document.getElementById("projectList");
  const emptyMainState = document.getElementById("emptyMainState");
  const uploadSection = document.getElementById("uploadSection");


if (!sessionStorage.getItem("sessionStarted")) {
  localStorage.removeItem("projects");
  localStorage.removeItem("activeProject");
  sessionStorage.setItem("sessionStarted", "true");
}

  // === Load projects and active project ===
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
    const currentPage = window.location.pathname.split("/").pop();

    projects.forEach((name, index) => {
      const projectGroup = document.createElement("div");
      projectGroup.classList.add("project-group");

      const projectBtn = document.createElement("button");
      projectBtn.classList.add("project-btn");
      projectBtn.innerHTML = `
        <span>${name}</span>
        <span class="chev">▾</span>
      `;

      const subLinks = document.createElement("div");
      subLinks.classList.add("project-sublinks");
      subLinks.innerHTML = `
        <a href="upload.html" class="side-sublink">Submit Your Input</a>
        <a href="history.html" class="side-sublink">History</a>
      `;

      // === Attach event listeners for navigation links ===
      subLinks.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => setActiveProject(name));
      });

      // === Highlight current page link ===
      subLinks.querySelectorAll("a").forEach((a) => {
        if (a.getAttribute("href") === currentPage) {
          a.classList.add("active");
        }
      });

      // === Default open/close behavior ===
      if (name === activeProject) {
        subLinks.style.display = "flex";
      } else {
        subLinks.style.display = "none";
      }

      // === Toggle manually — only one open at a time ===
      projectBtn.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll(".project-sublinks").forEach((other) => {
          if (other !== subLinks) other.style.display = "none";
        });

        const isOpen = subLinks.style.display === "flex";
        subLinks.style.display = isOpen ? "none" : "flex";
        if (!isOpen) setActiveProject(name);
      });

      projectGroup.appendChild(projectBtn);
      projectGroup.appendChild(subLinks);
      projectList.appendChild(projectGroup);
    });

    // === Handle empty state visibility ===
    if (emptyMainState && uploadSection) {
      if (projects.length === 0) {
        emptyMainState.style.display = "flex";
        uploadSection.style.display = "none";
      } else {
        emptyMainState.style.display = "none";
        uploadSection.style.display = "block";
      }
    }
  }

  renderProjects();

  // === Add new project ===
  if (newProjectBtn) {
    newProjectBtn.addEventListener("click", () => {
      const newProject = `Project ${projects.length + 1}`;
      projects.push(newProject);
      saveProjects();
      setActiveProject(newProject);

      // Re-render and open only the new project
      renderProjects();
      document.querySelectorAll(".project-sublinks").forEach((s, i) => {
        s.style.display = i === projects.length - 1 ? "flex" : "none";
      });
    });
  }

  // === Upload/Text tab toggle ===
  const pdfPanel = document.getElementById("panel-pdf");
  const textPanel = document.getElementById("panel-text");
  const pdfRadio = document.querySelector('input[value="pdf"]');
  const textRadio = document.querySelector('input[value="text"]');

  if (pdfRadio && textRadio && pdfPanel && textPanel) {
    pdfRadio.addEventListener("change", () => {
      pdfPanel.style.display = pdfRadio.checked ? "block" : "none";
      textPanel.style.display = pdfRadio.checked ? "none" : "block";
    });
    textRadio.addEventListener("change", () => {
      pdfPanel.style.display = textRadio.checked ? "none" : "block";
      textPanel.style.display = textRadio.checked ? "block" : "none";
    });
  }
});
