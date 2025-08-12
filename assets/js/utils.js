export const moneyBRL=(n)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n??0);
export const formatKm=(n)=>`${Number(n||0).toLocaleString('pt-BR')} km`;
export const by=(s,scope=document)=>scope.querySelector(s);
export const all=(s,scope=document)=>[...scope.querySelectorAll(s)];
export const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
export const slugify=(s)=>String(s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
