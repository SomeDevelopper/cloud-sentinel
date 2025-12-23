from sqlalchemy.orm import Session
from cryptography.fernet import Fernet
from models.cloud_account import CloudAccount
from models.resources import CloudResource
from schemas.account import CloudAccountCreate, CloudAccountResponse, CloudResourcesResponse
from sqlalchemy.orm import load_only
from cryptography.fernet import Fernet
from core.security import encrypt_data, decrypt_data
from uuid import UUID
from typing import List
from fastapi import HTTPException, status

class CloudAccountService():
    
    def __init__(self, db: Session):
        self.db = db

    def add_account(self, account_input: CloudAccountCreate, user_id: str) -> CloudAccountResponse:
        existing_cloud_account = self.db.query(CloudAccount).filter(CloudAccount.user_id == user_id,
                                                                    (CloudAccount.account_name == account_input.account_name) | (CloudAccount.access_key_public == account_input.access_key_public)
                                                                    ).first()
        if existing_cloud_account:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an account with this name or access key."
            )
        
        dek_key_bytes: bytes = Fernet.generate_key()
        f_dek = Fernet(dek_key_bytes)
        secret_encrypted_bytes: bytes = f_dek.encrypt(account_input.secret_key.encode())
        secret_encrypted_str: str = secret_encrypted_bytes.decode()
        dek_encrypted_str: str = encrypt_data(dek_key_bytes)
        new_cloud_account = CloudAccount(account_name=account_input.account_name,
                                            provider=account_input.provider,
                                            access_key_public=account_input.access_key_public,
                                            dek_encrypted=dek_encrypted_str,
                                            cloud_secret_encrypted=secret_encrypted_str,
                                            user_id=user_id)
        try:
            self.db.add(new_cloud_account)
            self.db.commit()
            self.db.refresh(new_cloud_account)
            return new_cloud_account
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error :: {e}"
            )
        
    def delete_account(self, account_id: UUID, user_id: UUID):
        account = self.db.query(CloudAccount).filter(CloudAccount.id == account_id, CloudAccount.user_id == user_id).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cloud Account not found"
            )
        try:
            self.db.delete(account)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error during cloud accound deletion :: {e}"
            )
        
    def get_user_accounts(self, user_id: UUID) -> List[CloudAccountResponse]:
        try:
            account_list = self.db.query(CloudAccount).filter(CloudAccount.user_id == user_id).all()
            return account_list
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Dabase error :: {e}"
            )

    def get_resources(self, account_id: UUID) -> List[CloudResourcesResponse]:
        try:
            resources = self.db.query(CloudResource).filter(CloudResource.cloud_account_id == account_id).all()
            return resources
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error :: {e}"
            )

    def get_credentials_account(self, user_id: UUID, account_id: UUID):
        account_credentials = self.db.query(CloudAccount)\
            .options(load_only(CloudAccount.access_key_public, CloudAccount.dek_encrypted, CloudAccount.cloud_secret_encrypted))\
            .filter(CloudAccount.id == account_id, CloudAccount.user_id == user_id).first()

        if not account_credentials:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cloud Account not found"
            )
        dek_decrypted: str = decrypt_data(account_credentials.dek_encrypted)
        secret_key_decrypted: str = decrypt_data(account_credentials.cloud_secret_encrypted, dek_decrypted)
        return {'access_key_public': account_credentials.access_key_public, 'secret_key': secret_key_decrypted}