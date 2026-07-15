const resume = document.getElementById('resume');
const modal = document.getElementById('exportModal');
const startModal = document.getElementById('startModal');
const photoModal = document.getElementById('photoModal');
const photoInput = document.getElementById('photo');
const previewPhoto = document.getElementById('previewPhoto');
const photoEditorImage = document.getElementById('photoEditorImage');
const photoCancel = document.getElementById('photoCancel');
const photoAccept = document.getElementById('photoAccept');
const closeStart = document.getElementById('closeStart');
const chooseTemplate = document.getElementById('chooseTemplate');
const colorPills = document.getElementById('colorPills');
const startGallery = document.getElementById('startGallery');
const photoFrame = document.querySelector('.photo-editor-frame');
const photoEditorFrame = document.getElementById('photoEditorFrame');
const shapeCircle = document.getElementById('shapeCircle');
const shapeSquare = document.getElementById('shapeSquare');

const bindings = {
  name: document.getElementById('previewName'),
  headline: document.getElementById('previewHeadline'),
  email: document.getElementById('previewEmail'),
  phone: document.getElementById('previewPhone'),
  website: document.getElementById('previewWebsite'),
  location: document.getElementById('previewLocation'),
  summary: document.getElementById('previewSummary'),
  experience1: document.getElementById('previewExperience1'),
  experience2: document.getElementById('previewExperience2'),
  education: document.getElementById('previewEducation'),
  skills: document.getElementById('previewSkills'),
  languages: document.getElementById('previewLanguages'),
};

const inputs = ['name', 'headline', 'email', 'phone', 'website', 'location', 'summary', 'experience1', 'experience2', 'education', 'skills', 'languages']
  .reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {});

const scrollToTop = document.getElementById('scrollToTemplates');
const openExport = document.getElementById('openExport');
const closeExport = document.getElementById('closeExport');
const printCv = document.getElementById('printCv');
const downloadPdf = document.getElementById('downloadPdf');

const presetCount = 50;
const layouts = ['a', 'b', 'c', 'd', 'e'];
const accents = [
  { name: 'navy', accent: '#eab308', dark: '#243b53' },
  { name: 'teal', accent: '#14b8a6', dark: '#0f766e' },
  { name: 'brick', accent: '#fb923c', dark: '#7c2d12' },
  { name: 'violet', accent: '#c4b5fd', dark: '#5b21b6' },
  { name: 'graphite', accent: '#60a5fa', dark: '#111827' },
];

let pendingPhotoData = '';
let photoState = { zoom: 1, x: 0, y: 0 };
let dragging = false;
let dragStart = { x: 0, y: 0 };
let dragOrigin = { x: 0, y: 0 };
let selectedPreset = null;
let photoShape = 'circle';

function linesToList(text) {
  return text.split('\n').map(line => line.trim()).filter(Boolean);
}

function renderList(target, text) {
  target.innerHTML = '';
  linesToList(text).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    target.appendChild(li);
  });
}

function syncPreview() {
  bindings.name.textContent = inputs.name.value;
  bindings.headline.textContent = inputs.headline.value;
  bindings.email.textContent = inputs.email.value;
  bindings.phone.textContent = inputs.phone.value;
  bindings.website.textContent = inputs.website.value;
  bindings.location.textContent = inputs.location.value;
  bindings.summary.textContent = inputs.summary.value;
  bindings.experience1.textContent = inputs.experience1.value;
  bindings.experience2.textContent = inputs.experience2.value;
  bindings.education.textContent = inputs.education.value;
  renderList(bindings.skills, inputs.skills.value);
  renderList(bindings.languages, inputs.languages.value);
}

function photoTransform() {
  return `translate(-50%, -50%) translate(${photoState.x}px, ${photoState.y}px) scale(${photoState.zoom})`;
}

function applyPhotoTransform() {
  previewPhoto.style.transform = photoTransform();
  photoEditorImage.style.transform = photoTransform();
}

function openPhotoModal(src) {
  pendingPhotoData = src;
  photoEditorImage.src = src;
  photoState = { zoom: 1, x: 0, y: 0 };
  photoModal.classList.add('open');
  photoModal.setAttribute('aria-hidden', 'false');
  applyPhotoTransform();
}

function closePhotoModal() {
  photoModal.classList.remove('open');
  photoModal.setAttribute('aria-hidden', 'true');
  dragging = false;
  photoFrame.classList.remove('dragging');
}

function closeStartModal() {
  startModal.classList.remove('open');
  startModal.setAttribute('aria-hidden', 'true');
}

function setPhotoShape(shape) {
  photoShape = shape;
  photoEditorFrame.classList.toggle('circle', shape === 'circle');
  photoEditorFrame.classList.toggle('square', shape === 'square');
  previewPhoto.parentElement.classList.toggle('circle', shape === 'circle');
  previewPhoto.parentElement.classList.toggle('square', shape === 'square');
  shapeCircle.classList.toggle('active', shape === 'circle');
  shapeSquare.classList.toggle('active', shape === 'square');
}

