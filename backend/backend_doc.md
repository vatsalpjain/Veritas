# CodeCrafters Backend Documentation

> **Source of Truth** for backend API and system info. Frontend devs: read this before integrating.

---

## System Overview

| Item | Value |
|------|-------|
| Framework | FastAPI |
| Python | 3.13 |
| Package Manager | uv |
| Port | 8000 |
| Base URL | `http://localhost:8000` |

---

## Running the Backend

```bash
cd backend
uv sync              # Install dependencies
uv run python main.py   # Start server with hot reload
```

---

## API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check if server is running |

**Response:**
```json
{
  "status": "ok"
}
```

---

## Adding New Endpoints

All endpoints are defined in `app/main.py`. Example:

```python
@app.get("/your-endpoint")
async def your_endpoint():
    return {"message": "Hello"}

@app.post("/your-endpoint")
async def create_something(data: dict):
    return {"received": data}
```

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   └── main.py        # All API routes here
├── main.py            # Entry point (runs uvicorn)
├── pyproject.toml     # Dependencies
└── backend_doc.md     # This file
```

---

## Response Format Convention

All API responses should follow this pattern:

**Success:**
```json
{
  "data": { ... },
  "message": "optional success message"
}
```

**Error:**
```json
{
  "error": "error message",
  "detail": "optional details"
}
```

---

## CORS

CORS is enabled for all origins (`*`). Frontend can call API from any domain.

---

## Dependencies

Managed via `pyproject.toml`. Add new packages:

```bash
uv add package-name
```

Current dependencies:
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `pydantic-settings` - Settings management

---

## Notes for Frontend Integration

1. **Base URL**: `http://localhost:8000`
2. **Docs**: Visit `/docs` for interactive Swagger UI
3. **All endpoints return JSON**
4. **No authentication yet** - add if needed

---

## Changelog

| Date | Change |
|------|--------|
| Initial | Basic setup with health endpoint |

---

*Last updated: Auto-generated*
