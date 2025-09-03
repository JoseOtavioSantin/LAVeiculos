import { getCar } from './db.js';
import { applyBrandLogo, applyBrandName } from './theme.js';
import { moneyBRL } from './utils.js';

// Utilitários
function by(sel) { return document.querySelector(sel); }
function all(sel, parent = document) { return Array.from(parent.querySelectorAll(sel)); }

// Aplicar tema e branding
applyBrandLogo();
applyBrandName();

// Elementos DOM
const els = {
  // Estados
  loading: by('#loading'),
  detail: by('#detail'),
  notFound: by('#notFound'),
  
  // Breadcrumb
  breadcrumbTitle: by('#breadcrumbTitle'),
  
  // Hero Section
  title: by('#title'),
  price: by('#price'),
  yearSummary: by('#yearSummary'),
  kmSummary: by('#kmSummary'),
  fuelSummary: by('#fuelSummary'),
  colorSummary: by('#colorSummary'),
  favoriteBtn: by('#favoriteBtn'),
  newBadge: by('#newBadge'),
  
  // Gallery
  photoMain: by('#photoMain'),
  thumbs: by('#thumbs'),
  imageCounter: by('#imageCounter'),
  prevImage: by('#prevImage'),
  nextImage: by('#nextImage'),
  
  // Especificações
  brand: by('#brand'),
  model: by('#model'),
  year: by('#year'),
  km: by('#km'),
  transmission: by('#transmission'),
  fuel: by('#fuel'),
  color: by('#color'),
  
  // Descrição e Features
  description: by('#description'),
  features: by('#features'),
  
  // Contato
  contacts: by('#contacts'),
  whatsappBtn: by('#whatsappBtn'),
  shareBtn: by('#shareBtn'),
  
  // Ações flutuantes
  floatingWhatsapp: by('#floatingWhatsapp'),
  floatingShare: by('#floatingShare'),
  floatingBack: by('#floatingBack'),
  
  // Modal de compartilhamento
  shareModal: by('#shareModal'),
  closeShareModal: by('#closeShareModal'),
  shareWhatsapp: by('#shareWhatsapp'),
  shareFacebook: by('#shareFacebook'),
  shareTwitter: by('#shareTwitter'),
  copyLink: by('#copyLink'),
  shareUrl: by('#shareUrl'),
  copyUrlBtn: by('#copyUrlBtn')
};

// ================================
// CLASSE PRINCIPAL DOS DETALHES
// ================================

class CarDetails {
  constructor() {
    this.car = null;
    this.currentImageIndex = 0;
    this.images = [];
    this.isFavorite = false;
    this.init();
  }

  init() {
    this.loadCarData();
    this.bindEvents();
  }

  // ================================
  // CARREGAMENTO DE DADOS
  // ================================

  loadCarData() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');
    
    if (!carId) {
      this.showNotFound();
      return;
    }

    // Mostrar loading
    this.showLoading();
    
