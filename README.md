# Medical APP — Smart Medical Assistant

A web-based medical assistant built with **FastAPI** + **Firebase** that lets patients upload medical images, chat with an AI assistant, and download diagnostic PDF reports.

---

## What I Learned

- **FastAPI** — building a REST API with async endpoints, routers, dependency injection, and auto-generated Swagger docs
- **SQLAlchemy ORM** — defining models (`User`, `MedicalReport`, `ChatHistory`), relationships, and querying a database without raw SQL
- **JWT Authentication** — securing endpoints with token-based auth using `python-jose` and `passlib`
- **Firebase Integration** — using Firebase Auth for user login/registration on the frontend
- **Jinja2 Templates** — serving HTML pages directly from FastAPI
- **PDF Generation** — creating downloadable medical reports with `reportlab`
- **Project Structure** — organizing a backend into routers, models, schemas, utils
- **CORS & Middleware** — configuring cross-origin requests for a web frontend
- **External API calls** — connecting to an AI chatbot service via HTTP requests

---

## Features

- 🔐 User registration & login (JWT + Firebase)
- 🖼️ Upload medical images for AI analysis
- 🤖 AI Chatbot — ask medical questions, get responses
- 📄 PDF report generation & download
- 📊 Dashboard — view full chat and report history
- 👨‍⚕️ Doctor dashboard view
- 📖 Swagger UI at `/docs`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI · Uvicorn |
| Database | SQLite · SQLAlchemy |
| Auth | JWT (`python-jose`) · Firebase Auth |
| Frontend | HTML · CSS · Vanilla JS |
| PDF | ReportLab |
| AI | External chatbot API |

---

## Run Locally

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Open **http://localhost:8000** — API docs at **http://localhost:8000/docs**

---

## Project Structure

```
├── main.py              # App entry point, routes, middleware
├── models.py            # SQLAlchemy models (User, Report, Chat)
├── schemas.py           # Pydantic request/response schemas
├── database.py          # DB connection & session
├── requirements.txt
├── routers/
│   ├── users.py         # Auth endpoints (register, login, JWT)
│   ├── reports.py       # Medical report CRUD
│   └── chatbot.py       # AI chat endpoint
├── utils/
│   ├── security.py      # Password hashing & JWT helpers
│   └── pdf_generator.py # PDF report builder
├── templates/           # Jinja2 HTML pages
└── static/              # CSS, JS, images
```
