const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));



const newProjectBtn = $('#newProjectBtn');
const projectList = $('#projectList');

// --- Project List Persistence ---
function getProjectsFromStorage() {
  try {
    const data = localStorage.getItem('cipsmethod-projects');
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [];
}

// Continue as guest: clear any existing projects/histories so the UI shows an empty state
function continueAsGuest() {
  try {
    // Backup existing projects/histories so they can be restored when the user logs in normally
    const existingProjects = getProjectsFromStorage();
    const existingHistories = getHistoriesFromStorage();
    try {
      if (existingProjects && existingProjects.length) {
        localStorage.setItem('cipsmethod-projects-backup', JSON.stringify(existingProjects));
      }
      if (existingHistories && existingHistories.length) {
        localStorage.setItem('cipsmethod-histories-backup', JSON.stringify(existingHistories));
      }
      // mark that guest session is active
      localStorage.setItem('cipsmethod-guest-active', '1');
    } catch (e) {
      // ignore backup errors
    }
    // Clear visible projects for guest session
    localStorage.setItem('cipsmethod-projects', JSON.stringify([]));
    localStorage.setItem('cipsmethod-histories', JSON.stringify([]));
  } catch (e) {
    // ignore storage errors
  }
  window.location.href = 'upload.html';
}

// Normal login path: restore any backed-up projects if a guest session was active
function loginNormal() {
  try {
    const guestFlag = localStorage.getItem('cipsmethod-guest-active');
    const backup = localStorage.getItem('cipsmethod-projects-backup');
    const histBackup = localStorage.getItem('cipsmethod-histories-backup');
    if (guestFlag && backup) {
      try {
        localStorage.setItem('cipsmethod-projects', backup);
        if (histBackup) localStorage.setItem('cipsmethod-histories', histBackup);
      } catch (e) {
        // ignore restore errors
      }
    }
    // cleanup guest markers/backups
    try {
      localStorage.removeItem('cipsmethod-guest-active');
      localStorage.removeItem('cipsmethod-projects-backup');
      localStorage.removeItem('cipsmethod-histories-backup');
    } catch (e) {}
  } catch (e) {}
  // navigate to the upload page (preserve normal flow)
  window.location.href = 'upload.html';
}

// Mark bottom feedback link active when on feedback page (do not open/select projects)
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.feedback-link').forEach(el => el.classList.remove('active'));
  const isFeedbackPage = window.location.pathname.endsWith('feedback.html') || window.location.href.includes('feedback.html');
  if (!isFeedbackPage) return;
  const fb = document.querySelector('.feedback-link');
  if (fb) fb.classList.add('active');
});

function saveProjectsToStorage(projects) {
  localStorage.setItem('cipsmethod-projects', JSON.stringify(projects));
}

