import React, { useState } from 'react';
import { lookupPNR, cancelBooking, checkIn } from '../services/bookingService';

export default function ManageBooking(){
  const [pnr, setPnr] = useState('');
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [checkinPassenger, setCheckinPassenger] = useState(0);
  const [checkinSeat, setCheckinSeat] = useState('');

  const handleLookup = async ()=>{
    const res = await lookupPNR(pnr);
    setResult(res.booking || res);
  };

  const handleCancel = async ()=>{
    if(!result || !result.bookingId) return;
    setBusy(true);
    const res = await cancelBooking({ bookingId: result.bookingId, reason: 'User requested' });
    alert('Cancel requested. Refund: ' + (res.amount || 'N/A'));
    setBusy(false);
  };

  const handleCheckIn = async ()=>{
    if(!result || !result.bookingId) return;
    setBusy(true);
    const res = await checkIn({ bookingId: result.bookingId, passengerIndex: checkinPassenger, seat: checkinSeat });
    alert('Checked in. Boarding pass: ' + res.bpNumber);
    setBusy(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Manage Booking</h2>
      <div className="mb-4">
        <input value={pnr} onChange={e=>setPnr(e.target.value)} placeholder="Enter PNR" className="p-2 border rounded w-full" />
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={handleLookup} className="bg-sky-600 text-white px-4 py-2 rounded">Lookup</button>
        <button onClick={()=>{ setPnr(''); setResult(null); }} className="bg-gray-100 px-4 py-2 rounded">Clear</button>
      </div>
      {result && (
        <div>
          <h3 className="font-semibold">Booking</h3>
          <pre className="mt-2 p-3 bg-gray-50 rounded">{JSON.stringify(result, null, 2)}</pre>
          <div className="mt-3 flex gap-2">
            <button disabled={busy} onClick={handleCancel} className="px-3 py-2 bg-red-600 text-white rounded">Cancel Booking</button>
          </div>

          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold">Check-in</h4>
            <label className="block mt-2 text-sm">Passenger index</label>
            <input type="number" value={checkinPassenger} onChange={e=>setCheckinPassenger(Number(e.target.value))} className="p-2 border rounded w-32" />
            <label className="block mt-2 text-sm">Seat (optional)</label>
            <input value={checkinSeat} onChange={e=>setCheckinSeat(e.target.value)} className="p-2 border rounded w-48" />
            <div className="mt-2">
              <button disabled={busy} onClick={handleCheckIn} className="px-3 py-2 bg-green-600 text-white rounded">Check In</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
