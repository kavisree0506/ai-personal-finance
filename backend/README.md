# AI Personal Finance Backend

Quick FastAPI backend scaffold:

- JWT-based auth helpers (registration + login)
- SQLite (SQLModel) persistence
- Basic endpoints for expenses and goals
- AI advisor endpoint which proxies to OpenAI Chat Completions

Setup

1. Create a Python virtualenv and install dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Copy `backend/.env.example` to `backend/.env` and fill values (especially `SECRET_KEY` and `OPENAI_API_KEY`).

   Example:
   ```env
   OPENAI_API_KEY=your-openai-api-key
   ```

3. Run the app:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Notes

- This scaffold is intentionally minimal and focuses on structure. Improve token extraction and request dependencies for production (use `OAuth2PasswordBearer`).
- The AI endpoint forwards to OpenAI; ensure your `OPENAI_API_KEY` is set.
