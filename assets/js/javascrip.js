const resume = document.getElementById('resume');
const modal = document.getElementById('exportModal');
const startModal = document.getElementById('startModal');
const photoInput = document.getElementById('photo');
const previewPhoto = document.getElementById('previewPhoto');
const closeStart = document.getElementById('closeStart');
const chooseTemplate = document.getElementById('chooseTemplate');
const colorPills = document.getElementById('colorPills');
const startGallery = document.getElementById('startGallery');
const shapeCircle = document.getElementById('shapeCircle');
const shapeSquare = document.getElementById('shapeSquare');

const photoTransform = {
  x: 0,
  y: 0,
  scale: 1,
  dragging: false,
  pointerId: null,
  startX: 0,
  startY: 0,
};

const bindings = {
  name: document.getElementById('previewName'),
  headline: document.getElementById('previewHeadline'),
  email: document.getElementById('previewEmail'),
  phone: document.getElementById('previewPhone'),
  website: document.getElementById('previewWebsite'),
  location: document.getElementById('previewLocation'),
  salary: document.getElementById('previewSalary'),
  summary: document.getElementById('previewSummary'),
  experience1: document.getElementById('previewExperience1'),
  experience2: document.getElementById('previewExperience2'),
  experience3: document.getElementById('previewExperience3'),
  experience4: document.getElementById('previewExperience4'),
  education: document.getElementById('previewEducation'),
  skills: document.getElementById('previewSkills'),
  languages: document.getElementById('previewLanguages'),
};

const inputs = ['name', 'headline', 'email', 'phone', 'website', 'location', 'salary', 'summary', 'experience1', 'experience2', 'experience3', 'experience4', 'education', 'skills']
  .reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {});

const scrollToTop = document.getElementById('scrollToTemplates');
const openExport = document.getElementById('openExport');
const closeExport = document.getElementById('closeExport');
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

function createLanguageItem() {
  const item = document.createElement('div');
  item.className = 'language-item';
  item.innerHTML = `
    <label>
      <span>Idioma</span>
      <input type="text" class="language-name" placeholder="Ej. Español">
    </label>
    <label>
      <span>Nivel</span>
      <select class="language-level">
        <option value="">Selecciona</option>
        <option value="Básico">Básico</option>
        <option value="Intermedio">Intermedio</option>
        <option value="Avanzado">Avanzado</option>
      </select>
    </label>
    <button class="btn btn-link btn-remove-language" type="button">Eliminar</button>
  `;
  return item;
}

function getLanguageEntries() {
  if (!languageList) return [];
  return Array.from(languageList.querySelectorAll('.language-item')).map(item => {
    const name = item.querySelector('.language-name')?.value.trim() || '';
    const level = item.querySelector('.language-level')?.value || '';
    if (!name) return null;
    return level ? `${name} - ${level}` : name;
  }).filter(Boolean);
}

function toggleSection(section, isVisible) {
  if (!section) return;
  section.hidden = !isVisible;
}

function hideEmptyPreviewSections() {
  toggleSection(document.querySelector('.resume-section.summary'), Boolean(inputs.summary.value.trim()));
  toggleSection(document.querySelector('.resume-section.experience'), Boolean(inputs.experience1.value.trim() || inputs.experience2.value.trim() || inputs.experience3.value.trim() || inputs.experience4.value.trim()));
  toggleSection(document.querySelector('.resume-section.education'), Boolean(inputs.education.value.trim()));
  toggleSection(document.querySelector('.resume-section.skills'), Boolean(inputs.skills.value.trim()));
  toggleSection(document.querySelector('.resume-section.languages'), Boolean(getLanguageEntries().length));
  toggleSection(document.querySelector('.resume-nameblock'), Boolean(inputs.name.value.trim() || inputs.headline.value.trim()));
  toggleSection(document.querySelector('.resume-contact'), ['email', 'phone', 'website', 'location', 'salary'].some(id => inputs[id].value.trim()));

  ['email', 'phone', 'website', 'location', 'salary'].forEach(id => {
    const strong = bindings[id];
    if (strong) {
      const parent = strong.parentElement;
      parent.hidden = !strong.textContent.trim();
    }
  });
}

function syncPreview() {
  bindings.name.textContent = inputs.name.value;
  bindings.headline.textContent = inputs.headline.value;
  bindings.email.textContent = inputs.email.value;
  bindings.phone.textContent = inputs.phone.value;
  bindings.website.textContent = inputs.website.value;
  bindings.location.textContent = inputs.location.value;
  bindings.salary.textContent = inputs.salary.value;
  bindings.summary.textContent = inputs.summary.value;
  bindings.experience1.textContent = inputs.experience1.value;
  bindings.experience2.textContent = inputs.experience2.value;
  bindings.experience3.textContent = inputs.experience3.value;
  bindings.experience4.textContent = inputs.experience4.value;
  bindings.education.textContent = inputs.education.value;
  renderList(bindings.skills, inputs.skills.value);
  renderList(bindings.languages, getLanguageEntries().join('\n'));
  hideEmptyPreviewSections();
}

