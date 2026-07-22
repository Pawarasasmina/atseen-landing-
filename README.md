# @seen pre-launch

A production-oriented MERN pre-launch website for collecting creator interest and managing those leads through a private admin area. The public experience is strictly SFW, responsive, and uses the @seen dark editorial design language. Dashboard data is always read from MongoDB—there is no mock data or public admin registration.

## Stack

- React 19, Vite, Tailwind CSS, React Router, Axios, Framer Motion, React Hook Form, Zod, Lucide and React Hot Toast
- Node.js, Express 5, MongoDB Atlas/Mongoose, JWT HttpOnly cookies, bcryptjs, Helmet, CORS, rate limiting and express-validator

## Structure

```text
atseen-prelaunch/
├── frontend/          React application and production build
├── backend/           Express API, models, routes, controllers and seed script
├── package.json       Workspace convenience scripts
└── README.md
```

The backend is organized into `config`, `controllers`, `middleware`, `models`, `routes`, `scripts`, `services`, and `utils`. The frontend uses page, component, context and library modules.

## Prerequisites

- Node.js 20 or a newer stable LTS version
- npm 10+
- A MongoDB Atlas project and database user

## Local setup (Windows PowerShell)

```powershell
cd "D:\360\atseen landing page\atseen-prelaunch"
npm install
npm run install:all
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Edit `backend\.env` and provide real values. During local development, `frontend\.env` can keep `VITE_API_URL=http://localhost:5000/api`.

Run both applications:

```powershell
npm run dev
```

Or run them separately with `npm run backend` and `npm run frontend`. The website is at `http://localhost:5173`; the API is at `http://localhost:5000`.

## MongoDB Atlas

1. Create an Atlas project and cluster.
2. Under Database Access, create a least-privilege database user.
3. Under Network Access, allow the IP of the local computer and, later, the cPanel server. Avoid `0.0.0.0/0` where a fixed server address is available.
4. Copy the Node.js connection string, insert the encoded username/password, and set it as `MONGODB_URI`.
5. Use a database name such as `atseen_prelaunch` in the URI.

## Environment variables

Backend values that must be set manually:

- `MONGODB_URI`: real Atlas connection string
- `JWT_SECRET`: long cryptographically random secret (at least 32 random bytes)
- `IP_HASH_SECRET`: a different long random secret
- `CLIENT_URL`: `http://localhost:5173` locally; `https://atseen.com` in production
- `NODE_ENV`: `development` locally and `production` on cPanel
- `COOKIE_NAME`, `JWT_EXPIRES_IN`, and the host-provided `PORT`
- `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` only while creating/updating an admin

Never prefix server secrets with `VITE_`. Vite values are public in the browser bundle. Do not commit `.env` files.

## Create the first admin

After configuring `backend\.env` and Atlas:

```powershell
cd backend
$env:ADMIN_NAME="Administrator"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="replace-with-a-strong-password"
npm run create-admin
```

The password must contain at least 8 characters. The script never prints it. If the email already exists, it makes no changes. A longer, randomly generated password is strongly recommended. To deliberately change the password:

```powershell
$env:ADMIN_FORCE_UPDATE="true"
npm run create-admin
Remove-Item Env:ADMIN_FORCE_UPDATE
```

Clear temporary admin environment variables from the shell after use. Production credentials must not use the placeholder values above.

## Build and production serving

```powershell
cd "D:\360\atseen landing page\atseen-prelaunch"
npm run build
$env:NODE_ENV="production"
npm run start --prefix backend
```

The frontend build is emitted to `frontend/dist`. In production, Express serves that directory and sends non-API routes to `index.html`, preserving React Router refreshes. API routes remain under `/api`. For same-domain production, either omit `VITE_API_URL` before building or set it to `/api`.

## cPanel Node.js deployment