// --- Project histories persistence (parallel array aligned by project index) ---
function getHistoriesFromStorage() {
  try {
    const data = localStorage.getItem('cipsmethod-histories');
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [];
}

function saveHistoriesToStorage(histories) {
  localStorage.setItem('cipsmethod-histories', JSON.stringify(histories));
}

function ensureHistoriesAligned(projects) {
  const histories = getHistoriesFromStorage();
  while (histories.length < projects.length) histories.push([]);
  if (histories.length > projects.length) histories.length = projects.length;
  saveHistoriesToStorage(histories);
  return histories;
}

function addHistoryEntryForProject(idx, entry) {
  const projects = getProjectsFromStorage();
  const histories = getHistoriesFromStorage();
  // align
  while (histories.length < projects.length) histories.push([]);
  if (idx < 0 || idx >= histories.length) return;
  histories[idx].unshift(entry); // newest first
  saveHistoriesToStorage(histories);
}

function renderProjects() {
  if (!projectList) return;
  projectList.innerHTML = '';
  const projects = getProjectsFromStorage();
  if (!projects || projects.length === 0) {
    // keep the sidebar clean when there are no projects
    if (typeof showEmptyMainIfNoProjects === 'function') showEmptyMainIfNoProjects();
    return;
  }
  projects.forEach((name, idx) => {
    createProjectGroup(name, idx === 0, idx);
  });
}

// If there are no projects, replace main content with an empty-state message
function showEmptyMainIfNoProjects() {
  try {
    const projects = getProjectsFromStorage();
    if (projects && projects.length > 0) return;
    const main = document.querySelector('.main-content');
    if (!main) return;
    // Clear existing upload UI
    main.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'empty-main-message';
    wrap.textContent = 'Create a Project to Get Started!';
    main.appendChild(wrap);
  } catch (e) {
    // ignore
  }
}

window.addEventListener('DOMContentLoaded', () => {
  showEmptyMainIfNoProjects();
});

function addNewProject() {
  let projects = getProjectsFromStorage();
  const nextIndex = projects.length + 1;
  const newName = `Project Name ${nextIndex}`;
  projects.push(newName);
  saveProjectsToStorage(projects);
  // Ensure histories array stays aligned with projects
  ensureHistoriesAligned(projects);
  renderProjects();
  // Open the new group
  const groups = $$('.project-group', projectList);
  if (groups.length) {
    closeAllGroups();
    openGroup(groups[groups.length - 1]);
    groups[groups.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  // After creating a project, navigate to the upload page for the new project
  try {
    const newIdx = projects.length - 1;
    window.location.href = `upload.html?idx=${newIdx}`;
  } catch (e) {}
}

if (projectList && newProjectBtn) {
  // make sure histories are aligned before rendering
  ensureHistoriesAligned(getProjectsFromStorage());
  renderProjects();
  newProjectBtn.addEventListener('click', addNewProject);
}







function createProjectGroup(projectName, openByDefault, idx) {
  const group = document.createElement('div');
  group.className = 'project-group';

  const header = document.createElement('div');
  header.className = 'project-container';

  const name = document.createElement('div');
  name.className = 'project-name';
  name.textContent = projectName;


  // Dropdown menu button (three dots)
  const menuBtn = document.createElement('button');
  menuBtn.className = 'project-menu-btn';
  menuBtn.innerHTML = '&#8942;'; // vertical ellipsis
  menuBtn.style.background = 'none';
  menuBtn.style.border = 'none';
  menuBtn.style.cursor = 'pointer';
  menuBtn.style.fontSize = '20px';
  menuBtn.style.marginLeft = '8px';
  menuBtn.setAttribute('aria-label', 'Project menu');

  // Dropdown menu
  const menu = document.createElement('div');
  menu.className = 'project-menu-dropdown';
  menu.style.display = 'none';
  menu.style.position = 'absolute';
  menu.style.left = '180px';
  menu.style.top = '40px';
  menu.style.background = '#fff';
  menu.style.border = '1px solid #e0e0e0';
  menu.style.borderRadius = '6px';
  menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  menu.style.zIndex = '3000';
  menu.style.minWidth = '120px';

  // Menu items
  const renameItem = document.createElement('div');
  renameItem.className = 'project-menu-item';
  renameItem.textContent = 'Rename';
  renameItem.style.padding = '12px 18px';
  renameItem.style.cursor = 'pointer';
  renameItem.addEventListener('mouseenter', () => renameItem.style.background = '#f3f4fd');
  renameItem.addEventListener('mouseleave', () => renameItem.style.background = '');

  const deleteItem = document.createElement('div');
  deleteItem.className = 'project-menu-item';
  deleteItem.textContent = 'Delete';
  deleteItem.style.padding = '12px 18px';
  deleteItem.style.cursor = 'pointer';
  deleteItem.addEventListener('mouseenter', () => deleteItem.style.background = '#e2e4f6');
  deleteItem.addEventListener('mouseleave', () => deleteItem.style.background = '');

  const downloadItem = document.createElement('div');
  downloadItem.className = 'project-menu-item';
  downloadItem.textContent = 'Download';
  downloadItem.style.padding = '12px 18px';
  downloadItem.style.cursor = 'pointer';
  downloadItem.addEventListener('mouseenter', () => downloadItem.style.background = '#f3f4fd');
  downloadItem.addEventListener('mouseleave', () => downloadItem.style.background = '');

  menu.appendChild(renameItem);
  menu.appendChild(deleteItem);
  menu.appendChild(downloadItem);

  // Show/hide menu
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Hide all other menus
    document.querySelectorAll('.project-menu-dropdown').forEach(m => m.style.display = 'none');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });
  // Hide menu on click outside
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== menuBtn) {
      menu.style.display = 'none';
    }
  });

  // Rename logic: open rename modal
  renameItem.addEventListener('click', (e) => {
    menu.style.display = 'none';
    showRenameModal(projectName, idx);
  });

  // Delete logic
  deleteItem.addEventListener('click', (e) => {
    menu.style.display = 'none';
    showDeleteModal(projectName, idx);
  });

  header.appendChild(name);
  header.appendChild(menuBtn);
  header.style.position = 'relative';
  header.style.overflow = 'visible';
  header.appendChild(menu);

  // Chevron for expand/collapse
  const chevron = document.createElement('div');
  chevron.className = 'project-chevron';
  chevron.setAttribute('aria-hidden', 'true');
  chevron.textContent = '▾';
  header.appendChild(chevron);

  const sublinks = document.createElement('div');
  sublinks.className = 'project-sublinks';
  sublinks.style.display = 'none';
  sublinks.style.flexDirection = 'column';

  const uploadLink = document.createElement('a');
  uploadLink.href = `upload.html?idx=${idx}`;
  // Default to inactive so only the actual currently-open project's tab appears selected
  uploadLink.className = 'side-sublink inactive';
  uploadLink.textContent = 'Upload New File';
  uploadLink.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveSublink(sublinks, uploadLink);
    // Navigate to upload page for this project index
    window.location.href = `upload.html?idx=${idx}`;
  });

