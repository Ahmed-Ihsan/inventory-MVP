# Inventory Management System — AGENTS.md

## Project Overview

Full-stack inventory system: **FastAPI + SQLAlchemy** backend (port 8000) and **React** frontend (port 3000). Supports item catalog, stock tracking, purchases/sales, installment plans with payment tracking, barcode scanning, alerts, and Arabic/English i18n with RTL. Runs via Docker (nginx + supervisor, port 80) or locally.

## Dev Environment

**Local backend:**
```bash
cd backend
python -m venv venv; .\venv\Scripts\activate  # PowerShell
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
pytest -v  # 79 tests
```

**Local frontend:**
```bash
cd frontend
npm install
npm start        # dev server on :3000
npm run build    # production build
npm run format        # format with Prettier
npm run format:check  # check formatting without writing
```

**Docker:**
```bash
docker-compose up --build   # :80 frontend, :8000 backend
docker-compose down
```

## Code Style & Conventions

- **Backend**: FastAPI routers in `app/routers/`, Pydantic schemas in `app/schemas/`, business logic in `app/services/`. Use `get_db()` dependency injection for sessions. All endpoints decorated with `@router.get/post/put/delete`. Format with Ruff.
- **Frontend**: React 19, function components with hooks. Pages in `pages/`, shared UI in `components/common/`, state in `context/`, API calls through `services/apiService.js`. Format with Prettier (singleQuote, trailingComma es5, printWidth 100 - see .prettierrc). i18n keys in `locales/{ar,en}.json`.
- **Naming**: Python — `snake_case` for functions/vars, `PascalCase` for models/schemas. JS — `camelCase` for functions/vars, `PascalCase` for components/files.
- **Auth**: JWT token in `Authorization: Bearer <token>` header. Use `get_current_user()` from `utils/dependencies.py` for protected routes.

## Testing

```bash
# Backend (pytest)
cd backend
pytest -v                          # all tests
pytest app/tests/test_auth.py -v   # single file

# Frontend
cd frontend
npm test                           # react-scripts test (Jest + React Testing Library)
npm run format:check              # check formatting without writing
```

## API Architecture

All REST endpoints under prefixes. Auth optional for most; `scanning/` requires JWT. Full reference in `docs/backend-api-documentation.md`.

| Module | Prefix | Key Endpoints |
|--------|--------|--------------|
| Auth | `/auth/` | `POST /register`, `POST /login` |
| Items | `/items/` | CRUD + filter by `?name=&sku=&category_id=` |
| Categories | `/categories/` | CRUD |
| Stock | `/stock/` | `GET /levels`, `POST /movement`, `GET /movements` | Frontend Stock page is tabbed with 3 sub-views: StockLevels, StockMovements, StockTracking |
| Purchases | `/purchases/` | CRUD + `GET /summary` + payment endpoints |
| Sales | `/sales-invoices/` | CRUD + `GET /summary` (deducts stock) |
| Installments | `/installment-sales/` | CRUD + payments, receipts, refunds, CSV export |
| Barcode | `/scanning/` | `POST /scan` (image upload, auth required) |
| Alerts | `/alerts/` | CRUD |
| Notifications | `/notifications/` | `GET /`, check due/overdue, mark read |

Auth flow: `POST /auth/login` returns `{"access_token": "...", "token_type": "bearer"}`. Token expiry: 30 min (configurable in `app/config.py`).

## Frontend Route Map

| Path | Component | Protected | Description |
|------|-----------|-----------|-------------|
| `/login` | Login | No | Authentication page |
| `/` | Dashboard | Yes | Main dashboard with stats |
| `/purchases` | Purchases | Yes | Purchase management |
| `/sales-invoice` | SalesInvoice | Yes | Sales invoice creation |
| `/quick-invoice` | QuickInvoice | Yes | Quick invoice entry |
| `/installment-sales` | InstallmentSales | Yes | Installment plan creation |
| `/installment-sales/list` | InstallmentSalesList | Yes | Installment plans list |
| `/items` | ItemCatalog | Yes | Item catalog view |
| `/items/new` | AddItem | Yes | Add new item |
| `/items/edit/:id` | EditItem | Yes | Edit existing item |
| `/categories` | Categories | Yes | Category management |
| `/stock` | Stock | Yes | Stock management (tabbed: Levels, Movements, Tracking) |
| `/alerts` | Alerts | Yes | Alert management |
| `/notifications` | Notifications | Yes | Notification center |
| `/scan` | Scanning | Yes | Barcode scanning |

## Boundaries (Hard Rules)

- **NEVER** commit `.env`, `inventory.db`, `test.db`, `venv/`, `node_modules/`, `__pycache__/`, `.pytest_cache/`, `.ruff_cache/`
- **NEVER** change `SECRET_KEY` or `DATABASE_URL` in `app/config.py` without flagging it
- **ALWAYS** run `pytest -v` before completing backend changes
- **ALWAYS** update `docs/backend-api-documentation.md` when modifying endpoints
- **ALWAYS** keep `ar.json` and `en.json` translation keys in sync (197 keys each)
- **CONSULT** `docs/` for feature specs before implementing: `features.md`, `backend-architecture.md`, `frontend-documentation.md`, `alerts-implementation.md`

## Project Structure

```
backend/              # FastAPI app
├── app/
│   ├── main.py          # App entry point
│   ├── config.py        # Settings (DB, JWT)
│   ├── database.py      # SQLAlchemy engine/session
│   ├── models/          # SQLAlchemy ORM models
│   ├── routers/         # API route handlers
│   ├── schemas/         # Pydantic request/response
│   ├── services/        # Business logic layer
│   └── tests/           # pytest test files
├── alembic/             # DB migrations
├── requirements.txt
└── data/                # SQLite files (Docker volume)

frontend/              # React app
├── src/
│   ├── App.js           # Router + providers
│   ├── index.js         # Entry point (imports i18n, renders App)
│   ├── pages/           # 16 route pages (3 stock tab sub-components: StockLevels, StockMovements, StockTracking)
│   ├── components/      # Reusable UI (auth, common, layout, etc.)
│   ├── context/         # Auth, Theme, Toast providers
│   ├── services/        # apiService.js (all API calls)
│   ├── hooks/           # Custom hooks
│   ├── locales/         # ar.json, en.json
│   ├── styles/          # CSS files
│   ├── setupTests.js    # Test setup (imports @testing-library/jest-dom)
│   ├── reportWebVitals.js # CRA boilerplate
│   └── index.css        # CRA body styles
├── public/
└── package.json

docker/                # Docker config files
├── Dockerfile
├── nginx.conf
└── supervisord.conf

docs/                  # Project documentation
└── *.md               # Feature specs, API docs, architecture guides
```
