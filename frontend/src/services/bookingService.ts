import api from './api';

export async function searchFlights(params: any) {
  const res = await api.get('/flights/search', { params });
  return res.data.results;
}

export async function getFlight(id: string) {
  const res = await api.get(`/flights/${id}`);
  return { ...res.data.flight, id: res.data.flight._id, fares: res.data.fares, seatMap: res.data.seatMap };
}

export async function initiateBooking(payload: any) {
  const res = await api.post('/bookings/initiate', payload);
  return res.data;
}

export async function createPayment(payload: any) {
  const res = await api.post('/payments/create', payload);
  return res.data;
}

export async function verifyPayment(payload: any) {
  const res = await api.post('/payments/verify', payload);
  return res.data;
}

export async function confirmBooking(payload: any) {
  const res = await api.post('/bookings/confirm', payload);
  return res.data;
}

export async function verifyBooking(payload: any) {
  const res = await api.post('/bookings/verify', payload);
  return res.data;
}

export async function cancelBooking(payload: any) {
  const res = await api.post('/manage/cancel', payload);
  return res.data;
}

export async function checkIn(payload: any) {
  const res = await api.post('/checkin', payload);
  return res.data;
}

export async function generateTicket(payload: any) {
  // returns PDF stream
  const res = await api.post('/tickets/generate', payload, { responseType: 'blob' });
  return res.data;
}

export async function lookupPNR(pnr: string) {
  const res = await api.get('/manage/by-pnr', { params: { pnr } });
  return res.data;
}