const historyLink = document.createElement('a');
historyLink.href = `history.html?idx=${idx}`;
historyLink.className = 'side-sublink inactive';
historyLink.textContent = 'History';
historyLink.addEventListener('click', (e) => {
  e.preventDefault();
  setActiveSublink(sublinks, historyLink);
  // Navigate to history page for this project index
  window.location.href = `history.html?idx=${idx}`;
});

  sublinks.appendChild(uploadLink);
  sublinks.appendChild(historyLink);



  header.addEventListener('click', (event) => {
    // Don't toggle if clicking menu button
    if (event.target === menuBtn || menu.contains(event.target)) return;
    const isOpen = group.classList.contains('open');
    if (isOpen) closeGroup(group);
    else {
      closeAllGroups();
      openGroup(group);
    }
  });
// --- Delete Modal ---
function showDeleteModal(projectName, idx) {
  let modal = document.getElementById('deleteProjectModal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'deleteProjectModal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.08)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '2000';

  const box = document.createElement('div');
  box.style.background = '#ececf6';
  box.style.padding = '48px 32px 32px 32px';
  box.style.borderRadius = '10px';
  box.style.boxShadow = '0 2px 16px rgba(0,0,0,0.10)';
  box.style.minWidth = '420px';
  box.style.textAlign = 'center';

  const msg = document.createElement('div');
  msg.style.fontSize = '2rem';
  msg.style.color = '#6b7280';
  msg.style.marginBottom = '32px';
  msg.textContent = `Delete the project '${projectName}' ?`;

  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.justifyContent = 'center';
  btnRow.style.gap = '32px';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.background = '#fff';
  cancelBtn.style.border = '1.5px solid #D1D5DB';
  cancelBtn.style.borderRadius = '6px';
  cancelBtn.style.padding = '10px 28px';
  cancelBtn.style.fontSize = '16px';
  cancelBtn.style.cursor = 'pointer';
  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.style.background = '#2CA0A0';
  deleteBtn.style.color = '#fff';
  deleteBtn.style.border = 'none';
  deleteBtn.style.borderRadius = '6px';
  deleteBtn.style.padding = '10px 28px';
  deleteBtn.style.fontSize = '16px';
  deleteBtn.style.cursor = 'pointer';
  deleteBtn.addEventListener('click', () => {
    // Remove project from storage AND its history (keep arrays aligned)
    let projects = getProjectsFromStorage();
    projects.splice(idx, 1);
    saveProjectsToStorage(projects);
    // remove corresponding history entry
    const histories = getHistoriesFromStorage();
    if (idx >= 0 && idx < histories.length) {
      histories.splice(idx, 1);
      saveHistoriesToStorage(histories);
    }
    renderProjects();
    // If deletion removed the last project, show the empty main state
    if (typeof showEmptyMainIfNoProjects === 'function') showEmptyMainIfNoProjects();
    modal.remove();
  });

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(deleteBtn);
  box.appendChild(msg);
  box.appendChild(btnRow);
  modal.appendChild(box);
  document.body.appendChild(modal);
}

