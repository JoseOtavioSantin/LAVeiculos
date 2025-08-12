import { by, all, moneyBRL, formatKm } from './utils.js';
import { findById } from './db.js';
import { applyBrandLogo, applyBrandName } from './theme.js';
const params=new URLSearchParams(location.search);const id=params.get('id');
const notFound=by('#notFound'); const detail=by('#detail'); const thumbs=by('#thumbs'); const photoMain=by('#photoMain');
const car=findById(id); applyBrandLogo(); applyBrandName();
if(!car||!car.published){notFound.hidden=false;} else {
detail.hidden=false;
by('#title').textContent=`${car.brand} ${car.model}`; by('#price').textContent=moneyBRL(car.price); by('#description').textContent=car.description||'Sem descrição informada.';
by('#brand').textContent=car.brand; by('#model').textContent=car.model; by('#year').textContent=car.year; by('#km').textContent=formatKm(car.km); by('#transmission').textContent=car.transmission; by('#fuel').textContent=car.fuel; by('#color').textContent=car.color;
const featsEl=by('#features'); const feats=Array.isArray(car.features)?car.features:[]; featsEl.innerHTML=''; feats.forEach(name=>{const li=document.createElement('li'); li.textContent=name; featsEl.appendChild(li);});
const contactsEl=by('#contacts'); const contacts=Array.isArray(car.consultants)&&car.consultants.length?car.consultants.filter(c=>c.phone):(car.phone?[{name:'',phone:car.phone}]:[]);
contacts.forEach(c=>{const a=document.createElement('a'); a.className='btn primary'; const label=c.name?('Falar com '+c.name):'Falar no WhatsApp'; a.textContent=label; a.target='_blank'; a.rel='noopener'; a.href=`https://wa.me/${c.phone}?text=${encodeURIComponent('Tenho interesse no '+car.brand+' '+car.model)}`; contactsEl.appendChild(a);});
const back=document.createElement('a'); back.className='btn ghost'; back.href='index.html'; back.textContent='Voltar ao Catálogo'; contactsEl.appendChild(back);
const imgs=car.images?.length?car.images:['assets/img/placeholder.jpg']; photoMain.src=imgs[0]; thumbs.innerHTML=''; imgs.forEach((src,i)=>{const img=new Image(); img.src=src; img.alt='Foto '+(i+1); if(i===0)img.classList.add('active'); img.addEventListener('click',()=>{all('.gallery__thumbs img').forEach(t=>t.classList.remove('active')); img.classList.add('active'); photoMain.src=src;}); thumbs.appendChild(img);});}