function renderPills() {
  colorPills.innerHTML = '';
  accents.forEach((accent, index) => {
    const btn = document.createElement('button');
    btn.className = 'color-pill';
    btn.dataset.color = accent.name;
    btn.style.background = accent.accent;
    btn.title = accent.name;
    btn.addEventListener('click', () => {
      if (!selectedPreset) selectedPreset = { layout: layouts[index % layouts.length], accent: accent.name, accentColor: accent.accent, darkColor: accent.dark };
      applyPreset({ ...selectedPreset, accent: accent.name, accentColor: accent.accent, darkColor: accent.dark });
    });
    colorPills.appendChild(btn);
  });
}

function createPreset(index) {
  const layout = layouts[index % layouts.length];
  const accent = accents[index % accents.length];
  return {
    id: `preset-${String(index + 1).padStart(2, '0')}`,
    name: `Modelo ${index + 1}`,
    desc: `A4 ${layout.toUpperCase()} · ${accent.name}`,
    layout,
    accent: accent.name,
    accentColor: accent.accent,
    darkColor: accent.dark,
  };
}

function applyPreset(preset) {
  selectedPreset = preset;
  resume.className = `resume-preview`;
  resume.dataset.layout = preset.layout;
  resume.style.setProperty('--accent', preset.accentColor);
  resume.style.setProperty('--accent-dark', preset.darkColor);
  document.body.dataset.template = preset.layout;

  document.querySelectorAll('.start-template').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.preset === preset.id);
  });
  if (colorPills.children.length) {
    [...colorPills.children].forEach(btn => btn.classList.toggle('active', btn.dataset.color === preset.accent));
  }
}

function buildGallery() {
  startGallery.innerHTML = '';
  for (let i = 0; i < presetCount; i++) {
    const preset = createPreset(i);
    const btn = document.createElement('button');
    btn.className = 'start-template';
    btn.dataset.preset = preset.id;
    btn.dataset.layout = preset.layout;
    btn.innerHTML = `
      <span class="template-preview layout-${preset.layout} ${preset.accent}"></span>
      <strong>${preset.name}</strong>
      <small>${preset.desc}</small>
    `;
    btn.addEventListener('click', () => {
      applyPreset(preset);
      closeStartModal();
    });
    startGallery.appendChild(btn);
  }
}

Object.values(inputs).forEach(input => input.addEventListener('input', syncPreview));

photoInput.addEventListener('change', () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = event => openPhotoModal(event.target.result);
  reader.readAsDataURL(file);
});

photoEditorImage.addEventListener('wheel', event => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -0.08 : 0.08;
  photoState.zoom = Math.min(3, Math.max(1, photoState.zoom + delta));
  applyPhotoTransform();
}, { passive: false });

photoEditorImage.addEventListener('pointerdown', event => {
  dragging = true;
  dragStart = { x: event.clientX, y: event.clientY };
  dragOrigin = { x: photoState.x, y: photoState.y };
  photoFrame.classList.add('dragging');
  photoEditorImage.setPointerCapture(event.pointerId);
});

photoEditorImage.addEventListener('pointermove', event => {
  if (!dragging) return;
  photoState.x = dragOrigin.x + (event.clientX - dragStart.x);
  photoState.y = dragOrigin.y + (event.clientY - dragStart.y);
  applyPhotoTransform();
});

['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => {
  photoEditorImage.addEventListener(evt, () => {
    dragging = false;
    photoFrame.classList.remove('dragging');
  });
});

photoCancel.addEventListener('click', () => {
  photoInput.value = '';
  closePhotoModal();
});

photoAccept.addEventListener('click', () => {
  previewPhoto.src = pendingPhotoData;
  previewPhoto.style.transform = photoTransform();
  setPhotoShape(photoShape);
  closePhotoModal();
});

photoModal.addEventListener('click', event => {
  if (event.target === photoModal) closePhotoModal();
});

openExport.addEventListener('click', () => {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
});

closeExport.addEventListener('click', () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
});

modal.addEventListener('click', event => {
  if (event.target === modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
});

printCv.addEventListener('click', () => {
  modal.classList.remove('open');
  window.print();
});

downloadPdf.addEventListener('click', () => {
  modal.classList.remove('open');
  window.print();
});

scrollToTop.addEventListener('click', () => {
  startModal.classList.add('open');
  startModal.setAttribute('aria-hidden', 'false');
});

closeStart.addEventListener('click', closeStartModal);

chooseTemplate.addEventListener('click', () => {
  if (selectedPreset) applyPreset(selectedPreset);
  closeStartModal();
});

shapeCircle.addEventListener('click', () => setPhotoShape('circle'));
shapeSquare.addEventListener('click', () => setPhotoShape('square'));

renderPills();
buildGallery();
syncPreview();
applyPreset(createPreset(0));
setPhotoShape('circle');
startModal.classList.add('open');
