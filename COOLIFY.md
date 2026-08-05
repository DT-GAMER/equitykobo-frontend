# EquityKobo Frontend Coolify Deployment

Deploy this repository as a Docker Compose app in Coolify using:

```text
docker-compose.coolify.yml
```

The frontend is a Vite React app. `VITE_API_BASE_URL` is baked into the static build, so set it before building.

## Required Environment Variable

```env
VITE_API_BASE_URL=https://your-equitykobo-api-domain.com
```

Use the public HTTPS URL of the deployed backend API, not `localhost`.

## Backend CORS

The backend must allow this frontend domain:

```env
CORS_ORIGINS=https://your-frontend-domain.com
```

If you keep local development enabled too:

```env
CORS_ORIGINS=https://your-frontend-domain.com,http://localhost:5173,http://127.0.0.1:5173
```

## What The Container Does

```text
1. installs dependencies with npm ci
2. builds the Vite app with npm run build
3. serves dist/ with Nginx
4. supports direct refresh on routes like /company/GTCO
5. exposes port 80
```

## Post-Deploy Check

After deployment:

```text
1. open the frontend URL
2. sign in
3. open /app
4. open a company route like /company/GTCO
5. confirm browser network requests go to VITE_API_BASE_URL
```
