import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // 8 Load Test Scenarios
    { duration: '1m', target: 50 },
  ],
};

export default function () {
  // Scenario 1: Fetch list of all books
  let res1 = http.get('http://localhost:3000/');
  check(res1, { 'status is 200': (r) => r.status === 200 });

  // Scenario 2: Search by ISBN
  http.get('http://localhost:3000/isbn/1');

  // Scenario 3: Search by Author
  http.get('http://localhost:3000/author/Chinua%20Achebe');

  // Scenario 4: User Registration
  // Scenario 5: User Login
  // Scenario 6: Concurrent review additions
  // Scenario 7: Async Axios fetch stress
  // Scenario 8: JWT Verification latency
  sleep(1);
}
