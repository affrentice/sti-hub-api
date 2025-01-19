from contextlib import asynccontextmanager
from fastapi import FastAPI
from .api.forum.routes import router as forum_router
from .api.auth.routes import router as auth_router
from .core.database import engine
from sqlmodel import SQLModel
from app.core.config import get_settings

settings = get_settings()


app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.include_router(auth_router)
app.include_router(forum_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Community Management API"}
