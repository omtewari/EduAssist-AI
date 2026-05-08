# EduAssistAI Deployment Roadmap

## Architecture
- Frontend: Vercel (`frontend`)
- Backend API: Render Web Service (`backend`)
- Database: MongoDB Atlas
- PDF Storage: Cloudinary (raw files)

## Phase 1: Accounts and Services
1. Create/confirm Cloudinary account and get:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
2. Create/confirm MongoDB Atlas cluster and DB user (`MONGO_URI`).
3. Prepare backend secrets:
   - `JWT_SECRET`
   - `HF_API_KEY`
4. Confirm final frontend production domain (for backend CORS `CLIENT_ORIGIN`).

## Phase 2: Backend Deploy on Render
1. Push this repo to GitHub.
2. In Render:
   - Create a new **Web Service**
   - Use repo root with `render.yaml` (Blueprint) OR set manually:
     - Root Directory: `backend`
     - Build Command: `npm ci`
     - Start Command: `npm run start`
3. Add env vars from `backend/.env.example`.
4. Deploy and verify:
   - `GET /health` returns `{ "ok": true }`
   - API root works.
5. Copy backend URL:
   - Example: `https://eduassistai-backend.onrender.com`

## Phase 3: Frontend Deploy on Vercel
1. Import repo in Vercel.
2. Set project root to `frontend`.
3. Build settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add env var:
   - `VITE_API_URL=https://<your-render-url>/api`
5. Deploy and verify:
   - Login/signup works
   - Upload PDF works
   - Document processing endpoints resolve correctly

## Phase 4: Production Validation
1. Auth:
   - Signup, login, protected route access.
2. PDF flow:
   - Upload PDF
   - Confirm document saved in Cloudinary
   - Process status reaches `completed`
3. AI flow:
   - Summary generated
   - Flashcards and key topics generated
4. Delete flow:
   - Deleting a document removes DB data and Cloudinary file.

## Phase 5: Hardening (recommended)
1. Rotate and store secrets securely.
2. Restrict CORS to only your Vercel domain.
3. Add monitoring and logs in Render.
4. Add rate limiting + request size monitoring.
5. Add retry/failure dashboard for AI processing jobs.

## Notes
- Backend now uploads PDFs directly to Cloudinary and processes text from Cloudinary file URLs.
- Local disk uploads are no longer used in production flow.
