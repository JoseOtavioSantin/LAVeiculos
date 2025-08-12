const THEME_KEY = 'autocat_theme_v1';
const LOGO_KEY  = 'autocat_logo_v1';
const BRAND_KEY = 'autocat_brand_v1';

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
      el.textContent = `${name} • ${suffix || 'Admin'}`.trim();
    }else{
      el.textContent = name;
    }
  });
}

applyTheme();
document.addEventListener('DOMContentLoaded', () => {
  applyBrandLogo();
  applyBrandName();
});