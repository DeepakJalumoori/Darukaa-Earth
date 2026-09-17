# Darukaa.Earth — Project Specification

# Darukaa.Earth — Final MVP Specification

## 1. Product Overview

Darukaa.Earth is a full-stack, production-ready geospatial data analytics platform designed to manage and monitor environmental projects (Carbon Sequestration, Biodiversity, and Mixed Metrics). It enables organizations to map ecological sites, calculate total area, and visualize environmental KPIs over time.

What Darukaa.Earth is and what problem it solves.

## 2. Goals

The MVP is designed to prove end-to-end capabilities: secure authentication, relational tracking of projects/sites, robust geospatial querying via PostGIS, and modern, responsive frontend visualization via Mapbox and Chart.js.

What the MVP must accomplish.

## 3. User Roles

### Administrator

- Securely register and authenticate.
- Create and manage distinct environmental projects.
- Interactively draw geographical sites (polygons) on a map.
- View and analyze synthetic time-series environmental data per site.

- Register/login
- Create projects
- Add sites
- View projects and sites
- View site analytics

## 4. MVP Features

- **Auth:** JWT-based stateless authentication with `bcrypt` password hashing.
- **Project Management:** Project creation categorization (Carbon, Biodiversity, Mixed).
- **Geospatial Mapping:** Interactive site mapping and drawing using Mapbox GL JS and Mapbox Draw.
- **Spatial Processing:** PostGIS polygon storage, spatial indexing, and automated acreage calculations (hectares).
- **Data Analytics:** Automatic synthetic time-series data generation based on project types.
- **Data Visualization:** High-performance charting using Chart.js.

## 4. Core User Flows

## 5. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Mapbox GL JS, Chart.js, Axios.
- **Backend:** Python 3.11, FastAPI, SQLAlchemy (Sync), GeoAlchemy2, Pydantic, Passlib.
- **Database:** PostgreSQL 15 + PostGIS 3.3.
- **Code Quality:** Ruff, ESLint, Prettier, TypeScript `tsc`, Pytest, GitHub Actions.

### Authentication

## 6. Database Schema

- **`users`**: ID, email, hashed_password, created_at.
- **`projects`**: ID, user_id (FK), name, description, project_type, created_at.
- **`sites`**: ID, project_id (FK), name, geometry (Geometry(Polygon, 4326)), area_hectares, created_at.
- **`site_analytics`**: ID, site_id (FK), recorded_date, carbon_sequestration_tons, biodiversity_index, ndvi, soil_moisture_pct, canopy_cover_pct.

Register → Login → Dashboard

## 7. Geospatial Implementation

- **Frontend:** Users draw boundaries using `mapbox-gl-draw`. The polygon is extracted as standard GeoJSON (`FeatureCollection -> Feature -> Polygon`).
- **Backend/DB:** FastAPI receives the GeoJSON payload. Using `func.ST_GeomFromGeoJSON` and `GeoAlchemy2`, it is cast into a PostGIS `Geometry` type (SRID 4326).
- **Area Calculation:** The area is calculated natively on the database layer during insertion using `func.ST_Area(cast(geom_expr, Geography)) / 10000.0` to yield highly accurate hectares.

### Project Creation

## 8. Analytics (Synthetic Data)

To fulfill the hackathon requirements without complex external API dependencies (like Sentinel-2), analytics data is generated synthetically upon Site creation.

- **Carbon Projects:** Generates `carbon_sequestration_tons`, `ndvi`, `soil_moisture_pct`, `canopy_cover_pct`.
- **Biodiversity Projects:** Generates `biodiversity_index`, `ndvi`, `soil_moisture_pct`, `canopy_cover_pct`.
- **Mixed Projects:** Generates all fields.
  Data is plotted on a 12-month trailing scale to simulate seasonal changes.

Dashboard → Create Project → Project Details

### Site Creation

Project → Map → Draw Polygon → Save Site

### Site Analytics

Project → Click Site → Site Details → Analytics

## 5. MVP Features

- JWT authentication
- Project management
- Site management
- Interactive Mapbox map
- Polygon drawing
- PostGIS geometry storage
- Site analytics
- Interactive charts
- Responsive dashboard

## 6. Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Mapbox GL JS
- Mapbox Draw
- Chart.js

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT

### Database

- PostgreSQL
- PostGIS

### DevOps

- GitHub
- GitHub Actions
- Husky
- lint-staged
- Prettier
- ESLint
- Ruff
- Black
- pytest

### Deployment

- Vercel
- Render

## 7. Architecture

Describe:

React
↓
FastAPI
↓
SQLAlchemy
↓
PostgreSQL + PostGIS

## 8. Database Schema

Document:

User
Project
Site
SiteAnalytics

Include:

- fields
- relationships
- indexes
- PostGIS geometry

## 9. API Design

Document endpoints such as:

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

POST /api/projects
GET /api/projects
GET /api/projects/:id

POST /api/projects/:id/sites
GET /api/projects/:id/sites

GET /api/sites/:id
GET /api/sites/:id/analytics

## 10. Authentication

Explain JWT authentication and protected routes.

## 11. Geospatial Implementation

Explain:

- Mapbox GL JS
- Mapbox Draw
- GeoJSON
- PostGIS Polygon
- coordinate system
- area calculation

## 12. Analytics

Explain the analytics data.

If synthetic data is used, document:

- what it represents
- why it was chosen
- how it is generated

## 13. Frontend Structure

Document pages/components and their responsibilities.

## 14. Backend Structure

Document API routes, models, services, schemas, etc.

## 15. Validation & Error Handling

Explain how invalid requests, authentication failures,
missing resources, and invalid geometries are handled.

## 16. Testing Strategy

Document:

- backend tests
- API tests
- frontend checks
- end-to-end verification

## 17. Code Quality

Document:

- ESLint
- Prettier
- Husky
- lint-staged
- Ruff
- Black

## 18. CI/CD

Explain the GitHub Actions pipeline.

## 19. Deployment

Explain:

- frontend deployment
- backend deployment
- database
- environment variables

## 20. Important Trade-offs

Document why particular technologies and approaches
were chosen.

## 21. Future Improvements

Features intentionally left outside the 48-hour MVP.

## 9. CI/CD & Deployment

- **GitHub Actions:** Runs Pytest for backend routes and ESLint/TSC/Vite for frontend code on every push/PR to `main`.
- **Render:** Hosts the PostgreSQL+PostGIS database and the FastAPI python application.
- **Vercel:** Hosts the Vite SPA via global CDN. SPA routing is handled via a `vercel.json` rewrite rule.
