# Conexia / ScienceHub
Frontend web application for scientific publishing with a clean, McGraw-Hill–style interface using HTML, CSS, and JavaScript.

## Run the local backend
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the backend (serves the frontend too):
   ```bash
   npm start
   ```
3. Open the app at:
   ```
   http://127.0.0.1:5500/index.html
   ```

The backend provides:
- `GET /api/articles`
- `POST /api/articles`
- `GET /api/ebooks`
- `POST /api/ebooks`

Uploads are stored in `uploads/` and served from `/uploads/...`.
