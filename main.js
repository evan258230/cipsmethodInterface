/* ===== Sidebar Projects: create / toggle ===== */

/**
 * Utility: qs and qsa
 */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/**
 * Grab the key elements defined in your HTML:
 * - #newProjectBtn    : the "+ New Project" button
 * - #projectList      : container where project groups live
 */
const newProjectBtn = $('#newProjectBtn');
const projectList = $('#projectList');

/**
 * Guard: if these elements don't exist, bail quietly so nothing errors.
 */
if (projectList && newProjectBtn) {
  // Ensure initial state
  initProjects();

  // Hook up the "+ New Project" button
  newProjectBtn.addEventListener('click', () => {
    const nextIndex = getNextProjectIndex();
    const group = createProjectGroup(`Project Name ${nextIndex}`);
    // Close all other groups and open the new one
    closeAllGroups();
    openGroup(group);
    // Scroll to it (nice touch)
    group.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* ================== Core Functions ================== */

/**
 * Initialize with one project if none exist.
 */
function initProjects() {
  const existing = $$('.project-group', projectList);
  if (existing.length === 0) {
    const first = createProjectGroup('Project Name 1');
    openGroup(first);
  } else {
    // Make sure only the first one is open on load
    closeAllGroups();
    openGroup(existing[0]);
  }
}

/**
 * Determine the next project index by scanning existing names.
 * Looks for names like "Project Name 1", "Project Name 2", ...
 */
function getNextProjectIndex() {
  const groups = $$('.project-group', projectList);
  if (groups.length === 0) return 1;
  let maxN = 0;
  for (const g of groups) {
    const nameEl = $('.project-name', g);
    if (!nameEl) continue;
    const m = nameEl.textContent.trim().match(/(\d+)\s*$/);
    if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
  }
  return maxN + 1;
}

/**
 * Create a single project group DOM node:
 * - header row with name + chevron
 * - sublinks area with "Upload New File" and "History"
 */
function createProjectGroup(projectName) {
  const group = document.createElement('div');
  group.className = 'project-group';

  // Header / toggle row
  const header = document.createElement('div');
  header.className = 'project-container';

  const name = document.createElement('div');
  name.className = 'project-name';
  name.textContent = projectName;

  const chevron = document.createElement('div');
  chevron.className = 'project-chevron';
  chevron.setAttribute('aria-hidden', 'true');
  chevron.textContent = '▾';

  header.appendChild(name);
  header.appendChild(chevron);

  // Sublinks
  const sublinks = document.createElement('div');
  sublinks.className = 'project-sublinks';
  sublinks.style.display = 'none';
sublinks.style.flexDirection = 'column'; // stack Upload/History vertically


  // "Upload New File"
  const uploadLink = document.createElement('a');
  uploadLink.href = '#';
  uploadLink.className = 'side-sublink active';
  uploadLink.textContent = 'Upload New File';
  uploadLink.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveSublink(sublinks, uploadLink);
    // Hook for later: navigate to upload page section, etc.
  });

  // "History"
  const historyLink = document.createElement('a');
  historyLink.href = '#';
  historyLink.className = 'side-sublink inactive';
  historyLink.textContent = 'History';
  historyLink.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveSublink(sublinks, historyLink);
    // Hook for later: show history, etc.
  });

  sublinks.appendChild(uploadLink);
  sublinks.appendChild(historyLink);

  // Toggle open/close on header click
  header.addEventListener('click', () => {
    const isOpen = group.classList.contains('open');
    if (isOpen) {
      closeGroup(group);
    } else {
      closeAllGroups();
      openGroup(group);
    }
  });

  group.appendChild(header);
  group.appendChild(sublinks);
  projectList.appendChild(group);

  return group;
}

/**
 * Mark one of the sublinks as active and others inactive.
 */
function setActiveSublink(container, activeEl) {
  $$('.side-sublink', container).forEach((a) => {
    a.classList.remove('active');
    a.classList.add('inactive');
  });
  activeEl.classList.remove('inactive');
  activeEl.classList.add('active');
}

/**
 * Open/close helpers
 */
function openGroup(group) {
  const sub = $('.project-sublinks', group);
  const chev = $('.project-chevron', group);
  if (!sub) return;
  group.classList.add('open');
  sub.style.display = 'block'; // <-- stack vertically
  sub.style.flexDirection = 'column'; // ensure vertical layout
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
const fileInputDisplay = document.querySelector('#fileInput'); // visible text field

if (browseBtn && hiddenFileInput) {
  // When the user clicks the "Browse File" button
  browseBtn.addEventListener('click', () => {
    hiddenFileInput.click(); // programmatically open file picker
  });

  // When a file is selected
  hiddenFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      // Restrict to PDF only
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        alert('Please select a PDF file.');
        hiddenFileInput.value = ''; // reset invalid file
        if (fileInputDisplay) fileInputDisplay.value = '';
        return;
      }
      // Display file name in text field
      if (fileInputDisplay) {
        fileInputDisplay.value = file.name;
      }
    }
  });
}

/* ================== Browse & Upload Behavior Enhancements ================== */

// Hover effect handled via CSS (see below)

/**
 * Enable the Upload button after a valid PDF is chosen.
 * Clicking Upload will then redirect to results.html
 */
const uploadBtn = document.querySelector('.upload-btn');
const cancelBtn = document.querySelector('.cancel-btn');

if (uploadBtn) {
  // Disable Upload by default (gray look handled in CSS)
  uploadBtn.disabled = true;
  uploadBtn.style.backgroundColor = '#9CA3AF'; // keep initial gray
  uploadBtn.style.cursor = 'not-allowed';
}

// When a valid PDF file is selected
if (hiddenFileInput) {
  hiddenFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      // Enable Upload button
      uploadBtn.disabled = false;
      uploadBtn.style.backgroundColor = '#2CA0A0'; // active teal
      uploadBtn.style.cursor = 'pointer';
    } else {
      // Keep disabled
      uploadBtn.disabled = true;
      uploadBtn.style.backgroundColor = '#9CA3AF';
      uploadBtn.style.cursor = 'not-allowed';
    }
  });
}

// Clicking Upload navigates to results.html if enabled
if (uploadBtn) {
  uploadBtn.addEventListener('click', () => {
    if (!uploadBtn.disabled) {
      window.location.href = 'results.html'; // same directory
    }
  });
}

// Optional: reset on cancel
if (cancelBtn && fileInputDisplay && hiddenFileInput && uploadBtn) {
  cancelBtn.addEventListener('click', () => {
    fileInputDisplay.value = '';
    hiddenFileInput.value = '';
    uploadBtn.disabled = true;
    uploadBtn.style.backgroundColor = '#9CA3AF';
    uploadBtn.style.cursor = 'not-allowed';
  });
}
