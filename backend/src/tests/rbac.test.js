(async function(){
  const base = process.env.TEST_API || 'http://localhost:4000/api';
  function log(title, ok){ console.log(title + ':', ok ? 'OK' : 'FAIL'); }

  try{
    // Admin login
    const adminLogin = await fetch(base + '/auth/login', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email: 'admin@skypakistan.test', password: 'password' }) });
    const adminRes = await adminLogin.json();
    if(!adminLogin.ok){ console.error('Admin login failed', adminRes); process.exit(1); }
    const adminToken = adminRes.token;
    log('Admin login', true);

    // Admin access to admin flights
    const flightsRes = await fetch(base + '/admin/flights', { headers: { Authorization: 'Bearer ' + adminToken } });
    log('Admin can access /admin/flights', flightsRes.ok);

    // Create a normal user via register
    const email = 'rbac-user@test.local';
    await fetch(base + '/auth/register', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email, password: 'password', name: 'RBAC User' }) });
    const login = await fetch(base + '/auth/login', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email, password: 'password' }) });
    const loginJson = await login.json();
    const userToken = loginJson.token;
    log('User login', !!userToken);

    // User tries to access admin route
    const userFlights = await fetch(base + '/admin/flights', { headers: { Authorization: 'Bearer ' + userToken } });
    log('Non-admin forbidden from /admin/flights', userFlights.status === 403);

    console.log('RBAC test completed');
  }catch(e){
    console.error('Test error', e);
    process.exit(1);
  }
})();
