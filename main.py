from fastapi import FastAPI
from routers import users, reports, chatbot

app = FastAPI()

# Register routers
app.include_router(users.router)
app.include_router(reports.router)
app.include_router(chatbot.router)  