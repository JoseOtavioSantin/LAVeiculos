import { seedIfEmpty, getAllCars, upsertCar, deleteCar, togglePublished, exportJson } from './db.js';
import { setTheme, getTheme, resetTheme, setLogo, getLogo, applyBrandLogo, setBrand, getBrand, applyBrandName } from './theme.js';
import { moneyBRL } from './utils.js';

// Utilitários
function by(sel) { return document.querySelector(sel); }
function all(sel, parent = document) { return Array.from(parent.querySelectorAll(sel)); }

// Elementos DOM
const els = {
  // Modal
  carModal: by('#carModal'),
  modalTitle: by('#modalTitle'),
  closeCarModal: by('#closeCarModal'),
  addCarBtn: by('#addCarBtn'),

  // Formulário
  form: by('#carForm'),
  id: by('#carId'),
  brand: by('#brand'),
  model: by('#model'),
  year: by('#year'),
  price: by('#price'),
  km: by('#km'),
  color: by('#color'),
  transmission: by('#transmission'),
  fuel: by('#fuel'),
  description: by('#description'),
  images: by('#images'),
  imagesFiles: by('#imagesFiles'),
  imagesPreview: by('#imagesPreview'),
  published: by('#published'),
  resetForm: by('#resetForm'),
  submitText: by('#submitText'),

  // Features
  feats: all('.feat'),

  // Tabela
  table: by('#carsTable tbody'),
  search: by('#searchAdmin'),
  exportJson: by('#exportJson'),
  importJson: by('#importJson'),
  emptyTableState: by('#emptyTableState'),

  // Consultores
  consultantsList: by('#consultantsList'),
  addConsultant: by('#addConsultant'),
  tplConsultant: by('#tplConsultant'),

  // Tema
  thPrimary: by('#themePrimary'),
  thBg: by('#themeBg'),
  thCard: by('#themeCard'),
  thText: by('#themeText'),
  thBorder: by('#themeBorder'),
  thChip: by('#themeChip'),
  logoInput: by('#logoInput'),
  logoPreview: by('#brandPreview'),
  resetThemeBtn: by('#resetTheme'),
  applyThemeBtn: by('#applyTheme'),
  brandText: by('#brandText'),

  // Stats
  totalCarsAdmin: by('#totalCarsAdmin'),
  publishedCars: by('#publishedCars'),
  draftCars: by('#draftCars'),
  totalBrandsAdmin: by('#totalBrandsAdmin')
};

// ================================
// CLASSE PRINCIPAL DO ADMIN
// ================================

class AdminManager {
  constructor() {
    this.cars = [];
    this.editingCarId = null;
    // A inicialização agora é chamada externamente, após o DOM estar pronto.
  }

  init() {
    seedIfEmpty();
    applyBrandLogo();
    applyBrandName();
    
    this.cars = getAllCars();
    this.updateStats();
    this.initThemeControls();
    this.bindEvents();
    this.renderTable();
  }

  // ================================
  // MODAL
  // ================================

  openModal(car = null) {
    this.editingCarId = car?.id || null;
    
    if (els.modalTitle) {
      els.modalTitle.textContent = car ? 'Editar Veículo' : 'Adicionar Novo Veículo';
    }
    
    if (els.submitText) {
      els.submitText.textContent = car ? 'Atualizar' : 'Salvar';
    }
    
    this.writeForm(car);
    
    if (els.carModal) {
      els.carModal.hidden = false;
      document.body.style.overflow = 'hidden';
      
      setTimeout(() => els.brand?.focus(), 100);
    }
  }

  closeModal() {
    if (els.carModal) {
      els.carModal.hidden = true;
      document.body.style.overflow = '';
      this.editingCarId = null;
      this.resetForm(); // Limpa o formulário ao fechar
    }
  }

  // ================================
  // ESTATÍSTICAS
  // ================================

  updateStats() {
    const published = this.cars.filter(c => c.published);
    const drafts = this.cars.filter(c => !c.published);
    const brands = [...new Set(this.cars.map(c => c.brand))];

    if (els.totalCarsAdmin) this.animateNumber(els.totalCarsAdmin, this.cars.length);
    if (els.publishedCars) this.animateNumber(els.publishedCars, published.length);
    if (els.draftCars) this.animateNumber(els.draftCars, drafts.length);
    if (els.totalBrandsAdmin) this.animateNumber(els.totalBrandsAdmin, brands.length);
  }

