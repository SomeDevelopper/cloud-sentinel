from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import ENVIRONMENT
from dotenv import load_dotenv
from db.database import engine
from models import Base

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

allowed_origins = (['https://cloud-sentinel.herense.com'] if ENVIRONMENT == 'PRODUCTION' else ['http://localhost:5173'])

app.add_middleware(
    CORSMiddleware,
    allowed_origins=allowed_origins,
    allow_methods=['*'],
    allow_headers=['*']
)