from pydantic import BaseModel, EmailStr
from typing import Optional, Generic, TypeVar

T = TypeVar('T')

class StandardResponse(BaseModel, Generic[T]):
    message: str
    data: Optional[T] = None

class UserCreate(BaseModel):
    email: str
    password: str
    firstname: str
    lastname: str
    entreprise: str

class UserResponseData(BaseModel):
    email: str
    firstname: str
    lastname: str
    entreprise: str
    is_active: bool

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenData(BaseModel):
    token: str
    token_type: str