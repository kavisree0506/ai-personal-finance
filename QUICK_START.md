# FinAdvisor - Quick Start Guide

## ⚡ 30-Second Setup

### 1. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 2. Install & Run Backend
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Install & Run Frontend (new terminal)
```bash
npm install
npm run dev
```

### 4. Access App
Open: **http://localhost:5173**

---

## 🧪 Quick Tests

### Test 1: Register & Login (1 min)
1. Click "Get Started"
2. Email: `test@example.com`, Password: `test123`
3. Should land on Dashboard

### Test 2: Add Expense (30 sec)
1. Sidebar → Expenses
2. Click "Food & Dining" 
3. Amount: `₹500`, Description: `Lunch`
4. Click "Add Expense"
5. ✅ Should appear in Recent Expenses list

### Test 3: AI Advisor (2 min, requires OpenAI key)
1. Sidebar → AI Advisor
2. Ask: "How can I save more?"
3. ✅ Should get real financial advice in 2-3 seconds

### Test 4: Create Goal (30 sec)
1. Sidebar → Goals
2. Title: `Emergency Fund`, Target: `₹50,000`
3. ✅ Should appear with 0% progress

---

## 📊 Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/register` | Create account |
| POST | `/login` | Login (returns token) |
| GET | `/expenses?user_id={id}` | List expenses |
| POST | `/expenses` | Add expense |
| GET | `/goals?user_id={id}` | List goals |
| POST | `/ai/advice` | Get AI advice |
| GET | `/health` | Check server status |

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8000 already in use | `netstat -ano \| findstr :8000` then kill process |
| Port 5173 already in use | Change in vite.config.ts or kill process |
| CORS errors | Verify FRONTEND_ORIGIN in .env |
| "Unauthorized" on API calls | Make sure token is in localStorage |
| AI Advisor fails | Check OPENAI_API_KEY is set in .env |
| Database errors | Delete `finance.db` and restart server |
| TypeScript errors | Run `npm run build` to see issues |

---

## 📁 Important Files

- **Frontend API**: `src/api.ts` - All backend calls
- **Backend API**: `backend/app/main.py` - All endpoints
- **Database Models**: `backend/app/models.py` - Schema
- **Config**: `backend/.env` - Environment variables
- **Frontend Entry**: `src/main.tsx`
- **Backend Entry**: `backend/app/main.py`

---

## 🔑 Environment Variables

```env
# Backend config (backend/.env)
OPENAI_API_KEY=sk-...              # Required for AI
SECRET_KEY=your-secret             # For JWT signing
DATABASE_URL=sqlite:///./finance.db
FRONTEND_ORIGIN=http://localhost:5173
LOG_LEVEL=DEBUG

# Frontend (automatic, no config needed)
VITE_API_URL=http://localhost:8000
```

---

## 💡 Architecture Overview

```
User Browser
    ↓
React App (localhost:5173)
    ↓ [src/api.ts - centralized]
FastAPI Backend (localhost:8000)
    ↓ [SQLModel ORM]
SQLite Database (./finance.db)

For AI:
FastAPI Backend
    ↓ [httpx async client]
OpenAI API (gpt-4o-mini)
```

---

## ✅ What Was Fixed

1. ✅ API calls now use proper JSON bodies (not query params)
2. ✅ Errors standardized and reported properly
3. ✅ Loading states reset on success/error
4. ✅ Centralized API service (no duplicate code)
5. ✅ Full TypeScript type safety
6. ✅ Real OpenAI integration with error handling
7. ✅ Comprehensive logging throughout
8. ✅ Database relationships configured
9. ✅ CORS middleware enabled
10. ✅ JWT authentication working end-to-end

---

## 📝 Logging

**Frontend Console:**
```
[ExpenseTracking] Fetching expenses...
[ExpenseTracking] Expenses loaded: 3
[AIAdvisor] Sending question to AI: How can I save more?
[AIAdvisor] AI response received
```

**Backend Console:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
2024-01-15 14:32:01 - app.crud - INFO - [crud.py:45] - User 5 expenses fetched
2024-01-15 14:33:12 - app.ai - DEBUG - [ai.py:62] - Calling OpenAI API
```

**Backend Error Log:**
```
cat logs/error_20240115.log
```

---

## 🚀 Next Steps

1. **Test the app** - Follow Quick Tests above
2. **Review code** - Check `src/api.ts` and `backend/app/main.py`
3. **Add features** - Use existing patterns for new endpoints
4. **Deploy** - See IMPLEMENTATION_GUIDE.md for production setup

---

**Questions?** Check the full IMPLEMENTATION_GUIDE.md for detailed docs!
