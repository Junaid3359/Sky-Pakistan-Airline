import React from 'react';

export default function PassengerForm({ passenger, index, onChange }: { passenger: any; index: number; onChange: (p:any)=>void }){
  return (
    <div className="border p-3 rounded mb-3">
      <h4 className="font-semibold">Passenger {index+1}</h4>
      <label className="block text-sm mt-2">Full name</label>
      <input value={passenger.name||''} onChange={e=>onChange({ ...passenger, name: e.target.value })} className="p-2 border rounded w-full" />
      <label className="block text-sm mt-2">Type</label>
      <select value={passenger.type||'ADT'} onChange={e=>onChange({ ...passenger, type: e.target.value })} className="p-2 border rounded w-full">
        <option value="ADT">Adult</option>
        <option value="CHD">Child</option>
        <option value="INF">Infant</option>
      </select>
    </div>
  );
}
