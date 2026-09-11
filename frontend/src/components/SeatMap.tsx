import React from 'react';

type Seat = { id: string; label: string; status?: 'AVAILABLE'|'OCCUPIED' };

export default function SeatMap({ seats, onSelect, selected = [] }: { seats?: Seat[]; onSelect: (id:string)=>void; selected?: string[] }){
  // generate sample 6 rows x 6 cols if no seats provided
  const grid: Seat[] = seats && seats.length ? seats : (()=>{
    const rows = 6; const cols = ['A','B','C','D','E','F'];
    const arr: Seat[] = [];
    for(let r=1;r<=rows;r++) for(const c of cols) arr.push({ id: `${r}${c}`, label: `${r}${c}`, status: Math.random() < 0.15 ? 'OCCUPIED' : 'AVAILABLE' });
    return arr;
  })();

  return (
    <div className="grid grid-cols-6 gap-2">
      {grid.map(s=>{
        const isSelected = selected.includes(s.id);
        const disabled = s.status==='OCCUPIED';
        return (
          <button key={s.id} disabled={disabled} onClick={()=>onSelect(s.id)} className={`p-2 rounded ${disabled? 'bg-gray-300 text-gray-600':'bg-white border'} ${isSelected? 'ring-2 ring-sky-500':''}`}>
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
