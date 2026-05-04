# Task 7: Login as a registered user
cURL Command:
curl -X POST -c cookie.txt -H "Content-Type: application/json" -d '{"username": "tester", "password": "password123"}' http://localhost:3000/login

Output:
{
  "message": "Customer successfully logged in"
}
