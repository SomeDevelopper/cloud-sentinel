from fastapi import APIRouter
from fastapi import Depends
from core.deps import get_current_user
from models.user import User

router = APIRouter()

@router.get('/get_user')
def read_user(current_user: User = Depends(get_current_user)):
    return current_user