1. Build the frontend locally with `npm run build`.
2. Upload or clone the entire `atseen-prelaunch` folder, including `frontend/dist` (normally ignored by Git, so upload the built folder separately if deploying from Git).
3. In cPanel **Setup Node.js App**, choose the newest supported stable Node.js version.
4. Set **Application root** to the uploaded `atseen-prelaunch` folder.
5. Set **Application startup file** to `backend/server.js`.
6. Set `NODE_ENV=production`, the real `MONGODB_URI`, strong `JWT_SECRET` and `IP_HASH_SECRET`, `CLIENT_URL=https://atseen.com`, `COOKIE_NAME=atseen_admin`, and `JWT_EXPIRES_IN=2h`. cPanel supplies `PORT`.
7. Run `npm install` at the project root, then `npm run install:all`. Some cPanel interfaces require entering the backend directory and running `npm install` there separately.
8. Temporarily configure the three `ADMIN_*` values and run `npm run create-admin --prefix backend`; then remove `ADMIN_PASSWORD` from the application environment.
9. Restart the Node.js application.
10. Verify `https://atseen.com/api/health`, then `/`, then `/admin/login`.

The application uses same-origin cookies in production. Ensure the domain’s SSL certificate is active, the app is mounted at the domain root, and Atlas Network Access permits the cPanel server’s outbound IP. If cPanel’s Passenger integration requires a root-level startup file, point it to `backend/server.js`; the Express app is also exported by `backend/app.js` and `backend/server.js`.

## API summary

| Method | Path | Access |
|---|---|---|
| GET | `/api/health` | Public |
| POST | `/api/leads` | Public, rate limited |
| POST | `/api/admin/auth/login` | Public, strict rate limit |
| GET | `/api/admin/auth/me` | Admin cookie |
| POST | `/api/admin/auth/logout` | Admin cookie |
| GET | `/api/admin/leads` | Admin cookie |
| GET | `/api/admin/leads/:id` | Admin cookie |
| PATCH | `/api/admin/leads/:id/status` | Admin cookie |
| PATCH | `/api/admin/leads/:id/notes` | Admin cookie |
| DELETE | `/api/admin/leads/:id` | Admin cookie |
| GET | `/api/admin/dashboard/stats` | Admin cookie |

Lead list parameters are `page`, `limit` (maximum 100), `search`, `status`, `category`, `country`, `dateFrom`, `dateTo`, and `sort`. Default sorting is newest first.

## Security notes

Admin JWTs are short-lived and stored only in HttpOnly, Secure-in-production, SameSite=Lax cookies. Authentication never trusts a browser-supplied role. Passwords are bcrypt hashes. Public and login routes are rate limited; requests have 100 KB limits; input is allow-listed and validated; MongoDB IDs and filters are validated; IP addresses are retained only as a keyed one-way hash. Public duplicate submissions within 24 hours receive the same success response. Internal notes are only returned by protected endpoints.

The legal dialogs are explicitly marked placeholders and require counsel review before launch. For higher-assurance CSRF protection in a future cross-site architecture, add a synchronizer token; the intended production configuration is HTTPS, one domain, SameSite cookies and strict CORS.

## Checks and troubleshooting

```powershell
npm run build
npm run lint --prefix frontend
npm run check --prefix backend
```

- **Database connection failed:** verify `MONGODB_URI`, percent-encode password characters, check the Atlas user and allow the server IP.
- **CORS error:** make `CLIENT_URL` exactly match the browser origin, including scheme and port.
- **Login immediately expires:** use HTTPS in production, verify `JWT_SECRET` is stable across restarts, and proxy the application at the same domain.
- **Frontend route returns 404:** confirm `NODE_ENV=production`, `frontend/dist/index.html` exists, and the startup file is `backend/server.js`.
- **Empty dashboard:** create a real lead through the public form; the dashboard intentionally never invents values.

Database-backed integration testing requires a reachable `MONGODB_URI`. The health endpoint can respond only after the startup connection succeeds, by design.
