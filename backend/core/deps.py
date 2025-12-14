from sqlalchemy.orm import Session, load_only
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from db.database import get_db
from core.config import SECRET_KEY, ENCRYPTION_TYPE
from typing import Annotated
from models.user import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/login")

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ENCRYPTION_TYPE])
        email: str = payload.get('email')
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalide Token"
            )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or Expired Token"
        )
    user = db.query(User).options(load_only(User.user_id, User.email, User.firstname)).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user