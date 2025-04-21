<h1>Smart Medical Assistant</h1>

An intelligent medical assistant platform built with FastAPI and a modern frontend, designed to allow users to upload medical images, interact with a chatbot, and view/download diagnostic reports.

<h2>🚀 Features</h2>

-User Registration & Login (Token-based)

-Upload medical images for diagnosis

-Chatbot interface (text + optional image upload)

-PDF report generation and download

-User dashboard to view chat/report history

-Swagger (OpenAPI) documentation for backend endpoints

<h2>⚙️ Backend: FastAPI</h2>

<h3><b>Tech Stack:</b></h3>

-FastAPI

-PostgreSQL (or SQLite for dev)

-SQLAlchemy ORM

-JWT Authentication

-python-jose, python-multipart, passlib, etc.

<h3><b>To run backend:</b></h3>

-Install dependencies:

-pip install -r requirements.txt

<h3><b>Start the API server:</b></h3>

-uvicorn main:app --reload

<h3><b>Access docs:</b></h3>

http://127.0.0.1:8000/docs

<h2>🌐 Frontend: Web App</h2>

<h3><b>Tech Stack:</b></h3>

HTML + CSS (Tailwind optional)

Vanilla JS (or React if needed)

Axios or fetch for API calls

<h3><b>Pages:</b></h3>

index.html → Home screen with options (Upload / Chatbot)

chatbot.html → Chat interface with image upload

dashboard.html → View previous chats and reports

(Optional) upload.html → Image-only upload interface

<h3><b>How to Run:</b></h3>

-Open index.html in your browser (or host using a local server like VSCode Live Server)

Chatbot Example:

User enters message and selects image

JS script sends POST to /chatbot

Displays AI response

Optionally displays/downloads generated PDF

📂 Project Structure

.

├── backend/

│   ├── main.py

│   ├── models/

│   ├── routers/

│   ├── auth/

│   └── utils/

├── frontend/

│   ├── index.html

│   ├── chatbot.html

│   ├── dashboard.html

│   ├── style.css

│   └── script.js

└── README.md

<h2>🛠️ Installation Notes</h2>

<h3><b>Backend dependencies (Python):</b></h3>

pip install fastapi uvicorn sqlalchemy python-jose passlib[bcrypt] python-multipart

Frontend runs in browser — no framework required unless using React.

<h2>🧪 Testing Endpoints</h2>

You can test backend endpoints using:

-Swagger UI → http://127.0.0.1:8000/docs

-Postman

-curl

-Your frontend

-All request examples are documented in the FastAPI auto-generated docs.

<h2>✅ Future Ideas</h2>

-React-based frontend

-Full chat history with timestamps

-Admin panel

-Email PDF reports

-Deployment to Render / Vercel

