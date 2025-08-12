import { by, all, uid } from './utils.js';
import { seedIfEmpty, getAllCars, upsertCar, deleteCar, togglePublished, exportJson } from './db.js';
import { moneyBRL } from './utils.js';

seedIfEmpty();

const els = {
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
  phone: by('#phone'),
  published: by('#published'),
  resetForm: by('#resetForm'),

  table: by('#carsTable tbody'),
  search: by('#searchAdmin'),
  exportJson: by('#exportJson'),
  importJson: by('#importJson')
};

let cache = getAllCars();

function readForm(){
  const images = els.images.value.split('\n').map(s => s.trim()).filter(Boolean);
  return {
    id: els.id.value || null,
    brand: els.brand.value.trim(),
    model: els.model.value.trim(),
    year: Number(els.year.value),
    price: Number(els.price.value),
    km: Number(els.km.value),
    color: els.color.value.trim(),
    transmission: els.transmission.value,
    fuel: els.fuel.value,
    description: els.description.value.trim(),
    images,
    phone: els.phone.value.trim(),
    published: els.published.checked
  };
}

function fillForm(c){
  els.id.value = c.id || '';
  els.brand.value = c.brand || '';
  els.model.value = c.model || '';
  els.year.value = c.year || '';
  els.price.value = c.price || '';
  els.km.value = c.km || '';
  els.color.value = c.color || '';
  els.transmission.value = c.transmission || 'Manual';
  els.fuel.value = c.fuel || 'Flex';
  els.description.value = c.description || '';
  els.images.value = (c.images || []).join('\n');
  els.phone.value = c.phone || '';
  els.published.checked = !!c.published;
}

function clearForm(){
  fillForm({});
}

function renderTable(){
  cache = getAllCars();
  const q = els.search.value.toLowerCase().trim();
  let rows = cache;
  if(q) rows = rows.filter(c => `${c.brand} ${c.model}`.toLowerCase().includes(q));

  els.table.innerHTML = rows.map(c => `
    <tr>
      <td>
        <input type="checkbox" data-action="pub" data-id="${c.id}" ${c.published ? 'checked' : ''}/>
      </td>
      <td><a href="details.html?id=${encodeURIComponent(c.id)}" target="_blank">${c.brand} ${c.model}</a></td>
      <td>${c.year}</td>
      <td>${(c.km||0).toLocaleString('pt-BR')}</td>
      <td>${moneyBRL(c.price)}</td>
      <td>
        <button class="btn" data-action="edit" data-id="${c.id}">Editar</button>
        <button class="btn" data-action="del" data-id="${c.id}">Excluir</button>
      </td>
    </tr>
  `).join('');
}

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = readForm();
  if(!data.brand || !data.model){ alert('Marca e Modelo são obrigatórios'); return; }
  const id = upsertCar(data);
  clearForm();
  renderTable();
  alert('Carro salvo!');
});

els.resetForm.addEventListener('click', () => clearForm());
els.search.addEventListener('input', renderTable);
els.exportJson.addEventListener('click', exportJson);
els.importJson.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if(!file) return;
  const text = await file.text();
  try{
    const arr = JSON.parse(text);
    if(!Array.isArray(arr)) throw new Error('JSON inválido');
    localStorage.setItem('carsDB_v1', JSON.stringify(arr));
    renderTable();
    alert('Importado com sucesso!');
  }catch(err){
    alert('Erro ao importar: ' + err.message);
  }finally{
    e.target.value = '';
  }
});

els.table.addEventListener('click', (e) => {
  const btn = e.target.closest('button, input[type=checkbox]');
  if(!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action || (btn.type === 'checkbox' ? 'pub' : '');
  if(action === 'edit'){
    const car = cache.find(c => c.id === id);
    if(car) fillForm(car);
    window.scrollTo({ top:0, behavior:'smooth' });
  } else if(action === 'del'){
    if(confirm('Deseja excluir este carro?')){
      deleteCar(id);
      renderTable();
    }
  } else if(action === 'pub'){
    togglePublished(id, btn.checked);
  }
});

// First paint
renderTable();