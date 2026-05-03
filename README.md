# Online Book Review Application

I have completed the development of your Online Book Review application. The project is implemented as a full-stack application using Node.js/Express for the backend and React/Vite for the frontend.

## Key Features Implemented:
- **RESTful API:** A complete set of endpoints for managing books and reviews.
- **Authentication:** Secure user registration and login using JWT (JSON Web Tokens) and Express Sessions. Passwords are encrypted using `bcryptjs`.
- **Book Catalog:** Preloaded with the 10 books specified in the project database.
- **Search Engine:** Advanced searching by ISBN, Author, or Title.
- **Review Management:** Logged-in users can add, modify, and delete their own book reviews.
- **Async Patterns:** All data retrieval methods leverage Async/Await and Promises with Axios to ensure non-blocking performance (satisfying Task 10).
- **Modern UI:** A polished, responsive frontend built with Tailwind CSS, Lucide icons, and Framer Motion for smooth transitions.

## Project Structure & Tasks:
- **Task 1-5 (Public Access):** Endpoints available at `/api/`, `/api/isbn/:isbn`, `/api/author/:author`, `/api/title/:title`, and `/api/review/:isbn`.
- **Task 6-7 (User Auth):** endpoints at `/api/register` and `/api/login`.
- **Task 8-9 (Protected Review CRUD):** Protected endpoints at `/api/auth/review/:isbn` using a session-based JWT verification middleware.
- **Task 10 (Axios Implementation):** Located in `src/services/apiService.ts`, implementing all four required retrieval methods with async/await and `.then()`/`.catch()` promise chains.

## How to use:
1. **Browse:** View all books on the home screen.
2. **Search:** Use the sidebar to search by ISBN, Author, or Title.
3. **Participate:** Register an account and log in to leave reviews for your favorite books.
4. **Manage:** Edit or delete your reviews directly from the book detail view.

The application is fully compiled and running on port 3000. You can now use the frontend to test all functionality or interact with the API via cURL/Postman as per your evaluation requirements.

## GitHub Repository
[BrianGator/Book-Review-Web-App-w-Node.JS-Express.JS](https://github.com/BrianGator/Book-Review-Web-App-w-Node.JS-Express.JS/)

## Development
To start the application in development mode:
```bash
npm run dev
```
