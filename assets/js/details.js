import { by, all, moneyBRL, formatKm } from './utils.js';
import { findById } from './db.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');

const notFound = by('#notFound');
const detail = by('#detail');
const thumbs = by('#thumbs');
const photoMain = by('#photoMain');

const car = findById(id);

if(!car || !car.published){
  notFound.hidden = false;
} else {
  detail.hidden = false;
  by('#title').textContent = `${car.brand} ${car.model}`;
  by('#price').textContent = moneyBRL(car.price);
  by('#description').textContent = car.description || 'Sem descrição informada.';
  by('#brand').textContent = car.brand;
  by('#model').textContent = car.model;
  by('#year').textContent = car.year;
  by('#km').textContent = formatKm(car.km);
  by('#transmission').textContent = car.transmission;
  by('#fuel').textContent = car.fuel;
  by('#color').textContent = car.color;
  by('#whatsLink').href = `https://wa.me/${car.phone || ''}?text=${encodeURIComponent('Tenho interesse no '+car.brand+' '+car.model)}`;

  const imgs = car.images?.length ? car.images : ['assets/img/placeholder.jpg'];
  photoMain.src = imgs[0];
  thumbs.innerHTML = '';
  imgs.forEach((src, i) => {
    const img = new Image();
    img.src = src; img.alt = 'Foto '+(i+1);
    if(i===0) img.classList.add('active');
    img.addEventListener('click', () => {
      all('.gallery__thumbs img').forEach(t => t.classList.remove('active'));
      img.classList.add('active');
      photoMain.src = src;
    });
    thumbs.appendChild(img);
  });
}