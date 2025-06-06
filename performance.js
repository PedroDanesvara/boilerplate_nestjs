import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = { vus: 20, duration: '20s' };

export default function () {
  // Login
  let login = http.post('http://localhost:3000/auth/signin', JSON.stringify({ email: 'admin@admin.com', password: '123456' }), { headers: { 'Content-Type': 'application/json' } });
  let token = JSON.parse(login.body).access_token;

  // Requisição autenticada
  let res = http.get('http://localhost:3000/company', { headers: { Authorization: `Bearer ${token}` } });
  check(res, { 'status 200': (r) => r.status === 200 });

  sleep(1);
}