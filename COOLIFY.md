# EquityKobo Frontend Coolify Deployment

Deploy this repository in Coolify with the **Nixpacks** build pack.

The frontend is a Vite React app. `VITE_API_BASE_URL` is baked into the static build, so it must be set before Coolify builds the app.

## Required Environment Variable

```env
VITE_API_BASE_URL=https://your-equitykobo-api-domain.com
```

Use the public HTTPS URL of the deployed backend API, not `localhost`.

## Coolify Settings

Use:

```text
Build Pack: Nixpacks
Install Command: npm ci
Build Command: npm run build
Start Command: npm run start
Port / Exposed Port: 5173
Publish Directory: leave empty for Nixpacks server mode
```

The checked-in `nixpacks.toml` already defines these steps, so you should not need custom commands unless Coolify overrides them.

## Backend CORS

The backend must allow the final frontend domain:

```env
CORS_ORIGINS=https://your-frontend-domain.com
```

If you keep local development enabled too:

```env
CORS_ORIGINS=https://your-frontend-domain.com,http://localhost:5173,http://127.0.0.1:5173
```

## What Nixpacks Does

```text
1. uses Node 22
2. installs dependencies with npm ci
3. builds the Vite app with npm run build
4. serves the built dist folder through vite preview
5. listens on Coolify's PORT value, defaulted to 5173
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
