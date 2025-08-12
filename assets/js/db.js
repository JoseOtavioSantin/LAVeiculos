import { uid } from './utils.js';

const STORAGE_KEY = 'carsDB_v1';

const defaultData = [
  {
    id: uid(),
    brand: 'Toyota',
    model: 'Corolla XEi',
    year: 2020,
    price: 98900,
    km: 45000,
    color: 'Prata',
    transmission: 'Automático',
    fuel: 'Flex',
    phone: '5551999999999',
    description: 'Único dono, revisões em dia, multimídia, bancos de couro.',
    images: [
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549921296-3a6b3a66c6b0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1200&auto=format&fit=crop'
    ],
    published: true,
    createdAt: Date.now()
  },
  {
    id: uid(),
    brand: 'Volkswagen',
    model: 'T-Cross Highline',
    year: 2022,
    price: 132900,
    km: 22000,
    color: 'Branco',
    transmission: 'Automático',
    fuel: 'Flex',
    phone: '5551999999999',
    description: 'SUV completo, teto solar, ACC, manutenção ok.',
    images: [
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=1200&auto=format&fit=crop'
    ],
    published: true,
    createdAt: Date.now()
  },
  {
    id: uid(),
    brand: 'Chevrolet',
    model: 'Onix LTZ',
    year: 2019,
    price: 65900,
    km: 62000,
    color: 'Preto',
    transmission: 'Manual',
    fuel: 'Flex',
    phone: '5551999999999',
    description: 'Econômico e confiável, ótimo para cidade.',
    images: [
      'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop'
    ],
    published: true,
    createdAt: Date.now()
  }
];

export function seedIfEmpty(){
  const exists = localStorage.getItem(STORAGE_KEY);
  if(!exists){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  }
}

export function getAllCars(){
  const raw = localStorage.getItem(STORAGE_KEY) || '[]';
  try{ return JSON.parse(raw); }catch{ return []; }
}

export function saveAllCars(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function upsertCar(car){
  const list = getAllCars();
  if(!car.id){
    car.id = uid();
    car.createdAt = Date.now();
    list.unshift(car);
  }else{
    const idx = list.findIndex(c => c.id === car.id);
    if(idx >= 0) list[idx] = { ...list[idx], ...car };
    else list.unshift(car);
  }
  saveAllCars(list);
  return car.id;
}

export function deleteCar(id){
  const list = getAllCars().filter(c => c.id !== id);
  saveAllCars(list);
}

export function findById(id){
  return getAllCars().find(c => c.id === id);
}

export function togglePublished(id, value){
  const list = getAllCars();
  const idx = list.findIndex(c => c.id === id);
  if(idx >= 0){
    list[idx].published = (value ?? !list[idx].published);
    saveAllCars(list);
  }
}

export function exportJson(){
  const dataStr = JSON.stringify(getAllCars(), null, 2);
  const blob = new Blob([dataStr], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'carros.json';
  a.click();
  URL.revokeObjectURL(url);
}