    // Simular delay de carregamento para melhor UX
    setTimeout(() => {
      this.car = getCar(carId);
      
      if (!this.car || !this.car.published) {
        this.showNotFound();
        return;
      }
      
      this.renderCarDetails();
      this.hideLoading();
    }, 800);
  }

  showLoading() {
    if (els.loading) els.loading.hidden = false;
    if (els.detail) els.detail.hidden = true;
    if (els.notFound) els.notFound.hidden = true;
  }

  hideLoading() {
    if (els.loading) els.loading.hidden = true;
    if (els.detail) els.detail.hidden = false;
  }

  showNotFound() {
    if (els.loading) els.loading.hidden = true;
    if (els.detail) els.detail.hidden = true;
    if (els.notFound) els.notFound.hidden = false;
  }

  // ================================
  // RENDERIZAÇÃO
  // ================================

  renderCarDetails() {
    if (!this.car) return;

    // Breadcrumb
    if (els.breadcrumbTitle) {
      els.breadcrumbTitle.textContent = `${this.car.brand} ${this.car.model}`;
    }

    // Hero Section
    if (els.title) {
      els.title.textContent = `${this.car.brand} ${this.car.model}`;
    }
    
    if (els.price) {
      els.price.textContent = moneyBRL(this.car.price);
    }

    // Summary items
    if (els.yearSummary) els.yearSummary.textContent = this.car.year;
    if (els.kmSummary) els.kmSummary.textContent = `${this.car.km?.toLocaleString('pt-BR') || '0'} km`;
    if (els.fuelSummary) els.fuelSummary.textContent = this.car.fuel;
    if (els.colorSummary) els.colorSummary.textContent = this.car.color;

    // Badge de novo (se o carro for do ano atual)
    const currentYear = new Date().getFullYear();
    if (els.newBadge) {
      els.newBadge.hidden = this.car.year < currentYear;
    }

    // Gallery
    this.setupGallery();

    // Especificações
    if (els.brand) els.brand.textContent = this.car.brand;
    if (els.model) els.model.textContent = this.car.model;
    if (els.year) els.year.textContent = this.car.year;
    if (els.km) els.km.textContent = `${this.car.km?.toLocaleString('pt-BR') || '0'} km`;
    if (els.transmission) els.transmission.textContent = this.car.transmission;
    if (els.fuel) els.fuel.textContent = this.car.fuel;
    if (els.color) els.color.textContent = this.car.color;

    // Descrição
    if (els.description) {
      els.description.textContent = this.car.description || 'Sem descrição disponível.';
    }

    // Features
    this.renderFeatures();

    // Contatos
    this.renderContacts();

    // Configurar URL de compartilhamento
    this.setupShareUrl();

    // Verificar favorito
    this.checkFavoriteStatus();
  }

  setupGallery() {
    this.images = this.car.images || [];
    
    if (this.images.length === 0) {
      // Usar imagem placeholder
      this.images = ['assets/img/placeholder.jpg'];
    }

    // Imagem principal
    if (els.photoMain) {
      els.photoMain.src = this.images[0];
      els.photoMain.alt = `${this.car.brand} ${this.car.model}`;
    }

    // Contador de imagens
    this.updateImageCounter();

    // Thumbnails
    this.renderThumbnails();

    // Controles de navegação
    this.updateGalleryControls();
  }

  renderThumbnails() {
    if (!els.thumbs || this.images.length <= 1) return;

    els.thumbs.innerHTML = '';
    
    this.images.forEach((src, index) => {
      const thumb = document.createElement('div');
      thumb.className = `gallery__thumb ${index === this.currentImageIndex ? 'active' : ''}`;
      
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Foto ${index + 1}`;
      img.addEventListener('click', () => this.changeImage(index));
      
      thumb.appendChild(img);
      els.thumbs.appendChild(thumb);
    });
  }

  changeImage(index) {
    if (index < 0 || index >= this.images.length) return;
    
    this.currentImageIndex = index;
    
    if (els.photoMain) {
      els.photoMain.src = this.images[index];
    }
    
    this.updateImageCounter();
    this.updateThumbnailsActive();
  }

  updateImageCounter() {
    if (els.imageCounter) {
      els.imageCounter.textContent = `${this.currentImageIndex + 1} / ${this.images.length}`;
    }
  }

  updateThumbnailsActive() {
    const thumbs = all('.gallery__thumb', els.thumbs);
    thumbs.forEach((thumb, index) => {
      thumb.classList.toggle('active', index === this.currentImageIndex);
    });
  }

  updateGalleryControls() {
    if (els.prevImage) {
      els.prevImage.style.display = this.images.length > 1 ? 'flex' : 'none';
    }
    if (els.nextImage) {
      els.nextImage.style.display = this.images.length > 1 ? 'flex' : 'none';
    }
  }

  nextImage() {
    const nextIndex = (this.currentImageIndex + 1) % this.images.length;
    this.changeImage(nextIndex);
  }

  prevImage() {
    const prevIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
    this.changeImage(prevIndex);
  }

  renderFeatures() {
    if (!els.features) return;

    const features = this.car.features || [];
    
    if (features.length === 0) {
      els.features.innerHTML = '<li>Nenhum opcional informado</li>';
      return;
    }

    els.features.innerHTML = '';
    features.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      els.features.appendChild(li);
    });
  }

  renderContacts() {
    if (!els.contacts) return;

    const consultants = this.car.consultants || [];
    
    if (consultants.length === 0) {
      els.contacts.innerHTML = `
        <div class="contact-item">
          <div class="contact-item__avatar">?</div>
          <div class="contact-item__info">
            <div class="contact-item__name">Consultor não informado</div>
            <div class="contact-item__phone">Entre em contato conosco</div>
          </div>
        </div>
      `;
      return;
    }

    els.contacts.innerHTML = '';
    consultants.forEach(consultant => {
      if (!consultant.name && !consultant.phone) return;
      
      const item = document.createElement('div');
      item.className = 'contact-item';
      
      const avatar = consultant.name ? consultant.name.charAt(0).toUpperCase() : '?';
      
      item.innerHTML = `
        <div class="contact-item__avatar">${avatar}</div>
        <div class="contact-item__info">
          <div class="contact-item__name">${consultant.name || 'Consultor'}</div>
          <div class="contact-item__phone">${consultant.phone || 'Telefone não informado'}</div>
        </div>
        ${consultant.phone ? `
          <button class="contact-item__action" onclick="window.carDetails.openWhatsApp('${consultant.phone}')">
            Chamar
          </button>
        ` : ''}
      `;
      
      els.contacts.appendChild(item);
    });
  }

  // ================================
  // FUNCIONALIDADES
  // ================================

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    
    if (els.favoriteBtn) {
      const icon = els.favoriteBtn.querySelector('.favorite-btn__icon');
      if (icon) {
        icon.textContent = this.isFavorite ? '❤️' : '🤍';
      }
    }
    
    // Salvar no localStorage
    const favorites = JSON.parse(localStorage.getItem('autocat_favorites') || '[]');
    
    if (this.isFavorite) {
      if (!favorites.includes(this.car.id)) {
        favorites.push(this.car.id);
      }
    } else {
      const index = favorites.indexOf(this.car.id);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }
    
    localStorage.setItem('autocat_favorites', JSON.stringify(favorites));
    
    this.showToast(
      this.isFavorite ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!',
      this.isFavorite ? 'success' : 'info'
    );
  }

  checkFavoriteStatus() {
    const favorites = JSON.parse(localStorage.getItem('autocat_favorites') || '[]');
    this.isFavorite = favorites.includes(this.car.id);
    
    if (els.favoriteBtn) {
      const icon = els.favoriteBtn.querySelector('.favorite-btn__icon');
      if (icon) {
        icon.textContent = this.isFavorite ? '❤️' : '🤍';
      }
    }
  }

  openWhatsApp(phone = null) {
    const consultants = this.car.consultants || [];
    const targetPhone = phone || (consultants[0]?.phone);
    
    if (!targetPhone) {
      this.showToast('Número de WhatsApp não disponível', 'error');
      return;
    }
    
    const message = encodeURIComponent(
      `Olá! Tenho interesse no ${this.car.brand} ${this.car.model} ${this.car.year}. Poderia me dar mais informações?`
    );
    
    const whatsappUrl = `https://wa.me/${targetPhone.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  // ================================
  // COMPARTILHAMENTO
  // ================================

  setupShareUrl() {
    const currentUrl = window.location.href;
    if (els.shareUrl) {
      els.shareUrl.value = currentUrl;
    }
  }

  openShareModal() {
    if (els.shareModal) {
      els.shareModal.hidden = false;
      document.body.style.overflow = 'hidden';
    }
  }

  closeShareModal() {
    if (els.shareModal) {
      els.shareModal.hidden = true;
      document.body.style.overflow = '';
    }
  }

  shareOnWhatsApp() {
    const url = window.location.href;
    const text = encodeURIComponent(
      `Confira este ${this.car.brand} ${this.car.model} ${this.car.year} por ${moneyBRL(this.car.price)}!`
    );
    
    const whatsappUrl = `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`;
    window.open(whatsappUrl, '_blank');
    this.closeShareModal();
  }

  shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    this.closeShareModal();
  }

  shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `Confira este ${this.car.brand} ${this.car.model} ${this.car.year} por ${moneyBRL(this.car.price)}!`
    );
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    this.closeShareModal();
  }

  copyLinkToClipboard() {
    const url = window.location.href;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('Link copiado para a área de transferência!', 'success');
        this.closeShareModal();
      }).catch(() => {
        this.fallbackCopyToClipboard(url);
      });
    } else {
      this.fallbackCopyToClipboard(url);
    }
  }

  fallbackCopyToClipboard(text) {
    if (els.shareUrl) {
      els.shareUrl.select();
      els.shareUrl.setSelectionRange(0, 99999);
      
      try {
        document.execCommand('copy');
        this.showToast('Link copiado para a área de transferência!', 'success');
        this.closeShareModal();
      } catch (err) {
        this.showToast('Erro ao copiar link', 'error');
      }
    }
  }

  // ================================
  // EVENTOS
  // ================================

  bindEvents() {
    // Favorito
    els.favoriteBtn?.addEventListener('click', () => this.toggleFavorite());

    // Gallery
    els.prevImage?.addEventListener('click', () => this.prevImage());
    els.nextImage?.addEventListener('click', () => this.nextImage());

    // Navegação por teclado na gallery
    document.addEventListener('keydown', (e) => {
      if (els.detail?.hidden) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextImage();
      } else if (e.key === 'Escape') {
        this.closeShareModal();
      }
    });

    // Botões de contato
    els.whatsappBtn?.addEventListener('click', () => this.openWhatsApp());
    els.shareBtn?.addEventListener('click', () => this.openShareModal());

    // Ações flutuantes
    els.floatingWhatsapp?.addEventListener('click', () => this.openWhatsApp());
    els.floatingShare?.addEventListener('click', () => this.openShareModal());
    els.floatingBack?.addEventListener('click', () => window.history.back());

    // Modal de compartilhamento
    els.closeShareModal?.addEventListener('click', () => this.closeShareModal());
    els.shareModal?.addEventListener('click', (e) => {
      if (e.target === els.shareModal) {
        this.closeShareModal();
      }
    });

    // Opções de compartilhamento
    els.shareWhatsapp?.addEventListener('click', () => this.shareOnWhatsApp());
    els.shareFacebook?.addEventListener('click', () => this.shareOnFacebook());
    els.shareTwitter?.addEventListener('click', () => this.shareOnTwitter());
    els.copyLink?.addEventListener('click', () => this.copyLinkToClipboard());
    els.copyUrlBtn?.addEventListener('click', () => this.copyLinkToClipboard());
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

document.addEventListener('DOMContentLoaded', () => {
  window.carDetails = new CarDetails();
});

// Fallback para compatibilidade
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.carDetails) {
      window.carDetails = new CarDetails();
    }
  });
} else {
  window.carDetails = new CarDetails();
}

