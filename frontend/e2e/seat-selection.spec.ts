import { test, expect } from '@playwright/test';

test('seat selection holds seats', async ({ page }) => {
  // Mock backend search and flight details for deterministic UI
  const flight = {
    id: 'flight-1', flightNumber: 'SP100', origin: 'LHE', destination: 'DXB', departure: new Date().toISOString(),
    fares: [{ totalPerPassenger: 15000 }],
    seatMap: [ { id: '1A', label: '1A', status: 'AVAILABLE' }, { id: '1B', label: '1B', status: 'OCCUPIED' }, { id: '1C', label: '1C', status: 'AVAILABLE' } ]
  };

  await page.route('**/api/flights/search**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [flight] }) }));
  await page.route('**/api/flights/*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(flight) }));

  // Resolve base URL (try 5174 then 5173)
  const base = await page.goto('http://localhost:5174/').then(()=> 'http://localhost:5174').catch(async ()=> {
    await page.goto('http://localhost:5173/');
    return 'http://localhost:5173';
  });

  // Navigate directly to the booking page to avoid relying on search/results rendering
  await page.goto(base + '/book/flight-1');
  await expect(page.locator('h2')).toHaveText(/Book/);

  // we are already on the booking page; ensure header present
  await expect(page.locator('h2')).toHaveText(/Book/);

  // Wait for seat buttons and click the first available one
  const firstSeat = page.locator('div.grid button:not([disabled])').first();
  const label = await firstSeat.innerText();
  await firstSeat.click();

  // Selected text should include the seat label
  await expect(page.locator('text=Selected:')).toContainText(label);
});
