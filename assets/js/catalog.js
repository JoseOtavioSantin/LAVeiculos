import { moneyBRL, formatKm, by, all, slugify } from './utils.js';
import { seedIfEmpty, getAllCars } from './db.js';
import { applyBrandLogo, applyBrandName } from './theme.js';

seedIfEmpty();
applyBrandLogo();
applyBrandName();

const state = { q:'', brand:'', yearMin:'', transmission:'', fuel:'', minPrice:'', maxPrice:'', sort:'recent' };
const els = { grid: by('#grid'), empty: by('#emptyState'), q: by('#q'), brand: by('#brandSelect'), year: by('#yearSelect'), transmission: by('#transmissionSelect'), fuel: by('#fuelSelect'), minPrice: by('#minPrice'), maxPrice: by('#maxPrice'), sort: by('#sortSelect'), clear: by('#clearFilters'), cardTpl: by('#cardTemplate') };

function populateFilters(){
  const cars = getAllCars().filter(c => c.published);
  const brands = [...new Set(cars.map(c => c.brand))].sort();
  els.brand.innerHTML = '<option value="">Todas as marcas</option>' + brands.map(b => `<option>${b}</option>`).join('');
  const years = [...new Set(cars.map(c => c.year))].sort((a,b) => b-a);
  els.year.innerHTML = '<option value="">Ano mínimo</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
}

function applyFilters(cars){
  let res = cars;
  if(state.q){ const q = state.q.toLowerCase(); res = res.filter(c => `${c.brand} ${c.model} ${c.color}`.toLowerCase().includes(q)); }
  if(state.brand) res = res.filter(c => c.brand === state.brand);
  if(state.yearMin) res = res.filter(c => c.year >= Number(state.yearMin));
  if(state.transmission) res = res.filter(c => c.transmission === state.transmission);
  if(state.fuel) res = res.filter(c => c.fuel === state.fuel);
  if(state.minPrice) res = res.filter(c => c.price >= Number(state.minPrice));
  if(state.maxPrice) res = res.filter(c => c.price <= Number(state.maxPrice));
  switch(state.sort){
    case 'priceAsc': res.sort((a,b)=>a.price-b.price); break;
    case 'priceDesc': res.sort((a,b)=>b.price-a.price); break;
    case 'yearDesc': res.sort((a,b)=>b.year-a.year); break;
    case 'kmAsc': res.sort((a,b)=>a.km-b.km); break;
    default: res.sort((a,b)=>(b.createdAt??0)-(a.createdAt??0));
  }
  return res;
}

function render(){
  const cars = applyFilters(getAllCars().filter(c => c.published));
  els.grid.innerHTML = ''; els.empty.hidden = cars.length > 0; if(!cars.length) return;
  for(const c of cars){
    const node = els.cardTpl.content.cloneNode(true);
    const article = node.querySelector('.car'); const link = node.querySelector('.car__thumb__wrap'); const img = node.querySelector('.car__thumb'); const badge = node.querySelector('.badge');
    node.querySelector('.car__title').textContent = `${c.brand} ${c.model}`;
    node.querySelector('.car__price').textContent = moneyBRL(c.price);
    node.querySelector('.car__meta').textContent = `${c.color} • ${c.transmission} • ${c.fuel}`;
    node.querySelector('.chip.year').textContent = c.year; node.querySelector('.chip.km').textContent = formatKm(c.km); node.querySelector('.chip.fuel').textContent = c.fuel;
    img.src = (c.images?.[0]) || 'assets/img/placeholder.jpg'; img.alt = `${c.brand} ${c.model}`;
    badge.textContent = (Date.now() - (c.createdAt||0)) < (1000*60*60*24*30) ? 'NOVO' : 'SELECIONADO';
    const url = `details.html?id=${encodeURIComponent(c.id)}&car=${encodeURIComponent(slugify(c.brand+'-'+c.model))}`;
    link.href = url; article.addEventListener('click', (e) => { if(e.target.tagName !== 'A') window.location.href = url; });
    els.grid.appendChild(node);
  }
}

function bind(){
  els.q.addEventListener('input', e => { state.q = e.target.value; render(); });
  els.brand.addEventListener('change', e => { state.brand = e.target.value; render(); });
  els.year.addEventListener('change', e => { state.yearMin = e.target.value; render(); });
  els.transmission.addEventListener('change', e => { state.transmission = e.target.value; render(); });
  els.fuel.addEventListener('change', e => { state.fuel = e.target.value; render(); });
  els.minPrice.addEventListener('input', e => { state.minPrice = e.target.value; render(); });
  els.maxPrice.addEventListener('input', e => { state.maxPrice = e.target.value; render(); });
  els.sort.addEventListener('change', e => { state.sort = e.target.value; render(); });
  els.clear.addEventListener('click', () => {
    Object.assign(state, { q:'', brand:'', yearMin:'', transmission:'', fuel:'', minPrice:'', maxPrice:'', sort:'recent' });
    els.q.value = els.brand.value = els.year.value = els.transmission.value = els.fuel.value = els.minPrice.value = els.maxPrice.value = '';
    els.sort.value = 'recent'; render();
  });
}

populateFilters(); bind(); render();