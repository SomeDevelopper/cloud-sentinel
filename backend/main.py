from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import ENVIRONMENT
from dotenv import load_dotenv
from db.database import engine
from models import Base
from api.v1 import auth, user, accounts, scan

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

allowed_origins = (['https://cloud-sentinel.herense.com'] if ENVIRONMENT == 'PRODUCTION' else ['http://localhost:5173'])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix='/v1/auth', tags=['auth'])
app.include_router(user.router, prefix='/v1/user', tags=['user'])
app.include_router(accounts.router, prefix='/v1/account', tags=['account'])
app.include_router(scan.router, prefix='/v1/scan', tags=['scan'])