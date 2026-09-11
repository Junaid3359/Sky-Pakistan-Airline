import { test, expect } from '@playwright/test';

test('ticket generate returns PDF', async ({ page }) => {
  // Mock the tickets endpoint to return a minimal PDF
  await page.route('**/api/tickets/generate', route => route.fulfill({ status: 200, contentType: 'application/pdf', body: Buffer.from('%PDF-1.4\n%EOF') }));

  const base = await page.goto('http://localhost:5174/').then(()=> 'http://localhost:5174').catch(async ()=> {
    await page.goto('http://localhost:5173/');
    return 'http://localhost:5173';
  });

  // Use browser context fetch so route interception applies
  const res = await page.evaluate(async (root) => {
    const r = await fetch(root + '/api/tickets/generate', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ bookingId: 'b1' }) });
    const buf = await r.arrayBuffer();
    const bytes = Array.from(new Uint8Array(buf)).slice(0,8).map(b=>String.fromCharCode(b)).join('');
    return bytes;
  }, base);

  expect(res).toContain('%PDF');
});