  animateNumber(element, end, duration = 1500) {
    if (!element) return; // Verificação de segurança
    
    const start = parseInt(element.textContent, 10) || 0;
    if (start === end) return;

    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * easeOut);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  // ================================
  // CONTROLES DE TEMA
  // ================================

  initThemeControls() {
    const cs = getComputedStyle(document.documentElement);
    const current = { 
      primary: getTheme().primary || cs.getPropertyValue('--primary').trim(),
      bg: getTheme().bg || cs.getPropertyValue('--bg').trim(),
      card: getTheme().card || cs.getPropertyValue('--card').trim(),
      text: getTheme().text || cs.getPropertyValue('--text').trim(),
      border: getTheme().border || cs.getPropertyValue('--border').trim(),
      chip: getTheme().chip || cs.getPropertyValue('--chip').trim(),
    };

    if (els.thPrimary) els.thPrimary.value = current.primary.startsWith('#') ? current.primary : '#667eea';
    if (els.thBg) els.thBg.value = current.bg.startsWith('#') ? current.bg : '#f8fafc';
    if (els.thCard) els.thCard.value = current.card.startsWith('#') ? current.card : '#ffffff';
    if (els.thText) els.thText.value = current.text.startsWith('#') ? current.text : '#1a202c';
    if (els.thBorder) els.thBorder.value = current.border.startsWith('#') ? current.border : '#e2e8f0';
    if (els.thChip) els.thChip.value = current.chip.startsWith('#') ? current.chip : '#f7fafc';

    const logo = getLogo();
    if (logo && els.logoPreview) {
      els.logoPreview.src = logo;
      els.logoPreview.style.display = 'block';
      const placeholder = els.logoPreview.parentElement.querySelector('.logo-preview__placeholder');
      if (placeholder) placeholder.style.display = 'none';
    }

    if (els.brandText) {
      els.brandText.value = getBrand();
    }
  }

  applyTheme() {
    if (!els.thPrimary) return;

    const newTheme = {
      primary: els.thPrimary.value,
      bg: els.thBg.value,
      card: els.thCard.value,
      text: els.thText.value,
      border: els.thBorder.value,
      chip: els.thChip.value
    };

    setTheme(newTheme);
    this.showToast('Tema aplicado com sucesso!', 'success');
  }

  // ================================
  // CONSULTORES
  // ================================

  clearConsultants() {
    if (els.consultantsList) {
      els.consultantsList.innerHTML = '';
    }
  }

  addConsultantRow(data = { name: '', phone: '' }) {
    if (!els.tplConsultant || !els.consultantsList) return;

    const node = els.tplConsultant.content.cloneNode(true);
    const wrap = node.querySelector('.consultant-item');
    node.querySelector('.c-name').value = data.name || '';
    node.querySelector('.c-phone').value = data.phone || '';
    
    node.querySelector('.c-remove').addEventListener('click', () => {
      wrap.remove();
      this.showToast('Consultor removido', 'info');
    });

    els.consultantsList.appendChild(node);
  }

  // ================================
  // UPLOAD DE IMAGENS
  // ================================