// --- Rename Modal ---
function showRenameModal(projectName, idx) {
  let modal = document.getElementById('renameProjectModal');
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = 'renameProjectModal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.08)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '2000';

  const box = document.createElement('div');
  box.style.background = '#ececf6';
  box.style.padding = '32px';
  box.style.borderRadius = '10px';
  box.style.boxShadow = '0 2px 16px rgba(0,0,0,0.10)';
  box.style.minWidth = '420px';
  box.style.textAlign = 'center';

  const title = document.createElement('div');
  title.style.fontSize = '1.25rem';
  title.style.color = '#1f2a5a';
  title.style.marginBottom = '12px';
  title.textContent = `Rename project '${projectName}'`;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = projectName;
  input.style.width = '100%';
  input.style.padding = '10px 12px';
  input.style.fontSize = '16px';
  input.style.marginBottom = '18px';
  input.style.borderRadius = '6px';
  input.style.border = '1px solid #cfcfe6';

  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.justifyContent = 'center';
  btnRow.style.gap = '20px';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.background = '#fff';
  cancelBtn.style.border = '1.5px solid #D1D5DB';
  cancelBtn.style.borderRadius = '6px';
  cancelBtn.style.padding = '8px 20px';
  cancelBtn.style.fontSize = '16px';
  cancelBtn.style.cursor = 'pointer';
  cancelBtn.addEventListener('click', () => modal.remove());

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm';
  confirmBtn.style.background = '#2CA0A0';
  confirmBtn.style.color = '#fff';
  confirmBtn.style.border = 'none';
  confirmBtn.style.borderRadius = '6px';
  confirmBtn.style.padding = '8px 20px';
  confirmBtn.style.fontSize = '16px';
  confirmBtn.style.cursor = 'pointer';
  confirmBtn.addEventListener('click', () => {
    const newName = input.value.trim();
    if (!newName) return;
    let projects = getProjectsFromStorage();
    projects[idx] = newName;
    saveProjectsToStorage(projects);
    renderProjects();
    modal.remove();
  });

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(confirmBtn);
  box.appendChild(title);
  box.appendChild(input);
  box.appendChild(btnRow);
  modal.appendChild(box);
  document.body.appendChild(modal);
  input.focus();
}

  if (openByDefault) {
    openGroup(group);
  }

  group.appendChild(header);
  group.appendChild(sublinks);
  projectList.appendChild(group);
  return group;
}

function setActiveSublink(container, activeEl) {
  $$('.side-sublink', container).forEach((a) => {
    a.classList.remove('active');
    a.classList.add('inactive');
  });
  activeEl.classList.remove('inactive');
  activeEl.classList.add('active');
}

function openGroup(group) {
  const sub = $('.project-sublinks', group);
  const chev = $('.project-chevron', group);
  if (!sub) return;
  group.classList.add('open');
  sub.style.display = 'block';
  sub.style.flexDirection = 'column';
  if (chev) chev.style.transform = 'rotate(180deg)';
}

function closeGroup(group) {
  const sub = $('.project-sublinks', group);
  const chev = $('.project-chevron', group);
  if (!sub) return;
  group.classList.remove('open');
  sub.style.display = 'none';
  if (chev) chev.style.transform = 'rotate(0deg)';
}

function closeAllGroups() {
  $$('.project-group', projectList).forEach(closeGroup);
}


const browseBtn = document.querySelector('.browse-btn');
const hiddenFileInput = document.querySelector('#hiddenFileInput');
const fileInputDisplay = document.querySelector('#fileInput');

if (browseBtn && hiddenFileInput) {
  browseBtn.addEventListener('click', () => {
    hiddenFileInput.click();
  });

  hiddenFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        alert('Please select a PDF file.');
        hiddenFileInput.value = '';
        if (fileInputDisplay) fileInputDisplay.value = '';
        return;
      }
      if (fileInputDisplay) fileInputDisplay.value = file.name;
    }
  });
}



// Target file-specific and text-specific buttons separately to avoid enabling the wrong one
const fileUploadBtn = document.querySelector('#fileUploadBtn');
const fileCancelBtn = document.querySelector('#fileCancelBtn');
const textUploadBtn = document.querySelector('#textUploadBtn');
const textCancelBtn = document.querySelector('#textCancelBtn');

// Initialize button disabled states
if (fileUploadBtn) {
  fileUploadBtn.disabled = true;
  fileUploadBtn.style.backgroundColor = '#9CA3AF';
  fileUploadBtn.style.cursor = 'not-allowed';
}
if (textUploadBtn) {
  textUploadBtn.disabled = true;
  textUploadBtn.style.backgroundColor = '#9CA3AF';
  textUploadBtn.style.cursor = 'not-allowed';
}

// When a file is selected, only enable the file upload button
if (hiddenFileInput) {
  hiddenFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      if (fileInputDisplay) fileInputDisplay.value = file.name;
      if (fileUploadBtn) {
        fileUploadBtn.disabled = false;
        fileUploadBtn.style.backgroundColor = '#2CA0A0';
        fileUploadBtn.style.cursor = 'pointer';
      }
    } else {
      if (fileInputDisplay) fileInputDisplay.value = '';
      if (fileUploadBtn) {
        fileUploadBtn.disabled = true;
        fileUploadBtn.style.backgroundColor = '#9CA3AF';
        fileUploadBtn.style.cursor = 'not-allowed';
      }
    }
  });
}

