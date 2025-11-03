const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));


const newProjectBtn = $('#newProjectBtn');
const projectList = $('#projectList');

if (projectList && newProjectBtn) {
 
  initProjects();


  newProjectBtn.addEventListener('click', () => {
    const nextIndex = getNextProjectIndex();
    const group = createProjectGroup(`Project Name ${nextIndex}`);

    closeAllGroups();
    openGroup(group);

    group.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}



function initProjects() {
  const existing = $$('.project-group', projectList);
  if (existing.length === 0) {
    const first = createProjectGroup('Project Name 1');
    openGroup(first);
  } else {
    closeAllGroups();
    openGroup(existing[0]);
  }
}

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

function createProjectGroup(projectName) {
  const group = document.createElement('div');
  group.className = 'project-group';

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

  const sublinks = document.createElement('div');
  sublinks.className = 'project-sublinks';
  sublinks.style.display = 'none';
  sublinks.style.flexDirection = 'column';

  const uploadLink = document.createElement('a');
  uploadLink.href = '#';
  uploadLink.className = 'side-sublink active';
  uploadLink.textContent = 'Upload New File';
  uploadLink.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveSublink(sublinks, uploadLink);
  });

  const historyLink = document.createElement('a');
  historyLink.href = '#';
  historyLink.className = 'side-sublink inactive';
  historyLink.textContent = 'History';
  historyLink.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveSublink(sublinks, historyLink);
  });

  sublinks.appendChild(uploadLink);
  sublinks.appendChild(historyLink);

  header.addEventListener('click', () => {
    const isOpen = group.classList.contains('open');
    if (isOpen) closeGroup(group);
    else {
      closeAllGroups();
      openGroup(group);
    }
  });

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



const uploadBtn = document.querySelector('.upload-btn');
const cancelBtn = document.querySelector('.cancel-btn');

if (uploadBtn) {
  uploadBtn.disabled = true;
  uploadBtn.style.backgroundColor = '#9CA3AF';
  uploadBtn.style.cursor = 'not-allowed';
}

if (hiddenFileInput) {
  hiddenFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      uploadBtn.disabled = false;
      uploadBtn.style.backgroundColor = '#2CA0A0';
      uploadBtn.style.cursor = 'pointer';
    } else {
      uploadBtn.disabled = true;
      uploadBtn.style.backgroundColor = '#9CA3AF';
      uploadBtn.style.cursor = 'not-allowed';
    }
  });
}

if (uploadBtn) {
  uploadBtn.addEventListener('click', () => {
    if (!uploadBtn.disabled) {
      window.location.href = 'results.html';
    }
  });
}

if (cancelBtn && fileInputDisplay && hiddenFileInput && uploadBtn) {
  cancelBtn.addEventListener('click', () => {
    fileInputDisplay.value = '';
    hiddenFileInput.value = '';
    uploadBtn.disabled = true;
    uploadBtn.style.backgroundColor = '#9CA3AF';
    uploadBtn.style.cursor = 'not-allowed';
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
    } else {
      dropzone.style.display = 'block';
      dropMeta.style.display = 'block';
      fileSection.style.display = 'block';
      textSection.style.display = 'none';
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
const textUploadBtn = document.querySelector('.submit-text-btn');

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
      window.location.href = 'results.html';
    }
  });
}
