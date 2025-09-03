import { seedIfEmpty, getAllCars } from './db.js';
import { applyBrandLogo, applyBrandName } from './theme.js';

// Utilitários
function by(sel) { return document.querySelector(sel); }
function moneyBRL(val) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val); }
function formatKm(km) { return km ? `${km.toLocaleString('pt-BR')} km` : '0 km'; }

// Inicialização
seedIfEmpty();
applyBrandLogo();
applyBrandName();

// Estado da aplicação
const state = { 
  q: '', 
  brand: '', 
  yearMin: '', 
  transmission: '', 
  fuel: '', 
  minPrice: '', 
  maxPrice: '', 
  sort: 'recent',
  favorites: JSON.parse(localStorage.getItem('autocat_favorites') || '[]')
};

// Elementos DOM
const els = { 
  grid: by('#grid'), 
  empty: by('#emptyState'), 
  q: by('#q'), 
  brand: by('#brandSelect'), 
  year: by('#yearSelect'), 
  transmission: by('#transmissionSelect'), 
  fuel: by('#fuelSelect'), 
  minPrice: by('#minPrice'), 
  maxPrice: by('#maxPrice'), 
  sort: by('#sortSelect'), 
  clear: by('#clearFilters'), 
  cardTpl: by('#cardTemplate'),
  resultsCount: by('#resultsCount'),
  totalCars: by('#totalCars'),
  totalBrands: by('#totalBrands')
};

// ================================
// FUNCIONALIDADES MODERNAS
// ================================

class CatalogManager {
  constructor() {
    this.cars = [];
    this.filteredCars = [];
    this.init();
  }

  init() {
    this.cars = getAllCars().filter(c => c.published);
    this.populateFilters();
    this.bindEvents();
    this.render();
    this.updateStats();
  }

  populateFilters() {
    // Marcas
    const brands = [...new Set(this.cars.map(c => c.brand))].sort();
    els.brand.innerHTML = '<option value="">Todas as marcas</option>' + 
      brands.map(b => `<option value="${b}">${b}</option>`).join('');
    
    // Anos
    const years = [...new Set(this.cars.map(c => c.year))].sort((a,b) => b-a);
    els.year.innerHTML = '<option value="">Qualquer ano</option>' + 
      years.map(y => `<option value="${y}">${y}</option>`).join('');
  }

  applyFilters() {
    let result = [...this.cars];
    
    // Busca textual
    if (state.q) {
      const query = state.q.toLowerCase();
      result = result.filter(car => 
        `${car.brand} ${car.model} ${car.color}`.toLowerCase().includes(query)
      );
    }
    
    // Filtros específicos
    if (state.brand) result = result.filter(c => c.brand === state.brand);
    if (state.yearMin) result = result.filter(c => c.year >= Number(state.yearMin));
    if (state.transmission) result = result.filter(c => c.transmission === state.transmission);
    if (state.fuel) result = result.filter(c => c.fuel === state.fuel);
    if (state.minPrice) result = result.filter(c => c.price >= Number(state.minPrice));
    if (state.maxPrice) result = result.filter(c => c.price <= Number(state.maxPrice));
    
    // Ordenação
    switch (state.sort) {
      case 'priceAsc': 
        result.sort((a,b) => a.price - b.price); 
        break;
      case 'priceDesc': 
        result.sort((a,b) => b.price - a.price); 
        break;
      case 'yearDesc': 
        result.sort((a,b) => b.year - a.year); 
        break;
      case 'kmAsc': 
        result.sort((a,b) => a.km - b.km); 
        break;
      default: 
        result.sort((a,b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }
    
    this.filteredCars = result;
    return result;
  }

  render() {
    const cars = this.applyFilters();
    
    // Limpar grid
    els.grid.innerHTML = '';
    
    // Atualizar contador
    if (els.resultsCount) {
      els.resultsCount.textContent = cars.length;
    }
    
    // Mostrar/esconder estado vazio
    els.empty.hidden = cars.length > 0;
    
    if (!cars.length) return;
    
    // Renderizar cards com animação escalonada
    cars.forEach((car, index) => {
      setTimeout(() => {
        this.renderCarCard(car);
      }, index * 50); // Animação escalonada
    });
  }

  renderCarCard(car) {
    const node = els.cardTpl.content.cloneNode(true);
    
    // Elementos do card
    const article = node.querySelector('.car');
    const link = node.querySelector('.car__image-link');
    const img = node.querySelector('.car__image');
    const badge = node.querySelector('.car__badge');
    const favoriteBtn = node.querySelector('.car__favorite');
    const favoriteIcon = node.querySelector('.car__favorite-icon');
    const contactBtn = node.querySelector('.btn--primary');
    const detailsBtn = node.querySelector('.btn--secondary');
    
    // Dados básicos
    const url = `details.html?id=${car.id}`;
    node.querySelector('.car__title').textContent = `${car.brand} ${car.model}`;
    node.querySelector('.car__price').textContent = moneyBRL(car.price);
    node.querySelector('.car__description').textContent = 
      `${car.color} • ${car.transmission} • ${car.fuel}`;
    
    // Especificações
    node.querySelector('.spec__value.year').textContent = car.year;
    node.querySelector('.spec__value.km').textContent = formatKm(car.km);
    node.querySelector('.spec__value.fuel').textContent = car.fuel;
    
    // Imagem
    img.src = (car.images?.[0]) || 'assets/img/placeholder.jpg';
    img.alt = `${car.brand} ${car.model}`;
    
    // Badge
    const isNew = (Date.now() - (car.createdAt || 0)) < (1000 * 60 * 60 * 24 * 30);
    badge.textContent = isNew ? 'NOVO' : 'DESTAQUE';
    badge.style.background = isNew ? 
      'linear-gradient(135deg, var(--accent-success), #38a169)' : 
      'linear-gradient(135deg, var(--accent-warning), #d69e2e)';
    
    // Favorito
    const isFavorite = state.favorites.includes(car.id);
    favoriteIcon.textContent = isFavorite ? '❤️' : '🤍';
    favoriteBtn.setAttribute('aria-label', isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    
    // Event listeners
    link.href = url;
    
    // Click no card (exceto botões)
    article.addEventListener('click', (e) => {
      if (!e.target.closest('button') && !e.target.closest('a')) {
        window.location.href = url;
      }
    });
    
    // Favorito
    favoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFavorite(car.id, favoriteIcon);
    });
    
    // Botões de ação
    contactBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.contactSeller(car);
    });
    
    detailsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = url;
    });
    
    // Adicionar ao grid
    els.grid.appendChild(node);
  }

  toggleFavorite(carId, iconElement) {
    const index = state.favorites.indexOf(carId);
    
    if (index > -1) {
      // Remover dos favoritos
      state.favorites.splice(index, 1);
      iconElement.textContent = '🤍';
      this.showToast('Removido dos favoritos', 'info');
    } else {
      // Adicionar aos favoritos
      state.favorites.push(carId);
      iconElement.textContent = '❤️';
      this.showToast('Adicionado aos favoritos', 'success');
    }
    
    // Salvar no localStorage
    localStorage.setItem('autocat_favorites', JSON.stringify(state.favorites));
    
    // Animação
    iconElement.style.transform = 'scale(1.3)';
    setTimeout(() => {
      iconElement.style.transform = 'scale(1)';
    }, 200);
  }

  contactSeller(car) {
    const message = `Olá! Tenho interesse no ${car.brand} ${car.model} ${car.year} por ${moneyBRL(car.price)}. Poderia me dar mais informações?`;
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    this.showToast('Redirecionando para WhatsApp...', 'info');
  }

  showToast(message, type = 'info') {
    // Criar toast
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    
    // Estilos do toast
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
      zIndex: '1000',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      maxWidth: '300px',
      fontSize: '0.9rem',
      fontWeight: '500'
    });
    
    document.body.appendChild(toast);
    
    // Animação de entrada
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  updateStats() {
    if (els.totalCars) {
      els.totalCars.textContent = this.cars.length;
    }
    
    if (els.totalBrands) {
      const brands = [...new Set(this.cars.map(c => c.brand))];
      els.totalBrands.textContent = brands.length;
    }
  }

  bindEvents() {
    // Filtros
    els.q?.addEventListener('input', (e) => {
      state.q = e.target.value;
      this.render();
    });
    
    els.brand?.addEventListener('change', (e) => {
      state.brand = e.target.value;
      this.render();
    });
    
    els.year?.addEventListener('change', (e) => {
      state.yearMin = e.target.value;
      this.render();
    });
    
    els.minPrice?.addEventListener('input', (e) => {
      state.minPrice = e.target.value;
      this.render();
    });
    
    els.maxPrice?.addEventListener('input', (e) => {
      state.maxPrice = e.target.value;
      this.render();
    });
    
    els.sort?.addEventListener('change', (e) => {
      state.sort = e.target.value;
      this.render();
    });
    
    // Limpar filtros
    els.clear?.addEventListener('click', () => {
      this.clearFilters();
    });
    
    // Busca em tempo real com debounce
    let searchTimeout;
    els.q?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.q = e.target.value;
        this.render();
      }, 300);
    });
  }

  clearFilters() {
    // Resetar estado
    Object.assign(state, { 
      q: '', 
      brand: '', 
      yearMin: '', 
      transmission: '', 
      fuel: '', 
      minPrice: '', 
      maxPrice: '', 
      sort: 'recent' 
    });
    
    // Resetar campos
    if (els.q) els.q.value = '';
    if (els.brand) els.brand.value = '';
    if (els.year) els.year.value = '';
    if (els.minPrice) els.minPrice.value = '';
    if (els.maxPrice) els.maxPrice.value = '';
    if (els.sort) els.sort.value = 'recent';
    
    // Re-renderizar
    this.render();
    
    // Feedback
    this.showToast('Filtros limpos', 'info');
  }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.catalogManager = new CatalogManager();
});

// Fallback para compatibilidade
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.catalogManager) {
      window.catalogManager = new CatalogManager();
    }
  });
} else {
  window.catalogManager = new CatalogManager();
}

