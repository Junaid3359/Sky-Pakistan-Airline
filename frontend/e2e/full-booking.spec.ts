import { test, expect } from '@playwright/test';

test('full booking flow with payment modal', async ({ page }) => {
  // Mock backend endpoints to make the flow deterministic
  const flight = {
    id: 'flight-1', flightNumber: 'SP100', origin: 'LHE', destination: 'DXB', departure: new Date().toISOString(),
    fares: [{ totalPerPassenger: 15000 }],
    seatMap: [ { id: '1A', label: '1A', status: 'AVAILABLE' }, { id: '1B', label: '1B', status: 'AVAILABLE' } ]
  };

  await page.route('**/api/flights/search**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [flight] }) }));
  await page.route('**/api/flights/*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(flight) }));

  // bookings/payments/tickets endpoints
  await page.route('**/api/bookings/initiate', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ bookingId: 'hold-1' }) }));
  await page.route('**/api/bookings/verify', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));
  await page.route('**/api/payments/create**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ paymentId: 'pay-1' }) }));
  await page.route('**/api/payments/verify**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));
  await page.route('**/api/bookings/confirm**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ pnr: 'PNR123', status: 'CONFIRMED' }) }));
  await page.route('**/api/tickets/generate**', route => route.fulfill({ status: 200, contentType: 'application/pdf', body: Buffer.from('%PDF-1.4\n%EOF') }));

  const base = await page.goto('http://localhost:5174/').then(()=> 'http://localhost:5174').catch(async ()=> {
    await page.goto('http://localhost:5173/');
    return 'http://localhost:5173';
  });

  // Navigate directly to the booking page for the mocked flight
  await page.goto(base + '/book/flight-1');
  await page.waitForSelector('h2:has-text("Book")');

  // pick a seat
  const seat = page.locator('div.grid button:not([disabled])').first();
  const seatLabel = await seat.innerText();
  await seat.click();

  // fill passenger name
  // fill passenger full name (first input on the form)
  await page.locator('input').first().fill('E2E Passenger');

  // click Pay & Confirm which opens payment modal
  await page.click('button:has-text("Pay & Confirm")');

  // Wait for mock payment modal
  await page.waitForSelector('text=Mock Payment');
  await page.click('button:has-text("Pay now")');

  // Wait for success status in modal
  await page.waitForSelector('text=Success! Ticket opened.', { timeout: 20000 });
  await expect(page.locator('text=Success! Ticket opened.')).toBeVisible();
});
