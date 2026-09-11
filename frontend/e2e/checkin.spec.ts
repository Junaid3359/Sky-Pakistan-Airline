import { test, expect } from '@playwright/test';

test('manage booking check-in flow', async ({ page }) => {
  const booking = { bookingId: 'BKG1', pnr: 'PNR001', status: 'CONFIRMED' };

  await page.route('**/api/manage/by-pnr**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ booking }) }));
  await page.route('**/api/checkin**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ bpNumber: 'BP12345' }) }));

  const base = await page.goto('http://localhost:5174/').then(()=> 'http://localhost:5174').catch(async ()=> {
    await page.goto('http://localhost:5173/');
    return 'http://localhost:5173';
  });

  await page.goto(base + '/manage');
  await page.fill('input[placeholder="Enter PNR"]', 'PNR001');
  await page.click('button:has-text("Lookup")');
  await page.waitForSelector('pre');

  const checkinSection = page.locator('div:has-text("Check-in")');
  await checkinSection.locator('input[type="number"]').fill('0');
  await checkinSection.locator('input.w-48').fill('12A');

  // accept alert dialog using waitForEvent
  const [dialog] = await Promise.all([
    page.waitForEvent('dialog'),
    page.click('button:has-text("Check In")'),
  ]);
  await dialog.accept();
});
