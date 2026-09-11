import React, { useState } from 'react';
import { createPayment, verifyPayment, confirmBooking, generateTicket } from '../services/bookingService';

export default function PaymentModal({ bookingId, amount, onClose }: { bookingId: string; amount: number; onClose: ()=>void }){
  const [status, setStatus] = useState<string>('ready');
  const [error, setError] = useState<string | null>(null);

  const doPayment = async () => {
    try {
      setError(null);
      setStatus('creating');
      const payment = await createPayment({ bookingId, amount });
      setStatus('verifying');
      // simulate user completing payment in UI and provider returning success
      await verifyPayment({ paymentId: payment.paymentId, success: true });
      setStatus('confirming');
      const confirm = await confirmBooking({ bookingId, paymentId: payment.paymentId });
      setStatus('generating');
      const pdf = await generateTicket({ bookingId });
      const url = window.URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
      window.open(url, '_blank');
      setStatus('done');
      setTimeout(()=> onClose(), 800);
    } catch (e:any) {
      console.error(e);
      setError(e?.response?.data?.message || e.message || 'Payment failed');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        <h3 className="text-lg font-semibold">Mock Payment</h3>
        <div className="mt-2">Amount: <strong>{amount} PKR</strong></div>
        <div className="mt-4">
          {status==='ready' && <button onClick={doPayment} className="px-4 py-2 bg-sky-600 text-white rounded">Pay now</button>}
          {status==='creating' && <div>Creating payment...</div>}
          {status==='verifying' && <div>Waiting verification...</div>}
          {status==='confirming' && <div>Confirming booking...</div>}
          {status==='generating' && <div>Generating ticket...</div>}
          {status==='done' && <div className="text-green-600">Success! Ticket opened.</div>}
          {status==='error' && <div className="text-red-600">{error}</div>}
        </div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-3 py-1 bg-gray-100 rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
