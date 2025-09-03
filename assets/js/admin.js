import { seedIfEmpty, getAllCars, upsertCar, deleteCar, togglePublished, exportJson } from './db.js';
import { setTheme, getTheme, resetTheme, setLogo, getLogo, applyBrandLogo, setBrand, getBrand, applyBrandName } from './theme.js';
import { moneyBRL } from './utils.js';

// Utilitários
function by(sel) { return document.querySelector(sel); }
function all(sel, parent = document) { return Array.from(parent.querySelectorAll(sel)); }

// Inicialização
seedIfEmpty();
applyBrandLogo();
applyBrandName();

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
    this.filteredCars = [];
    this.editingCarId = null;
    this.init();
  }

  init() {
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
      
      // Focar no primeiro campo
      setTimeout(() => {
        els.brand?.focus();
      }, 100);
    }
  }

  closeModal() {
    if (els.carModal) {
      els.carModal.hidden = true;
      document.body.style.overflow = '';
      this.editingCarId = null;
    }
  }

  // ================================
  // ESTATÍSTICAS
  // ================================

  updateStats() {
    const published = this.cars.filter(c => c.published);
    const drafts = this.cars.filter(c => !c.published);
    const brands = [...new Set(this.cars.map(c => c.brand))];

    if (els.totalCarsAdmin) {
      this.animateNumber(els.totalCarsAdmin, 0, this.cars.length, 1500);
    }
    
    if (els.publishedCars) {
      this.animateNumber(els.publishedCars, 0, published.length, 1200);
    }
    
    if (els.draftCars) {
      this.animateNumber(els.draftCars, 0, drafts.length, 1000);
    }
    
    if (els.totalBrandsAdmin) {
      this.animateNumber(els.totalBrandsAdmin, 0, brands.length, 800);
    }
  }

  animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
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

    // Definir valores iniciais
    if (els.thPrimary) els.thPrimary.value = current.primary.startsWith('#') ? current.primary : '#667eea';
    if (els.thBg) els.thBg.value = current.bg.startsWith('#') ? current.bg : '#f8fafc';
    if (els.thCard) els.thCard.value = current.card.startsWith('#') ? current.card : '#ffffff';
    if (els.thText) els.thText.value = current.text.startsWith('#') ? current.text : '#1a202c';
    if (els.thBorder) els.thBorder.value = current.border.startsWith('#') ? current.border : '#e2e8f0';
    if (els.thChip) els.thChip.value = current.chip.startsWith('#') ? current.chip : '#f7fafc';

    // Logo
    const logo = getLogo();
    if (logo && els.logoPreview) {
      els.logoPreview.src = logo;
      els.logoPreview.style.display = 'block';
      const placeholder = els.logoPreview.parentElement.querySelector('.logo-preview__placeholder');
      if (placeholder) placeholder.style.display = 'none';
    }

    // Brand name
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
    const inName = node.querySelector('.c-name');
    const inPhone = node.querySelector('.c-phone');
    const removeBtn = node.querySelector('.c-remove');

    if (inName) inName.value = data.name || '';
    if (inPhone) inPhone.value = data.phone || '';
    
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        wrap.remove();
        this.showToast('Consultor removido', 'info');
      });
    }

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
        
        // Adicionar à textarea
        if (els.images) {
          els.images.value += (els.images.value.trim() ? '\n' : '') + url;
        }
        
        // Adicionar ao preview
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
      // Remover da textarea
      if (els.images) {
        const lines = els.images.value.split('\n');
        const filteredLines = lines.filter(line => line.trim() !== url);
        els.images.value = filteredLines.join('\n');
      }
      
      // Remover do preview
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
    const images = els.images ? els.images.value.split('\n').map(s => s.trim()).filter(Boolean) : [];
    
    const consultants = all('.consultant-item', els.consultantsList).map(item => {
      const name = item.querySelector('.c-name')?.value.trim() || '';
      const phone = item.querySelector('.c-phone')?.value.trim() || '';
      return (name || phone) ? { name, phone } : null;
    }).filter(Boolean);
    
    const features = els.feats.filter(i => i.checked).map(i => i.value);
    
    return {
      id: els.id?.value || null,
      brand: els.brand?.value.trim() || '',
      model: els.model?.value.trim() || '',
      year: Number(els.year?.value) || new Date().getFullYear(),
      price: Number(els.price?.value) || 0,
      km: Number(els.km?.value) || 0,
      color: els.color?.value.trim() || '',
      transmission: els.transmission?.value || '',
      fuel: els.fuel?.value || '',
      description: els.description?.value.trim() || '',
      images,
      features,
      consultants,
      published: els.published?.checked ?? true
    };
  }

  writeForm(car = {}) {
    if (els.id) els.id.value = car.id || '';
    if (els.brand) els.brand.value = car.brand || '';
    if (els.model) els.model.value = car.model || '';
    if (els.year) els.year.value = car.year || '';
    if (els.price) els.price.value = car.price || '';
    if (els.km) els.km.value = car.km || '';
    if (els.color) els.color.value = car.color || '';
    if (els.transmission) els.transmission.value = car.transmission || '';
    if (els.fuel) els.fuel.value = car.fuel || '';
    if (els.description) els.description.value = car.description || '';
    if (els.images) els.images.value = (car.images || []).join('\n');
    if (els.published) els.published.checked = car.published ?? true;

    // Features
    els.feats.forEach(feat => {
      feat.checked = (car.features || []).includes(feat.value);
    });

    // Consultores
    this.clearConsultants();
    const consultants = car.consultants || [{ name: '', phone: '' }];
    consultants.forEach(c => this.addConsultantRow(c));

    // Preview de imagens
    if (els.imagesPreview) {
      els.imagesPreview.innerHTML = '';
      (car.images || []).forEach((url, index) => {
        this.addImagePreview(url, `Imagem ${index + 1}`);
      });
    }
  }

  resetForm() {
    this.writeForm();
    this.showToast('Formulário limpo', 'info');
  }

  submitForm(e) {
    e.preventDefault();
    
    const data = this.readForm();
    
    // Validação básica
    if (!data.brand || !data.model || !data.year || !data.price) {
      this.showToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    try {
      upsertCar(data);
      this.cars = getAllCars();
      this.renderTable();
      this.updateStats();
      this.closeModal();
      
      const message = data.id ? 'Veículo atualizado com sucesso!' : 'Veículo adicionado com sucesso!';
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

    const cars = this.getFilteredCars();
    els.table.innerHTML = '';

    // Mostrar/esconder estado vazio
    if (els.emptyTableState) {
      els.emptyTableState.hidden = cars.length > 0;
    }

    cars.forEach(car => {
      const row = document.createElement('tr');
      
      // Status
      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `status-badge status-badge--${car.published ? 'published' : 'draft'}`;
      statusBadge.innerHTML = `
        <span class="status-badge__icon">${car.published ? '✓' : '📝'}</span>
        ${car.published ? 'Publicado' : 'Rascunho'}
      `;
      statusCell.appendChild(statusBadge);
      
      // Veículo
      const vehicleCell = document.createElement('td');
      vehicleCell.innerHTML = `<strong>${car.brand} ${car.model}</strong>  
<small>${car.color}</small>`;
      
      // Ano
      const yearCell = document.createElement('td');
      yearCell.textContent = car.year;
      
      // KM
      const kmCell = document.createElement('td');
      kmCell.textContent = car.km ? `${car.km.toLocaleString('pt-BR')} km` : '0 km';
      
      // Preço
      const priceCell = document.createElement('td');
      priceCell.innerHTML = `<strong>${moneyBRL(car.price)}</strong>`;
      
      // Ações
      const actionsCell = document.createElement('td');
      actionsCell.className = 'table-actions-cell';
      
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn--secondary btn--sm';
      editBtn.innerHTML = '<span class="btn__icon">✏️</span> Editar';
      editBtn.addEventListener('click', () => this.editCar(car.id));
      
      const toggleBtn = document.createElement('button');
      toggleBtn.className = `btn btn--${car.published ? 'ghost' : 'primary'} btn--sm`;
      toggleBtn.innerHTML = `<span class="btn__icon">${car.published ? '👁️' : '📢'}</span> ${car.published ? 'Ocultar' : 'Publicar'}`;
      toggleBtn.addEventListener('click', () => this.toggleCarPublished(car.id));
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn--danger btn--sm';
      deleteBtn.innerHTML = '<span class="btn__icon">🗑️</span> Excluir';
      deleteBtn.addEventListener('click', () => this.deleteCar(car.id));
      
      actionsCell.appendChild(editBtn);
      actionsCell.appendChild(toggleBtn);
      actionsCell.appendChild(deleteBtn);
      
      row.appendChild(statusCell);
      row.appendChild(vehicleCell);
      row.appendChild(yearCell);
      row.appendChild(kmCell);
      row.appendChild(priceCell);
      row.appendChild(actionsCell);
      
      els.table.appendChild(row);
    });
  }

  getFilteredCars() {
    const query = els.search?.value.toLowerCase() || '';
    
    if (!query) return this.cars;
    
    return this.cars.filter(car => 
      `${car.brand} ${car.model} ${car.color}`.toLowerCase().includes(query)
    );
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
      console.error('Erro ao alterar status:', error);
      this.showToast('Erro ao alterar status', 'error');
    }
  }

  deleteCar(id) {
    const car = this.cars.find(c => c.id === id);
    if (!car) return;

    if (confirm(`Tem certeza que deseja excluir o ${car.brand} ${car.model}?`)) {
      try {
        deleteCar(id);
        this.cars = getAllCars();
        this.renderTable();
        this.updateStats();
        this.showToast('Veículo excluído!', 'success');
      } catch (error) {
        console.error('Erro ao excluir:', error);
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
      console.error('Erro ao exportar:', error);
      this.showToast('Erro ao exportar dados', 'error');
    }
  }

  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        localStorage.setItem('autocat_cars_v1', JSON.stringify(data));
        this.cars = getAllCars();
        this.renderTable();
        this.updateStats();
        this.showToast('Dados importados com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao importar:', error);
        this.showToast('Erro ao importar dados', 'error');
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
    
    // Fechar modal clicando no backdrop
    els.carModal?.addEventListener('click', (e) => {
      if (e.target === els.carModal) {
        this.closeModal();
      }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !els.carModal?.hidden) {
        this.closeModal();
      }
    });

    // Formulário
    els.form?.addEventListener('submit', (e) => this.submitForm(e));
    els.resetForm?.addEventListener('click', () => this.resetForm());

    // Consultores
    els.addConsultant?.addEventListener('click', () => {
      this.addConsultantRow();
      this.showToast('Consultor adicionado', 'info');
    });

    // Upload de imagens
    els.imagesFiles?.addEventListener('change', (e) => {
      if (e.target.files?.length) {
        this.handleImageUpload(e.target.files);
        e.target.value = ''; // Reset input
      }
    });

    // Busca na tabela
    els.search?.addEventListener('input', () => this.renderTable());

    // Import/Export
    els.exportJson?.addEventListener('click', () => this.exportData());
    els.importJson?.addEventListener('change', (e) => {
      if (e.target.files?.[0]) {
        this.importData(e.target.files[0]);
        e.target.value = ''; // Reset input
      }
    });

    // Tema
    els.applyThemeBtn?.addEventListener('click', () => this.applyTheme());
    els.resetThemeBtn?.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja restaurar o tema padrão?')) {
        resetTheme();
        this.showToast('Tema restaurado!', 'success');
      }
    });

    // Logo
    els.logoInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result);
        if (els.logoPreview) {
          els.logoPreview.src = reader.result;
          els.logoPreview.style.display = 'block';
          const placeholder = els.logoPreview.parentElement.querySelector('.logo-preview__placeholder');
          if (placeholder) placeholder.style.display = 'none';
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
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'success' ? 'var(--accent-success)' : 
                  type === 'error' ? 'var(--accent-danger)' : 
                  'var(--accent-primary)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: '1001',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      maxWidth: '300px',
      fontSize: '0.9rem',
      fontWeight: '500'
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

// ================================
// INICIALIZAÇÃO
// ================================

// Como o script é carregado no final do body, o DOM já está pronto.
// Basta criar a instância diretamente e uma única vez.
window.adminManager = new AdminManager();
