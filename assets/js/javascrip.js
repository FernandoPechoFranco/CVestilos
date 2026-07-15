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
const templateGrid = document.getElementById('templateGrid');
const photoFrame = document.querySelector('.photo-editor-frame');

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

const scrollToTemplates = document.getElementById('scrollToTemplates');
const openExport = document.getElementById('openExport');
const closeExport = document.getElementById('closeExport');
const printCv = document.getElementById('printCv');
const downloadPdf = document.getElementById('downloadPdf');

const baseTemplates = [
  { id: 'classic', label: 'Classic', desc: 'Profesional, limpio y equilibrado' },
  { id: 'sidebar', label: 'Sidebar', desc: 'Columna lateral con contraste' },
  { id: 'modern', label: 'Modern', desc: 'Minimalista con bloques grandes' },
  { id: 'executive', label: 'Executive', desc: 'Oscuro y elegante' },
  { id: 'compact', label: 'Compact', desc: 'Más información en menos espacio' },
];

const palette = [
  { name: 'navy', color: '#0c5a8d' },
  { name: 'sand', color: '#c18b2a' },
  { name: 'slate', color: '#334155' },
  { name: 'forest', color: '#166534' },
  { name: 'wine', color: '#7c2d12' },
  { name: 'sky', color: '#2563eb' },
  { name: 'graphite', color: '#1f2937' },
  { name: 'rose', color: '#be185d' },
  { name: 'teal', color: '#0f766e' },
  { name: 'violet', color: '#5b21b6' },
];

let pendingPhotoData = '';
let photoState = { zoom: 1, x: 0, y: 0 };
let dragging = false;
let dragStart = { x: 0, y: 0 };
let dragOrigin = { x: 0, y: 0 };
let activeTemplate = 'classic';

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

function setTemplate(template, variant = '') {
  activeTemplate = template;
  resume.className = `resume-preview template-${template}`;
  document.body.dataset.template = template;
  document.body.dataset.variant = variant;

  document.querySelectorAll('[data-template]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.template === template);
    btn.classList.toggle('selected', btn.dataset.template === template);
  });

  document.querySelectorAll('[data-color]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === variant);
  });
}

function createTemplateCard(template, variant, index) {
  const button = document.createElement('button');
  button.className = 'start-template';
  button.dataset.template = template.id;
  button.dataset.variant = variant.name;
  button.style.setProperty('--preview-accent', variant.color);
  button.innerHTML = `
    <span class="template-preview ${template.id} ${variant.name}"></span>
    <strong>${template.label}</strong>
    <small>${template.desc} · ${variant.name}</small>
  `;
  button.addEventListener('click', () => {
    setTemplate(template.id, variant.name);
    closeStartModal();
  });
  return button;
}

function renderGallery() {
  startGallery.innerHTML = '';
  templateGrid.innerHTML = '';
  const all = [];

  baseTemplates.forEach(template => {
    palette.forEach(variant => {
      all.push({ template, variant });
    });
  });

  all.slice(0, 50).forEach(({ template, variant }, index) => {
    const card = createTemplateCard(template, variant, index);
    startGallery.appendChild(card);

    const tile = createTemplateCard(template, variant, index);
    tile.className = 'template-card';
    tile.innerHTML = `
      <span class="template-preview ${template.id} ${variant.name}"></span>
      <strong>${template.label}</strong>
      <small>${template.desc}</small>
    `;
    tile.addEventListener('click', () => {
      setTemplate(template.id, variant.name);
      closeStartModal();
    });
    templateGrid.appendChild(tile);
  });
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
  closePhotoModal();
});

photoModal.addEventListener('click', event => {
  if (event.target === photoModal) closePhotoModal();
});

scrollToTemplates.addEventListener('click', () => {
  document.getElementById('templatesSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
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

closeStart.addEventListener('click', closeStartModal);

chooseTemplate.addEventListener('click', () => {
  const selected = startGallery.querySelector('.start-template.selected') || startGallery.querySelector('.start-template');
  if (selected) setTemplate(selected.dataset.template, selected.dataset.variant);
  closeStartModal();
});

document.addEventListener('click', event => {
  const tile = event.target.closest('.start-template, .template-card');
  if (!tile || !tile.dataset.template) return;
  const variant = tile.dataset.variant || tile.dataset.color || '';
  setTemplate(tile.dataset.template, variant);
});

renderGallery();
syncPreview();
setTemplate('classic', 'navy');
startModal.classList.add('open');
