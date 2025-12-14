from passlib.hash import bcrypt
from jose import jwt
from datetime import datetime, timedelta, timezone
from models.user import User
from core.config import SECRET_KEY, ENCRYPTION_KEY
from cryptography.fernet import Fernet

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

def hash_password(password: str):
    hashed_password = bcrypt.hash(password)
    return hashed_password

def check_password(hashed_password: str, password: str):
    check = bcrypt.verify(password, hashed_password)
    return check

def generate_token(user: User):
    print(user)
    payload = {
        "user_id": str(user.user_id),
        "email": user.email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def encrypt_data(data: str | bytes, key: str = ENCRYPTION_KEY) -> str:
    """
    Encrypt any type (str or bytes) and return a STRING
    """
    f = Fernet(key.encode())

    if isinstance(data, str):
        data = data.encode()
        
    encrypted_bytes = f.encrypt(data)
    
    return encrypted_bytes.decode()

def decrypt_data(data: str | bytes, key: str = ENCRYPTION_KEY) -> str:
    """
    Decrypt any type (str or bytes) and return a STRING
    """
    f = Fernet(key.encode())
    if isinstance(data, str):
        data = data.encode()

    decrypted_byes = f.decrypt(data)

    return decrypted_byes.decode()    