// File upload click handler
if (fileUploadBtn) {
  fileUploadBtn.addEventListener('click', () => {
    if (!fileUploadBtn.disabled) {
      try {
        const params = new URLSearchParams(window.location.search);
        const idx = parseInt(params.get('idx'), 10);
        const fileName = (hiddenFileInput && hiddenFileInput.files && hiddenFileInput.files[0]) ? hiddenFileInput.files[0].name : (fileInputDisplay ? fileInputDisplay.value : 'Uploaded File');
        if (!Number.isNaN(idx)) {
          addHistoryEntryForProject(idx, {
            date: new Date().toISOString(),
            name: fileName,
            score: 2
          });
        }
      } catch (e) {
        // ignore storage errors
      }
      // navigate to results (preserve idx if present)
      const qs = window.location.search || '';
      window.location.href = `results.html${qs}`;
    }
  });
}

// File cancel clears only file-related fields and disables file upload button
if (fileCancelBtn && fileInputDisplay && hiddenFileInput && fileUploadBtn) {
  fileCancelBtn.addEventListener('click', () => {
    fileInputDisplay.value = '';
    hiddenFileInput.value = '';
    fileUploadBtn.disabled = true;
    fileUploadBtn.style.backgroundColor = '#9CA3AF';
    fileUploadBtn.style.cursor = 'not-allowed';
  });
}



const uploadOptions = document.querySelectorAll('.upload-option');
const dropzone = document.querySelector('.dropzone');
const dropMeta = document.querySelector('.drop-meta');
const fileSection = document.querySelector('.file-section');
const textSection = document.querySelector('.text-submit-section');

uploadOptions.forEach(option => {
  option.addEventListener('click', () => {
    uploadOptions.forEach(o => o.classList.remove('selected'));
    option.classList.add('selected');

    if (option.textContent.includes('Submit text')) {
      dropzone.style.display = 'none';
      dropMeta.style.display = 'none';
      fileSection.style.display = 'none';
      textSection.style.display = 'flex';
        // disable file upload UI when switching to text
        if (fileUploadBtn) {
          fileUploadBtn.disabled = true;
          fileUploadBtn.style.backgroundColor = '#9CA3AF';
          fileUploadBtn.style.cursor = 'not-allowed';
        }
        if (fileInputDisplay) fileInputDisplay.value = '';
        if (hiddenFileInput) hiddenFileInput.value = '';
    } else {
      dropzone.style.display = 'block';
      dropMeta.style.display = 'block';
      fileSection.style.display = 'block';
      textSection.style.display = 'none';
        // disable text upload UI when switching to file
        if (textUploadBtn) {
          textUploadBtn.disabled = true;
          textUploadBtn.style.backgroundColor = '#9CA3AF';
          textUploadBtn.style.cursor = 'not-allowed';
        }
        if (manualText) manualText.value = '';
    }
    updateRadioStyles();
  });
});


const updateRadioStyles = () => {
  uploadOptions.forEach(option => {
    const outer = option.querySelector('.radio-outer');
    const inner = option.querySelector('.radio-inner');
    if (option.classList.contains('selected')) {
      if (!inner) {
        const dot = document.createElement('div');
        dot.className = 'radio-inner';
        outer.appendChild(dot);
      }
    } else {
      if (inner) inner.remove();
    }
  });
};


const manualText = document.querySelector('#manualText');
// textUploadBtn is declared earlier (by ID)

if (manualText && textUploadBtn) {
  textUploadBtn.disabled = true;
  textUploadBtn.style.backgroundColor = '#9CA3AF';
  textUploadBtn.style.cursor = 'not-allowed';

  manualText.addEventListener('input', () => {
    const hasText = manualText.value.trim().length > 0;
    if (hasText) {
      textUploadBtn.disabled = false;
      textUploadBtn.style.backgroundColor = '#2CA0A0';
      textUploadBtn.style.cursor = 'pointer';
    } else {
      textUploadBtn.disabled = true;
      textUploadBtn.style.backgroundColor = '#9CA3AF';
      textUploadBtn.style.cursor = 'not-allowed';
    }
  });

  textUploadBtn.addEventListener('click', () => {
    if (!textUploadBtn.disabled) {
      try {
        const params = new URLSearchParams(window.location.search);
        const idx = parseInt(params.get('idx'), 10);
        const fileName = 'Manual Submission';
        if (!Number.isNaN(idx)) {
          addHistoryEntryForProject(idx, {
            date: new Date().toISOString(),
            name: fileName,
            score: 2
          });
        }
      } catch (e) {}
      const qs = window.location.search || '';
      window.location.href = `results.html${qs}`;
    }
  });
}
