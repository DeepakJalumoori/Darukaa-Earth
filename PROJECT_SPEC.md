# Darukaa.Earth — Project Specification

## 1. Product Overview

What Darukaa.Earth is and what problem it solves.

## 2. Goals

What the MVP must accomplish.

## 3. User Roles

### Administrator

- Register/login
- Create projects
- Add sites
- View projects and sites
- View site analytics

## 4. Core User Flows

### Authentication

Register → Login → Dashboard

### Project Creation

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
