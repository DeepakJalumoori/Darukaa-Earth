# Darukaa-Earth Development Rules

## Project Context

Darukaa.Earth is a full-stack geospatial data analytics platform.

Frontend:

- React
- TypeScript
- Vite
- Mapbox GL JS
- Mapbox Draw
- Chart.js

Backend:

- Python
- FastAPI

Database:

- PostgreSQL
- PostGIS

## Development Rules

1. Read PROJECT_SPEC.md before implementing major features.

2. Do not introduce unnecessary technologies.

3. Prefer simple, maintainable architecture over premature abstraction.

4. Do not rewrite unrelated files.

5. Do not delete existing working functionality without explaining why.

6. Never hardcode secrets or API keys.

7. Use environment variables for configuration.

8. Validate all API input.

9. Use proper HTTP status codes.

10. Write tests for backend functionality.

11. Run tests after significant backend changes.

12. Use TypeScript types instead of `any` where practical.

13. Use PostGIS for geospatial operations.

14. Use GeoJSON for communication between Mapbox and the API.

15. Keep synthetic analytics data clearly documented.

16. Do not claim a feature works unless it has been tested.

17. Before finishing a task, inspect the git diff.

18. Make small, focused changes.

19. Preserve existing API contracts unless the change is intentional.

20. If a major architectural decision needs to change, explain the reason before implementing it.

## AI Agent Behavior

Before coding:

- Understand the existing architecture.
- Identify the relevant files.
- Explain the implementation plan.

While coding:

- Make the smallest reasonable change.
- Follow existing project conventions.
- Avoid unnecessary dependencies.

After coding:

- Run relevant tests.
- Run linting/formatting where applicable.
- Verify the feature.
- Summarize changed files and important decisions.
