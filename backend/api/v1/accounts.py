from fastapi import APIRouter, Depends, HTTPException, status
from core.deps import get_current_user
from schemas.account import CloudAccountCreate, CloudAccountResponse
from schemas.user import StandardResponse
from models import User
from services.cloud_account_service import CloudAccountService
from services.aws_service import AwsService
from db.database import get_db
from sqlalchemy.orm import Session
from typing import List

router = APIRouter()

@router.post('/', response_model=StandardResponse[CloudAccountResponse])
def add_account(account_input: CloudAccountCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cloud_account_service = CloudAccountService(db=db)
    account_created = cloud_account_service.add_account(account_input=account_input, user_id=user.user_id)
    return StandardResponse(
        message="Account created successfully", 
        data=account_created
    )

@router.delete('/{account_id}', response_model=StandardResponse)
def delete_account(account_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cloud_account_service = CloudAccountService(db=db)
    cloud_account_service.delete_account(account_id=account_id, user_id=user.user_id)
    return StandardResponse(
        message="Account deleted successfully"
    )

@router.get('/', response_model=StandardResponse[List[CloudAccountResponse]])
def get_account(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cloud_account_service = CloudAccountService(db=db)
    account_list = cloud_account_service.get_user_accounts(user_id=user.user_id)
    return StandardResponse(
        message="User Account successfully retrived",
        data=account_list
    )

@router.get('/{account_id}/test_connection', response_model=StandardResponse)
def test_connection(account_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cloud_account_service = CloudAccountService(db=db)
    credentials_account = cloud_account_service.get_credentials_account(user_id=user.user_id, account_id=account_id)
    aws_service = AwsService(access_key=credentials_account['access_key_public'], secret_key=credentials_account['secret_key'], region='eu-west-3')
    try:
        account_info = aws_service.test_connectivity()
        clean_account_info = {
            "Account": account_info.get('Account'),
            "UserId": account_info.get('UserId'),
            "Arn": account_info.get("Arn"),
        }
        return StandardResponse(
            message="Account Information successfully retrived",
            data=clean_account_info
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        )