  handleImageUpload(files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result;
        if (els.images) {
          els.images.value += (els.images.value.trim() ? '\n' : '') + url;
        }
        this.addImagePreview(url, file.name);
      };
      reader.readAsDataURL(file);
    });
  }

  addImagePreview(url, name) {
    if (!els.imagesPreview) return;

    const container = document.createElement('div');
    container.className = 'preview-image';
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = name;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'preview-image__remove';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', () => {
      if (els.images) {
        const lines = els.images.value.split('\n');
        els.images.value = lines.filter(line => line.trim() !== url).join('\n');
      }
      container.remove();
      this.showToast('Imagem removida', 'info');
    });
    
    container.appendChild(img);
    container.appendChild(removeBtn);
    els.imagesPreview.appendChild(container);
  }

  // ================================
  // FORMULÁRIO
  // ================================

  readForm() {
    const images = els.images.value.split('\n').map(s => s.trim()).filter(Boolean);
    const consultants = all('.consultant-item', els.consultantsList).map(item => ({
      name: item.querySelector('.c-name').value.trim(),
      phone: item.querySelector('.c-phone').value.trim(),
    })).filter(c => c.name || c.phone);
    const features = els.feats.filter(i => i.checked).map(i => i.value);
    
    return {
      id: els.id.value || null,
      brand: els.brand.value.trim(),
      model: els.model.value.trim(),
      year: Number(els.year.value) || new Date().getFullYear(),
      price: Number(els.price.value) || 0,
      km: Number(els.km.value) || 0,
      color: els.color.value.trim(),
      transmission: els.transmission.value,
      fuel: els.fuel.value,
      description: els.description.value.trim(),
      images,
      features,
      consultants,
      published: els.published.checked
    };
  }

  writeForm(car = {}) {
    this.resetForm(); // Começa limpando tudo
    if (!car || Object.keys(car).length === 0) {
        this.addConsultantRow(); // Adiciona uma linha de consultor para formulários novos
        return;
    }

    els.id.value = car.id || '';
    els.brand.value = car.brand || '';
    els.model.value = car.model || '';
    els.year.value = car.year || '';
    els.price.value = car.price || '';
    els.km.value = car.km || '';
    els.color.value = car.color || '';
    els.transmission.value = car.transmission || '';
    els.fuel.value = car.fuel || '';
    els.description.value = car.description || '';
    els.images.value = (car.images || []).join('\n');
    els.published.checked = car.published ?? true;

    els.feats.forEach(feat => {
      feat.checked = (car.features || []).includes(feat.value);
    });

    // Adiciona consultores se existirem, senão adiciona uma linha em branco
    if (car.consultants && car.consultants.length > 0) {
        car.consultants.forEach(c => this.addConsultantRow(c));
    } else {
        this.addConsultantRow();
    }

    (car.images || []).forEach((url, index) => {
      this.addImagePreview(url, `Imagem ${index + 1}`);
    });
  }

  resetForm() {
    if (els.form) els.form.reset();
    if (els.imagesPreview) els.imagesPreview.innerHTML = '';
    this.clearConsultants();
    // Não mostre toast ao resetar, pois é chamado internamente
  }

  submitForm(e) {
    e.preventDefault();
    const data = this.readForm();
    
    if (!data.brand || !data.model || !data.year || !data.price) {
      this.showToast('Preencha os campos obrigatórios (*)', 'error');
      return;
    }

    try {
      upsertCar(data);
      this.cars = getAllCars();
      this.renderTable();
      this.updateStats();
      this.closeModal();
      
      const message = data.id ? 'Veículo atualizado!' : 'Veículo adicionado!';
      this.showToast(message, 'success');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      this.showToast('Erro ao salvar veículo', 'error');
    }
  }

  // ================================
  // TABELA
  // ================================

  renderTable() {
    if (!els.table) return;

    const carsToRender = this.getFilteredCars();
    els.table.innerHTML = '';
    els.emptyTableState.hidden = carsToRender.length > 0;

    carsToRender.forEach(car => {
      const row = els.table.insertRow();
      row.innerHTML = `
        <td>
          <span class="status-badge status-badge--${car.published ? 'published' : 'draft'}">
            <span class="status-badge__icon">${car.published ? '✓' : '📝'}</span>
            ${car.published ? 'Publicado' : 'Rascunho'}
          </span>
        </td>
        <td>
          <strong>${car.brand} ${car.model}</strong>  
          <small>${car.color}</small>
        </td>
        <td>${car.year}</td>
        <td>${car.km ? `${car.km.toLocaleString('pt-BR')} km` : '0 km'}</td>
        <td><strong>${moneyBRL(car.price)}</strong></td>
        <td class="table-actions-cell">
          <button class="btn btn--secondary btn--sm js-edit" data-id="${car.id}"><span class="btn__icon">✏️</span> Editar</button>
          <button class="btn btn--${car.published ? 'ghost' : 'primary'} btn--sm js-toggle" data-id="${car.id}"><span class="btn__icon">${car.published ? '👁️' : '📢'}</span> ${car.published ? 'Ocultar' : 'Publicar'}</button>
          <button class="btn btn--danger btn--sm js-delete" data-id="${car.id}"><span class="btn__icon">🗑️</span> Excluir</button>
        </td>
      `;
    });
  }

  getFilteredCars() {
    const query = els.search.value.toLowerCase();
    if (!query) return this.cars;
    return this.cars.filter(car => 
      `${car.brand} ${car.model} ${car.color}`.toLowerCase().includes(query)
    );
  }

  handleTableClick(e) {
    const target = e.target.closest('button');
    if (!target) return;

    const id = target.dataset.id;
    if (target.classList.contains('js-edit')) this.editCar(id);
    if (target.classList.contains('js-toggle')) this.toggleCarPublished(id);
    if (target.classList.contains('js-delete')) this.deleteCar(id);
  }

  editCar(id) {
    const car = this.cars.find(c => c.id === id);
    if (car) {
      this.openModal(car);
      this.showToast('Carregando dados para edição...', 'info');
    }
  }

  toggleCarPublished(id) {
    try {
      togglePublished(id);
      this.cars = getAllCars();
      this.renderTable();
      this.updateStats();
      this.showToast('Status atualizado!', 'success');
    } catch (error) {
      this.showToast('Erro ao alterar status', 'error');
    }
  }

  deleteCar(id) {
    const car = this.cars.find(c => c.id === id);
    if (car && confirm(`Tem certeza que deseja excluir o ${car.brand} ${car.model}?`)) {
      try {
        deleteCar(id);
        this.cars = getAllCars();
        this.renderTable();
        this.updateStats();
        this.showToast('Veículo excluído!', 'success');
      } catch (error) {
        this.showToast('Erro ao excluir veículo', 'error');
      }
    }
  }

  // ================================
  // IMPORT/EXPORT
  // ================================

  exportData() {
    try {
      exportJson();
      this.showToast('Dados exportados!', 'success');
    } catch (error) {
      this.showToast('Erro ao exportar dados', 'error');
    }
  }

  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        JSON.parse(e.target.result); // Apenas valida o JSON
        localStorage.setItem('autocat_cars_v1', e.target.result);
        this.cars = getAllCars();
        this.renderTable();
        this.updateStats();
        this.showToast('Dados importados com sucesso!', 'success');
      } catch (error) {
        this.showToast('Arquivo JSON inválido!', 'error');
      }
    };
    reader.readAsText(file);
  }

  // ================================
  // EVENTOS
  // ================================

  bindEvents() {
    // Modal
    els.addCarBtn?.addEventListener('click', () => this.openModal());
    els.closeCarModal?.addEventListener('click', () => this.closeModal());
    els.carModal?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !els.carModal.hidden) this.closeModal();
    });

    // Formulário
    els.form?.addEventListener('submit', (e) => this.submitForm(e));
    els.resetForm?.addEventListener('click', () => {
        this.resetForm();
        this.addConsultantRow(); // Adiciona uma linha de consultor em branco
        this.showToast('Formulário limpo', 'info');
    });

    // Consultores
    els.addConsultant?.addEventListener('click', () => {
      this.addConsultantRow();
      this.showToast('Novo campo de consultor adicionado', 'info');
    });

    // Upload de imagens
    els.imagesFiles?.addEventListener('change', (e) => {
      if (e.target.files.length) {
        this.handleImageUpload(e.target.files);
        e.target.value = '';
      }
    });

    // Tabela
    els.search?.addEventListener('input', () => this.renderTable());
    els.table?.addEventListener('click', (e) => this.handleTableClick(e));

    // Import/Export
    els.exportJson?.addEventListener('click', () => this.exportData());
    els.importJson?.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        this.importData(e.target.files[0]);
        e.target.value = '';
      }
    });

    // Tema
    els.applyThemeBtn?.addEventListener('click', () => this.applyTheme());
    els.resetThemeBtn?.addEventListener('click', () => {
      if (confirm('Restaurar o tema padrão?')) {
        resetTheme();
        this.showToast('Tema restaurado!', 'success');
      }
    });

    // Logo
    els.logoInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result);
        if (els.logoPreview) {
          els.logoPreview.src = reader.result;
          els.logoPreview.style.display = 'block';
          els.logoPreview.parentElement.querySelector('.logo-preview__placeholder').style.display = 'none';
        }
        applyBrandLogo();
        this.showToast('Logo atualizada!', 'success');
      };
      reader.readAsDataURL(file);
    });

    // Brand name
    els.brandText?.addEventListener('input', (e) => {
      setBrand(e.target.value);
      applyBrandName();
    });
  }

  // ================================
  // TOAST NOTIFICATIONS
  // ================================

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    
    Object.assign(toast.style, {
      position: 'fixed', top: '20px', right: '20px',
      background: `var(--accent-${type === 'info' ? 'primary' : type})`,
      color: 'white', padding: '12px 20px', borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)', zIndex: '1001', transform: 'translateX(120%)',
      transition: 'transform 0.3s ease-out', maxWidth: '300px',
      fontSize: '0.9rem', fontWeight: '500'
    });
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
  }
}

// ================================
// INICIALIZAÇÃO
// ================================
document.addEventListener('DOMContentLoaded', () => {
  const adminManager = new AdminManager();
  adminManager.init();
  window.adminManager = adminManager; // Opcional: expor globalmente para depuração
});
