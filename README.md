# Vajjha Recipes Book

A personal recipe journal with a warm editorial design.

## Stack
- React 18.3 + Vite 5 + Tailwind CSS 3
- Java 25 + Spring Boot 4.0.6 + Spring Data JPA
- Neon PostgreSQL
- Vercel frontend + Render API

## Local development
1. Install Java 25, Maven 3.9+, and Node.js 20+.
2. Set backend environment variables: `DATABASE_URL` (JDBC PostgreSQL URL), `APP_ACCESS_KEY` (private key), and `FRONTEND_ORIGIN=http://localhost:5173`.
3. Start API: `cd backend && mvn spring-boot:run`.
4. Start UI: `cd frontend && npm install && npm run dev`.
5. Open the Vite URL and enter the same access key configured on the API.

The backend validates the existing Neon schema at startup (`ddl-auto: validate`); it will not rewrite production tables.

## Deployment
### Render API
Create a Docker web service from this repository, branch `main`, region Singapore, Docker context `backend`, Dockerfile `backend/Dockerfile`. Configure `DATABASE_URL` (JDBC URL beginning `jdbc:postgresql://`), `APP_ACCESS_KEY`, and `FRONTEND_ORIGIN`. Health endpoint: `/api/health`.

### Vercel frontend
Root Directory: `frontend`; Framework: Vite; Build: `npm run build`; Output: `dist`. Set `VITE_API_URL` to the Render API origin.

## API
- `GET /api/health` — public health check
- `GET /api/categories`
- `GET /api/recipes?q=&categoryId=&favorites=`
- `POST /api/recipes`, `GET /api/recipes/{id}`, `PUT /api/recipes/{id}`, `DELETE /api/recipes/{id}`
- `PATCH /api/recipes/{id}/favorite`

All endpoints except health require `X-APP-KEY`. The frontend keeps the key only in the current browser session. Never commit database credentials or the access key.
