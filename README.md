# Tshirt Store

Monorepo for a t-shirt storefront with three frontends and a Node/Express backend.

## Apps

- `backend`: Express API with MongoDB, Socket.IO, JWT auth, and Cloudinary uploads.
- `frontend-user`: customer-facing store for browsing products and placing orders.
- `frontend-admin`: admin panel for managing products, users, and orders.
- `frontend-warehouse`: warehouse dashboard for order fulfillment.

## Local Setup

### Backend

1. Install dependencies:
	```bash
	cd backend
	npm install
	```
2. Create a local `.env` file with the required backend secrets.
3. Start the API:
	```bash
	npm start
	```

### Frontends

Each frontend is a separate Vite app:

```bash
cd frontend-user
npm install
npm run build
```

Repeat for `frontend-admin` and `frontend-warehouse`.

## Environment Variables

### Backend

- `NODE_ENV`
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Frontends

- `VITE_API_URL` set to the Render backend URL.

## Deployment

### Render

- Backend service root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check: `/api/health/db`

### Netlify

Deploy each frontend from its own directory:

- `frontend-user`
- `frontend-admin`
- `frontend-warehouse`

Set `VITE_API_URL` for each site to the Render backend URL.

## Notes

- Firebase has been removed from all three frontends.
- API calls and Socket.IO connections now use the environment-driven backend URL.
- The backend health endpoint returns MongoDB connection status and collection counts.
