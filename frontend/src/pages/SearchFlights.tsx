import React from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { airports } from '../data/airports';

type Form = { origin: string; destination: string; departureDate: string };

const origins = airports.filter(({ code }) => ['LHE', 'ISB', 'MUX', 'KHI'].includes(code));
const destinations = airports.filter(({ code }) => code !== 'LHE' && code !== 'ISB' && code !== 'MUX' && code !== 'KHI');

export default function SearchFlights() {
  const location = useLocation();
  const queryDestination = new URLSearchParams(location.search).get('destination') || 'DXB';
  const { register, handleSubmit } = useForm<Form>({ defaultValues: { origin: 'LHE', destination: queryDestination, departureDate: '2026-09-15' } });
  const navigate = useNavigate();

  const onSubmit = (data: Form) => {
    const params = new URLSearchParams();
    params.set('origin', data.origin);
    params.set('destination', data.destination);
    params.set('departureDate', data.departureDate || new Date().toISOString().slice(0,10));
    navigate('/flights?' + params.toString());
  };

  return (
    <div className="mx-auto max-w-4xl bg-white p-6 shadow md:p-10">
      <p className="section-kicker">Plan your next journey</p>
      <h2 className="display-font mb-6 mt-2 text-4xl font-extrabold text-[#102b44]">Search flights</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="text-xs font-bold uppercase tracking-wider text-[#71808c]">From<select {...register('origin')} className="mt-2 w-full border border-[#dce3e8] bg-[#f7f9fa] p-3 text-base font-bold text-[#102b44]">{origins.map((airport) => <option key={airport.code} value={airport.code}>{airport.city} - {airport.name} ({airport.code})</option>)}</select></label>
        <label className="text-xs font-bold uppercase tracking-wider text-[#71808c]">To<select {...register('destination')} className="mt-2 w-full border border-[#dce3e8] bg-[#f7f9fa] p-3 text-base font-bold text-[#102b44]">{destinations.map((airport) => <option key={airport.code} value={airport.code}>{airport.city} - {airport.name} ({airport.code})</option>)}</select></label>
        <label className="text-xs font-bold uppercase tracking-wider text-[#71808c]">Departure<input type="date" {...register('departureDate')} className="mt-2 w-full border border-[#dce3e8] bg-[#f7f9fa] p-3 text-base font-bold text-[#102b44]" /></label>
        <div className="md:col-span-3">
          <button className="w-full bg-sky-600 text-white py-2 rounded">Search</button>
        </div>
      </form>
    </div>
  );
}
