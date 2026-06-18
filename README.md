# InvenMS — Inventory & Order Management System

A production-ready full-stack SaaS dashboard for managing products, customers, orders, and inventory.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic v2 |
| Database | PostgreSQL 16 |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4 |
| UI | Radix UI primitives, Recharts, Sonner, TanStack Query |
| Containerization | Docker, Docker Compose |

---

## Features

- **Products** — CRUD with SKU uniqueness, price/stock validation, image URL, search & pagination
- **Customers** — CRUD with unique email validation
- **Orders** — 4-step wizard (customer → products → quantities → review), automatic stock deduction, status management (pending / completed / cancelled)
- **Inventory** — Stock level overview with color-coded status and progress bars
- **Dashboard** — Stats cards, monthly orders bar chart, stock distribution pie chart
- **Notifications** — Live low-stock alerts in header bell dropdown
- **Dark / Light mode** — Persisted via localStorage

---

## Local Development (Docker)

**Prerequisites:** Docker Desktop

```bash
# Clone the repo
git clone https://github.com/your-username/inventory-management-system.git
cd inventory-management-system

# Start all services
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

### Seed dummy data

```bash
docker cp backend/seed.py inventorymanagementsystem-backend-1:/app/seed.py
docker exec inventorymanagementsystem-backend-1 python seed.py
```

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config, database
│   │   ├── models/       # SQLAlchemy models
│   │   ├── repositories/ # DB queries
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── utils/        # Exceptions
│   ├── alembic/          # DB migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # UI components + layout
│   │   ├── hooks/        # useTheme
│   │   ├── pages/        # Dashboard, Products, Customers, Orders, Inventory
│   │   ├── services/     # Axios API calls
│   │   └── types/        # TypeScript interfaces
│   ├── Dockerfile
│   └── vercel.json
├── docker-compose.yml
└── render.yaml
```

---

## Deployment

### Database — Neon PostgreSQL

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the connection string (includes `?sslmode=require`)
3. Use it as `DATABASE_URL` in your backend environment

### Backend — Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo, set **Root Directory** to `backend`
4. Set environment variables:
   - `DATABASE_URL` — your Neon connection string
   - `ALLOWED_ORIGINS` — your Vercel frontend URL (e.g. `https://your-app.vercel.app`)
5. Render auto-detects `render.yaml` — click **Deploy**

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Set environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://invenms-backend.onrender.com`)
4. Click **Deploy**

---

## API Reference

Full interactive docs available at `/docs` (Swagger UI) when running locally.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products/` | List all products |
| POST | `/products/` | Create product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| GET | `/customers/` | List all customers |
| POST | `/customers/` | Create customer |
| GET | `/orders/` | List all orders |
| POST | `/orders/` | Create order (deducts stock) |
| PATCH | `/orders/{id}/status` | Update order status |
| GET | `/dashboard/stats` | Summary stats |
| GET | `/dashboard/monthly-orders` | Orders per month |
| GET | `/dashboard/stock-distribution` | Stock status counts |
| GET | `/health` | Health check |

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
```
