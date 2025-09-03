/**
 * Sistema de Temas Moderno
 * Controla a alternância entre tema claro e escuro + customizações
 */

const THEME_KEY = 'autocat_theme_v2';
const LOGO_KEY  = 'autocat_logo_v1';
const BRAND_KEY = 'autocat_brand_v1';
const DARK_MODE_KEY = 'autocat_dark_mode_v1';

// Funções originais mantidas para compatibilidade
export function getTheme(){ try{ return JSON.parse(localStorage.getItem(THEME_KEY) || '{}'); }catch{ return {}; } }
export function setTheme(vars){
  const current = getTheme();
  const merged = { ...current, ...vars };
  localStorage.setItem(THEME_KEY, JSON.stringify(merged));
  applyTheme(merged);
}
export function applyTheme(vars = getTheme()){
  const keys = ['primary','bg','card','text','border','chip'];
  keys.forEach(k => {
    if(vars[k]) document.documentElement.style.setProperty('--'+k, vars[k]);
  });
}
export function resetTheme(){
  localStorage.removeItem(THEME_KEY);
  localStorage.removeItem(LOGO_KEY);
  localStorage.removeItem(DARK_MODE_KEY);
  location.reload();
}

export function getLogo(){ return localStorage.getItem(LOGO_KEY) || ''; }
export function setLogo(dataUrl){
  if(dataUrl) localStorage.setItem(LOGO_KEY, dataUrl);
  else localStorage.removeItem(LOGO_KEY);
  applyBrandLogo();
}
export function applyBrandLogo(){
  const el = document.getElementById('brandLogo');
  if(!el) return;
  const src = getLogo();
  if(src){ el.src = src; el.hidden = false; } else { el.hidden = true; }
}

export function getBrand(){ return localStorage.getItem(BRAND_KEY) || 'AutoCat'; }
export function setBrand(name=''){
  const val = name?.trim() || 'AutoCat';
  localStorage.setItem(BRAND_KEY, val);
  applyBrandName();
}
export function applyBrandName(){
  const els = [document.getElementById('brandName'), document.getElementById('footerBrand')];
  const name = getBrand();
  els.forEach(el => {
    if(!el) return;
    if(el.id === 'footerBrand'){
      const suffix = el.textContent.split('•').slice(1).join('•');
      el.textContent = `${name} • ${suffix || 'Catálogo de Carros • 2025'}`.trim();
    }else{
      el.textContent = name;
    }
  });
}

// ================================
// NOVO SISTEMA DE TEMA CLARO/ESCURO
// ================================

class ThemeManager {
  constructor() {
    this.currentMode = this.getStoredMode() || this.getSystemMode();
    this.themeToggle = null;
    this.themeIcon = null;
    
    this.init();
  }

