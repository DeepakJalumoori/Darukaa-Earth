# Darukaa.Earth 🌍

**Darukaa.Earth** is a full-stack, production-ready geospatial data analytics platform designed to manage and monitor environmental projects (Carbon Sequestration, Biodiversity, and Mixed Metrics).

It features an interactive Mapbox-powered dashboard for drawing and monitoring geographical sites, alongside automated synthetic analytics generation and visualization.

## 🚀 Features

- **Project Management:** Create and track Carbon, Biodiversity, and Mixed environmental projects.
- **Geospatial Mapping:** Interactive site mapping and polygon drawing powered by Mapbox GL JS and PostGIS.
- **Automated Analytics:** Generates and tracks synthetic time-series data for environmental KPIs (CO2e, NDVI, Soil Moisture, Canopy Cover).
- **Data Visualization:** Rich, responsive charts using Chart.js.
- **Secure Authentication:** JWT-based authentication with bcrypt password hashing.

---

## 🛠 Tech Stack

### Frontend

- **React 19** + **TypeScript** (via Vite)
- **Tailwind CSS** (v4) for utility-first responsive styling
- **Mapbox GL JS** & **Mapbox Draw** for geospatial rendering
- **Chart.js** & **react-chartjs-2** for analytics visualization
- **Axios** (with JWT interceptors) for API communication
- **Lucide React** for iconography

### Backend

- **Python 3.11** + **FastAPI**
- **PostgreSQL** + **PostGIS** for robust spatial data handling
- **SQLAlchemy** (Sync) & **GeoAlchemy2** for ORM
- **Pydantic** for rigorous schema validation
- **Pytest** for automated backend testing

---

## 💻 Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Python](https://www.python.org/) (3.11+)
- [Docker](https://www.docker.com/) (for running PostgreSQL + PostGIS)
- A Mapbox Public Token (Create a free account at [Mapbox](https://www.mapbox.com/))

### 1. Database Setup

Start a local PostGIS database using Docker:

```bash
docker run --name darukaa-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=darukaa \
  -p 5432:5432 \
  -d postgis/postgis:15-3.3
```

### 2. Backend Setup

Navigate to the backend directory and configure your environment:

```bash
cd backend
python -m venv venv

# Activate venv (Windows)
.\venv\Scripts\activate
# Activate venv (Mac/Linux)
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/darukaa
SECRET_KEY=generate_a_random_secure_string_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:5173
```

Run the backend server:

```bash
uvicorn app.main:app --reload
```

The API documentation will be available at `http://localhost:8000/docs`.

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=/api
VITE_MAPBOX_TOKEN=your_mapbox_public_token_here
```

Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`. (Vite automatically proxies `/api` requests to your local backend).

---

## 🧪 Testing & Validation

### Backend

Run the backend test suite:

```bash
cd backend
pytest -v
```

Lint code with Ruff:

```bash
ruff check .
```

### Frontend

Check types and linting:

```bash
cd frontend
npm run typecheck
npm run lint
```

---

## 🌐 Deployment Configuration

This project is pre-configured for automated deployment to **Vercel** (Frontend) and **Render** (Backend).

### Render (Backend & Database)

A `render.yaml` blueprint is included in the root directory.

1. Connect your repository to [Render](https://render.com/).
2. Render will automatically detect the blueprint and provision:
   - A managed PostgreSQL instance (with PostGIS available).
   - A Python web service running FastAPI.
3. _Note:_ Ensure you set the `CORS_ORIGINS` environment variable in the Render dashboard to match your production frontend URL once deployed.

### Vercel (Frontend)

A `vercel.json` configuration is included in the `frontend/` directory.

1. Connect your repository to [Vercel](https://vercel.com/).
2. Set the Root Directory to `frontend`.
3. Add your `VITE_MAPBOX_TOKEN` and `VITE_API_URL` to the Environment Variables in the Vercel dashboard. (e.g. `VITE_API_URL=https://your-render-api-url.onrender.com/api`).
