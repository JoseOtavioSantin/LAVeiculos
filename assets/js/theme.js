const THEME_KEY = 'autocat_theme_v1';
const LOGO_KEY  = 'autocat_logo_v1';

export function getTheme(){
  try{ return JSON.parse(localStorage.getItem(THEME_KEY) || '{}'); }catch{ return {}; }
}
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

// First paint
applyTheme();
document.addEventListener('DOMContentLoaded', applyBrandLogo);