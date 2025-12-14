from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from services.user_service import UserService
from fastapi.security import OAuth2PasswordRequestForm
from schemas.user import UserCreate, UserResponseData, UserLogin, StandardResponse

router = APIRouter()

@router.post('/register', response_model=StandardResponse[UserResponseData])
def register(user: UserCreate, db: Session = Depends(get_db)):
    user_service = UserService(db)
    
    new_user = user_service.create_user(user)

    return StandardResponse(
        message="User created successfully", 
        data=new_user
    )


@router.post('/login')
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user_service = UserService(db)
    user = UserLogin(email=form_data.username, password=form_data.password)
    token_data = user_service.authenticate_user(user)
    return {
        "access_token": token_data.token,
        "token_type": token_data.token_type
    }