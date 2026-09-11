import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFlight, initiateBooking, createPayment, verifyPayment, confirmBooking, generateTicket, verifyBooking } from '../services/bookingService';
import SeatMap from '../components/SeatMap';
import PassengerForm from '../components/PassengerForm';
import PaymentModal from '../components/PaymentModal';
import { formatAirport } from '../data/airports';

export default function BookFlight(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [passengers, setPassengers] = useState<any[]>([{ name: '', type: 'ADT' }]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [extras, setExtras] = useState({ baggage: 0, meal: false });
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [failedSeats, setFailedSeats] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(()=>{
    if(!id) return;
    getFlight(id).then(r=>setFlight(r)).finally(()=>setLoading(false));
  },[id]);

  const toggleSeat = (seatId: string) => {
    setSelectedSeats(s=> s.includes(seatId) ? s.filter(x=>x!==seatId) : [...s, seatId]);
  };

  const updatePassenger = (idx:number, p:any) => {
    setPassengers(prev=> prev.map((x,i)=> i===idx? p : x));
  };

  const addPassenger = ()=> setPassengers(prev=>[...prev, { name: '', type: 'ADT' }]);

  const handleBook = async ()=>{
    if(!flight) return;
    if (!localStorage.getItem('token')) {
      setVerifyError('Please login before booking a flight.');
      navigate('/login');
      return;
    }
    if (!selectedSeats.length) {
      setVerifyError('Please select at least one seat.');
      return;
    }
    if (passengers.some((passenger) => !passenger.name?.trim())) {
      setVerifyError('Please enter the full name for every passenger.');
      return;
    }
    const payload:any = { flightId: flight.id, passengers, fares: flight.fares, seats: selectedSeats, extras };
    setBusy(true);
    setVerifyError(null);
    setFailedSeats([]);
    try {
      const hold = await initiateBooking(payload);
      const pre = await verifyBooking({ bookingId: hold.bookingId });
      if (!pre.ok) {
        const failed: string[] = pre.failedSeats || [];
        setSelectedSeats(s => s.filter(x=> !failed.includes(x)));
        setFailedSeats(failed);
        setVerifyError('Some seats are no longer available. Please reselect or retry.');
        return;
      }
      const baseFare = (flight.fares && flight.fares[0] && flight.fares[0].totalPerPassenger) ? flight.fares[0].totalPerPassenger : 0;
      const amount = baseFare * passengers.length + (extras.baggage || 0) * 2000 + (extras.meal ? 500 * passengers.length : 0);
      setPendingBookingId(hold.bookingId);
      setPendingAmount(amount);
      setPaymentOpen(true);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Booking could not be started. Please login and try again.';
      setVerifyError(message);
      if (error?.response?.status === 401) navigate('/login');
    } finally {
      setBusy(false);
    }
  };

  const retryHold = async () => {
    if(!flight) return;
    setBusy(true);
    setVerifyError(null);
    try {
      const payload:any = { flightId: flight.id, passengers, fares: flight.fares, seats: selectedSeats };
      const hold = await initiateBooking(payload);
      const pre = await verifyBooking({ bookingId: hold.bookingId });
      if (!pre.ok) {
        const failed: string[] = pre.failedSeats || [];
        setSelectedSeats(s => s.filter(x=> !failed.includes(x)));
        setFailedSeats(failed);
        setVerifyError('Still some seats unavailable. Please reselect.');
        setBusy(false);
        return;
      }
      const baseFare = (flight.fares && flight.fares[0] && flight.fares[0].totalPerPassenger) ? flight.fares[0].totalPerPassenger : 0;
      const amount = baseFare * passengers.length + (extras.baggage || 0) * 2000 + (extras.meal ? 500 * passengers.length : 0);
      setPendingBookingId(hold.bookingId);
      setPendingAmount(amount);
      setPaymentOpen(true);
    } catch (e) {
      setVerifyError('Retry failed. Try reselecting seats.');
    } finally { setBusy(false); }
  };

  if(loading) return <div>Loading...</div>;
  if(!flight) return <div>Flight not found</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Book {flight.flightNumber}</h2>
      <div className="mb-4">From {formatAirport(flight.origin)} to {formatAirport(flight.destination)} — {new Date(flight.departure).toLocaleString()}</div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Select Seats</h3>
        <SeatMap seats={flight.seatMap} onSelect={toggleSeat} selected={selectedSeats} />
        <div className="text-sm text-gray-600 mt-2">Selected: {selectedSeats.join(', ') || 'None'}</div>
        {verifyError && (
          <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400">
            <div className="font-medium text-yellow-800">{verifyError}</div>
            {failedSeats.length>0 && <div className="text-sm text-yellow-700 mt-1">Unavailable seats: {failedSeats.join(', ')}</div>}
            <div className="mt-2 flex gap-2">
              <button disabled={busy} onClick={retryHold} className="px-3 py-1 bg-sky-600 text-white rounded">Retry</button>
              <button disabled={busy} onClick={()=>{ setFailedSeats([]); setVerifyError(null); }} className="px-3 py-1 bg-gray-100 rounded">Reselect</button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Passengers</h3>
        {passengers.map((p, idx) => (
          <PassengerForm key={idx} passenger={p} index={idx} onChange={(np)=>updatePassenger(idx, np)} />
        ))}
        <button onClick={addPassenger} className="mb-4 bg-gray-100 px-3 py-1 rounded">Add passenger</button>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Extras</h3>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="number" value={extras.baggage} onChange={e=>setExtras(x=>({ ...x, baggage: Number(e.target.value) }))} className="w-20 p-1 border rounded" />
            <span className="text-sm">Bags</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={extras.meal} onChange={e=>setExtras(x=>({ ...x, meal: e.target.checked }))} />
            <span className="text-sm">In-flight meal</span>
          </label>
        </div>
      </div>

      <button disabled={busy} onClick={handleBook} className="w-full bg-green-600 py-2 text-white rounded disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Preparing booking...' : 'Pay & Confirm'}</button>
      {paymentOpen && pendingBookingId && (
        <PaymentModal bookingId={pendingBookingId} amount={pendingAmount} onClose={()=>{ setPaymentOpen(false); setPendingBookingId(null); }} />
      )}
    </div>
  );
}