function closeStartModal() {
  startModal.classList.remove('open');
  startModal.setAttribute('aria-hidden', 'true');
}

function setPhotoShape(shape) {
  photoShape = shape;
  previewPhoto.parentElement.classList.toggle('circle', shape === 'circle');
  previewPhoto.parentElement.classList.toggle('square', shape === 'square');
  shapeCircle.classList.toggle('active', shape === 'circle');
  shapeSquare.classList.toggle('active', shape === 'square');
}

function updatePhotoTransform() {
  previewPhoto.style.transform = `translate(calc(-50% + ${photoTransform.x}px), calc(-50% + ${photoTransform.y}px)) scale(${photoTransform.scale})`;
}

function resetPhotoTransform() {
  photoTransform.x = 0;
  photoTransform.y = 0;
  photoTransform.scale = 1;
  updatePhotoTransform();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

previewPhoto.addEventListener('pointerdown', event => {
  if (event.button !== 2) return;
  event.preventDefault();
  previewPhoto.setPointerCapture(event.pointerId);
  photoTransform.dragging = true;
  photoTransform.pointerId = event.pointerId;
  photoTransform.startX = event.clientX;
  photoTransform.startY = event.clientY;
  previewPhoto.classList.add('dragging');
});

previewPhoto.addEventListener('pointermove', event => {
  if (!photoTransform.dragging || event.pointerId !== photoTransform.pointerId) return;
  const deltaX = event.clientX - photoTransform.startX;
  const deltaY = event.clientY - photoTransform.startY;
  photoTransform.x += deltaX;
  photoTransform.y += deltaY;
  photoTransform.startX = event.clientX;
  photoTransform.startY = event.clientY;
  updatePhotoTransform();
});

previewPhoto.addEventListener('pointerup', event => {
  if (event.pointerId !== photoTransform.pointerId) return;
  photoTransform.dragging = false;
  photoTransform.pointerId = null;
  previewPhoto.releasePointerCapture(event.pointerId);
  previewPhoto.classList.remove('dragging');
});

previewPhoto.addEventListener('pointercancel', () => {
  photoTransform.dragging = false;
  photoTransform.pointerId = null;
  previewPhoto.classList.remove('dragging');
});

previewPhoto.addEventListener('contextmenu', event => {
  event.preventDefault();
});

previewPhoto.addEventListener('wheel', event => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -0.08 : 0.08;
  photoTransform.scale = clamp(photoTransform.scale + delta, 0.6, 2.5);
  updatePhotoTransform();
});

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
  reader.onload = event => {
    previewPhoto.src = event.target.result;
    previewPhoto.style.transform = 'translate(-50%, -50%) scale(1)';
    setPhotoShape(photoShape);
  };
  reader.readAsDataURL(file);
});

function downloadCvPdf() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  window.print();
}

openExport.addEventListener('click', () => {
  downloadCvPdf();
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

downloadPdf.addEventListener('click', () => {
  downloadCvPdf();
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

const addExperience = document.getElementById('addExperience');
const experienceWrappers = [
  document.getElementById('experience2Wrapper'),
  document.getElementById('experience3Wrapper'),
  document.getElementById('experience4Wrapper'),
].filter(Boolean);
const updateAddButton = () => {
  if (!addExperience) return;
  addExperience.hidden = !experienceWrappers.some(wrapper => wrapper.classList.contains('hidden'));
};
if (addExperience && experienceWrappers.length) {
  addExperience.addEventListener('click', () => {
    const nextHidden = experienceWrappers.find(wrapper => wrapper.classList.contains('hidden'));
    if (nextHidden) {
      nextHidden.classList.remove('hidden');
      const textarea = nextHidden.querySelector('textarea');
      if (textarea) textarea.focus();
    }
    updateAddButton();
  });
}

document.querySelectorAll('.btn-remove').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.remove;
    const target = document.getElementById(targetId);
    if (target) {
      const textarea = target.querySelector('textarea');
      if (textarea) textarea.value = '';
      target.classList.add('hidden');
      updateAddButton();
      syncPreview();
    }
  });
});

const addLanguage = document.getElementById('addLanguage');
const languageList = document.getElementById('languageList');
if (addLanguage && languageList) {
  addLanguage.addEventListener('click', () => {
    const newItem = createLanguageItem();
    languageList.appendChild(newItem);
    newItem.querySelector('.language-name')?.focus();
  });
  languageList.addEventListener('input', event => {
    if (event.target.matches('.language-name, .language-level')) {
      syncPreview();
    }
  });
  languageList.addEventListener('click', event => {
    if (event.target.matches('.btn-remove-language')) {
      const item = event.target.closest('.language-item');
      if (item) {
        item.remove();
        syncPreview();
      }
    }
  });
}

renderPills();
buildGallery();
syncPreview();
applyPreset(createPreset(0));
setPhotoShape('circle');
startModal.classList.add('open');
