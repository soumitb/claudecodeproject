# Webapp — FastAPI + React

Full-stack application with a FastAPI backend and React (Vite) frontend.

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL running locally

### 1. Database setup

```bash
createdb webapp_db
```

### 2. Backend

```bash
cd backend

# Copy and fill in environment variables
cp .env.example .env
# Edit .env: set DATABASE_URL, SECRET_KEY, etc.

# Install dependencies
pip install -r requirements.txt

# Start the server (tables are created automatically on startup)
uvicorn app.main:app --reload
```

API docs available at http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend

npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

1. Navigate to http://localhost:5173
2. Click **Register** to create an account
3. **Login** with your credentials
4. The **Dashboard** displays your account info

## Project Layout

```
webapp/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── config.py        # Settings from .env
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models/user.py   # User ORM model
│   │   ├── schemas/user.py  # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── auth.py      # /auth/register, /auth/login, /auth/me
│   │   │   └── users.py     # /users/me
│   │   └── core/
│   │       ├── security.py  # Password hashing + JWT
│   │       └── deps.py      # get_current_user dependency
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/client.js        # Axios with auth header
    │   ├── pages/               # Login, Register, Dashboard
    │   └── components/          # PrivateRoute
    ├── package.json
    └── vite.config.js           # Proxies /api -> localhost:8000
```
