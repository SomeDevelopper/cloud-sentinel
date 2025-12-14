from sqlalchemy.orm import Session
from core.security import hash_password, check_password, generate_token
from models.user import User
from fastapi import HTTPException, status
from schemas.user import TokenData, UserCreate, UserResponseData, UserLogin

class UserService():
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_in: UserCreate) -> UserResponseData:
        existing_user = self.db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        hashed_password = hash_password(user_in.password)
        new_user = User(
            email = user_in.email,
            firstname = user_in.firstname,
            lastname = user_in.lastname,
            entreprise = user_in.entreprise,
            hashed_password = hashed_password
        )
        try:
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            return new_user
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error during user creation :: {e}"
            )
        
        

    def authenticate_user(self, login_data: UserLogin) -> TokenData:
        user = self.db.query(User).filter(User.email == login_data.email).first()
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

        if not user:
            raise credentials_exception
        
        if not check_password(user.hashed_password, login_data.password):
            raise credentials_exception
        
        token = generate_token(user)
        user_authenticated = TokenData(token=token, token_type='bearer')
        return user_authenticated