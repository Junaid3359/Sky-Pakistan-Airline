import { test, expect } from '@playwright/test';

test('basic booking flow smoke', async ({ page }) => {
  // Try ports 5174 then 5173
  const base = await page.goto('http://localhost:5174/').then(()=> 'http://localhost:5174').catch(async ()=> {
    await page.goto('http://localhost:5173/');
    return 'http://localhost:5173';
  });

  // Open search page
  await page.goto(base + '/search');
  await expect(page.locator('h2')).toHaveText(/Search Flights/);
  await page.fill('input[name="origin"]', 'LHE');
  await page.fill('input[name="destination"]', 'DXB');
  await page.click('button:has-text("Search")');
  await expect(page.locator('h2')).toHaveText(/Flights/);
});
