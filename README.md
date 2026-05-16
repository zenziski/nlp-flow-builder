# NLP Flow Builder

A visual chatbot flow builder with NLP intent recognition. Build conversational flows using a drag-and-drop interface, test them in a real-time simulator, and integrate via REST API.

## Stack

- **Frontend** — React + Vite + Tailwind CSS
- **Backend** — NestJS + MongoDB
- **Auth** — JWT
- **Realtime** — Socket.IO

## Running locally

**With Docker (recommended)**

```bash
docker-compose up
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1
- Swagger docs: http://localhost:3000/api/docs

**Without Docker**

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

## Environment variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017` | MongoDB connection URI |
| `MONGODB_DB` | `nlp-flow-builder` | Database name |
| `JWT_SECRET` | — | Secret for signing tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `PORT` | `3000` | Server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed origins (comma-separated) |
| `SEED_ON_STARTUP` | `false` | Seed sample data on boot |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL |

## Deploying to Railway

Deploy the `backend` and `frontend` services separately. Set the following on the frontend service:

```
BACKEND_URL=https://<your-backend>.up.railway.app
VITE_API_URL=https://<your-backend>.up.railway.app
```
