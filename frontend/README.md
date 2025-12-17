# Frontend

React/TypeScript chat interface connecting to the Farmer Parcel Assistant backend.

## Setup

**Prerequisites:** Node.js 18+, npm

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env`
3. Set `VITE_API_URL`:
   - Local: `http://localhost:6777`
   - Production: `http://<ec2-server-ip>:6777`

## Run

- **Development**: `npm run dev` (runs on port from Vite config)
- **Build**: `npm run build` (outputs to `dist/`)
- **Preview**: `npm run preview` (serves production build)

## Features

- Phone authentication with 1-hour localStorage cache
- Real-time chat interface for parcel queries
- Generate reports button (calls `/generate-reports` endpoint)
- Mobile-responsive design with touch-friendly inputs

## Troubleshooting

- **Can't connect to backend**: Verify `VITE_API_URL` in `.env` matches running backend
- **Build fails**: Clear `node_modules` and `dist`, then `npm install` again
- **Port conflicts**: Change port in `vite.config.ts` or stop conflicting services
