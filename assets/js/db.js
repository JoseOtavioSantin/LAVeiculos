import { uid } from './utils.js';

const STORAGE_KEY = 'carsDB_v1';

const defaultData = [
  { id: uid(), brand: 'Toyota', model: 'Corolla XEi', year: 2020, price: 98900, km: 45000, color: 'Prata', transmission: 'Automático', fuel: 'Flex', description:'Único dono, revisões em dia.', features:['Direção elétrica','Ar-condicionado','Multimídia','Câmera de ré'], consultants:[{name:'Ana', phone:'5551999999999'}], images:['assets/img/placeholder.jpg'], published: true, createdAt: Date.now() },
  { id: uid(), brand: 'Volkswagen', model: 'T-Cross Highline', year: 2022, price: 132900, km: 22000, color: 'Branco', transmission: 'Automático', fuel: 'Flex', description:'SUV completo, teto solar, ACC.', features:['Direção elétrica','Ar digital','Sensor de estacionamento'], consultants:[{name:'Bruno', phone:'5551999999999'}, {name:'Carla', phone:'5551888888888'}], images:['assets/img/placeholder.jpg'], published: true, createdAt: Date.now() }
];

export function seedIfEmpty(){
  const exists = localStorage.getItem(STORAGE_KEY);
  if(!exists){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  }
}
export function getAllCars(){ const raw = localStorage.getItem(STORAGE_KEY) || '[]'; try{ return JSON.parse(raw); }catch{ return []; } }
export function saveAllCars(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
export function upsertCar(car){
  const list = getAllCars();
  if(!car.id){ car.id = uid(); car.createdAt = Date.now(); list.unshift(car); }
  else{ const i = list.findIndex(c => c.id === car.id); if(i>=0) list[i] = { ...list[i], ...car }; else list.unshift(car); }
  saveAllCars(list); return car.id;
}
export function deleteCar(id){ const list = getAllCars().filter(c => c.id !== id); saveAllCars(list); }
export function findById(id){ return getAllCars().find(c => c.id === id); }
export function togglePublished(id, value){ const list = getAllCars(); const i = list.findIndex(c => c.id === id); if(i>=0){ list[i].published = (value ?? !list[i].published); saveAllCars(list); } }
export function exportJson(){
  const dataStr = JSON.stringify(getAllCars(), null, 2);
  const blob = new Blob([dataStr], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'carros.json'; a.click(); URL.revokeObjectURL(url);
}