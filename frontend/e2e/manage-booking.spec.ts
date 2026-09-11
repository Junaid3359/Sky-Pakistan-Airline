import { test, expect } from '@playwright/test';

test('manage booking lookup and cancel', async ({ page }) => {
  const booking = { bookingId: 'BKG1', pnr: 'PNR001', status: 'CONFIRMED' };

  await page.route('**/api/manage/by-pnr**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ booking }) }));
  await page.route('**/api/manage/cancel**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ amount: 12000 }) }));

  const base = await page.goto('http://localhost:5174/').then(()=> 'http://localhost:5174').catch(async ()=> {
    await page.goto('http://localhost:5173/');
    return 'http://localhost:5173';
  });

  await page.goto(base + '/manage');
  await page.fill('input[placeholder="Enter PNR"]', 'PNR001');
  await page.click('button:has-text("Lookup")');
  await page.waitForSelector('pre');
  const pre = await page.locator('pre').innerText();
  expect(pre).toContain('BKG1');

  // handle alert from cancel using waitForEvent for reliability
  const [dialog] = await Promise.all([
    page.waitForEvent('dialog'),
    page.click('button:has-text("Cancel Booking")'),
  ]);
  await dialog.accept();
});