  init() {
    // Aplicar modo inicial
    this.applyMode(this.currentMode);
    
    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Encontrar elementos
    this.themeToggle = document.getElementById('themeToggle');
    this.themeIcon = this.themeToggle?.querySelector('.theme-toggle__icon');
    
    if (!this.themeToggle) {
      console.warn('Theme toggle button not found');
      return;
    }

    // Event listener para o botão
    this.themeToggle.addEventListener('click', () => this.toggleMode());
    
    // Event listener para mudanças do sistema
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!this.getStoredMode()) {
          this.setMode(e.matches ? 'dark' : 'light');
        }
      });

    // Atualizar ícone inicial
    this.updateThemeIcon();
    
    // Adicionar animação de entrada
    this.addEntranceAnimation();

    // Atualizar contadores
    this.updateStats();
  }

  getSystemMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  getStoredMode() {
    return localStorage.getItem(DARK_MODE_KEY);
  }

  setStoredMode(mode) {
    localStorage.setItem(DARK_MODE_KEY, mode);
  }

  applyMode(mode) {
    // Remover modo anterior
    document.documentElement.removeAttribute('data-theme');
    
    // Aplicar novo modo
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    this.currentMode = mode;
    
    // Adicionar classe para animação
    document.body.classList.add('theme-transitioning');
    
    // Remover classe após animação
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
  }

  setMode(mode) {
    this.applyMode(mode);
    this.setStoredMode(mode);
    this.updateThemeIcon();
    this.announceThemeChange(mode);
  }

  toggleMode() {
    const newMode = this.currentMode === 'light' ? 'dark' : 'light';
    this.setMode(newMode);
    
    // Adicionar feedback visual
    this.addToggleFeedback();
  }

  updateThemeIcon() {
    if (!this.themeIcon) return;
    
    const icons = {
      light: '🌙',
      dark: '☀️'
    };
    
    this.themeIcon.textContent = icons[this.currentMode];
    
    // Atualizar aria-label
    const labels = {
      light: 'Ativar tema escuro',
      dark: 'Ativar tema claro'
    };
    
    if (this.themeToggle) {
      this.themeToggle.setAttribute('aria-label', labels[this.currentMode]);
    }
  }

  addToggleFeedback() {
    if (!this.themeToggle) return;
    
    // Adicionar classe de feedback
    this.themeToggle.classList.add('theme-toggle--active');
    
    // Remover após animação
    setTimeout(() => {
      this.themeToggle.classList.remove('theme-toggle--active');
    }, 200);
  }

  addEntranceAnimation() {
    if (!this.themeToggle) return;
    
    // Adicionar animação de entrada
    this.themeToggle.style.opacity = '0';
    this.themeToggle.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      this.themeToggle.style.transition = 'all 0.3s ease';
      this.themeToggle.style.opacity = '1';
      this.themeToggle.style.transform = 'scale(1)';
    }, 100);
  }

  announceThemeChange(mode) {
    // Criar anúncio para leitores de tela
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Tema ${mode === 'dark' ? 'escuro' : 'claro'} ativado`;
    
    document.body.appendChild(announcement);
    
    // Remover após anúncio
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }

  updateStats() {
    // Simular contagem de carros e marcas
    setTimeout(() => {
      const totalCarsEl = document.getElementById('totalCars');
      const totalBrandsEl = document.getElementById('totalBrands');
      
      if (totalCarsEl) {
        this.animateNumber(totalCarsEl, 0, 247, 2000);
      }
      
      if (totalBrandsEl) {
        this.animateNumber(totalBrandsEl, 0, 15, 1500);
      }
    }, 500);
  }

  animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * easeOut);
      
      element.textContent = current.toLocaleString('pt-BR');
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  // Métodos públicos
  getCurrentMode() {
    return this.currentMode;
  }

  setModeManually(mode) {
    if (['light', 'dark'].includes(mode)) {
      this.setMode(mode);
    }
  }
}

// CSS adicional para animações
const additionalStyles = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .theme-transitioning * {
    transition: background-color 0.3s ease, 
                color 0.3s ease, 
                border-color 0.3s ease,
                box-shadow 0.3s ease !important;
  }

  .theme-toggle--active {
    transform: scale(0.95) !important;
  }

  .theme-toggle--active .theme-toggle__icon {
    transform: rotate(360deg) !important;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
    100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
  }

  .theme-toggle:focus {
    animation: pulse 1.5s infinite;
  }
`;

// Adicionar estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Aplicar tema original e inicializar novo sistema
applyTheme();

// Inicializar gerenciador de tema moderno
const themeManager = new ThemeManager();

// Aplicar customizações quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  applyBrandLogo();
  applyBrandName();
});

// Exportar para uso global
window.themeManager = themeManager;
window.setDarkMode = (mode) => themeManager.setModeManually(mode);
window.getDarkMode = () => themeManager.getCurrentMode();

// Debug
if (typeof window !== 'undefined') {
  console.log('🎨 Theme Manager moderno carregado!');
  console.log('🌙 Use setDarkMode("dark") ou setDarkMode("light") para alternar');
  console.log('🔍 Use getDarkMode() para ver o modo atual');
}

