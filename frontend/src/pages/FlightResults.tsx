import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchFlights } from '../services/bookingService';
import { formatAirport } from '../data/airports';

export default function FlightResults() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(loc.search).entries());
    if (!params.origin) return;
    setLoading(true);
    searchFlights(params).then((r:any) => setResults(r)).catch(()=>{}).finally(()=>setLoading(false));
  }, [loc.search]);

  return (
    <div>
      <h2 className="display-font mb-2 text-3xl font-extrabold text-[#102b44]">Available flights</h2>
      <p className="mb-6 text-[#71808c]">Choose your route and fare, then select your seat.</p>
      {loading && <div>Loading...</div>}
      <div className="grid gap-4">
        {results.map((f:any)=>(
          <div key={f.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{f.flightNumber} — {formatAirport(f.origin)} → {formatAirport(f.destination)}</div>
              <div className="text-sm text-gray-600">Departs: {new Date(f.departure).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">From {f.fares[0].totalPerPassenger} PKR</div>
              <button onClick={()=> navigate('/book/' + f.id)} className="mt-2 bg-sky-600 text-white px-4 py-2 rounded">Select</button>
            </div>
          </div>
        ))}
      </div>
      {!loading && results.length === 0 && <div className="border border-dashed border-[#cbd6dc] bg-white p-8 text-center text-[#71808c]">No flights found for this route and date. Try another destination or departure date.</div>}
    </div>
  );
}
