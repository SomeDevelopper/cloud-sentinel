from pydantic import BaseModel
from typing import Optional, Dict, Any
from enum import Enum
from uuid import UUID
from datetime import datetime

class CloudProvider(str, Enum):
    AZURE = 'AZURE'
    AWS = 'AWS'
    GCP = 'GCP'


class CloudAccountCreate(BaseModel):
    account_name: str
    provider: CloudProvider
    access_key_public: str
    secret_key: str
    tenant_id: Optional[str] = None # for Azure

class CloudAccountResponse(BaseModel):
    id: UUID
    account_name: str
    provider: str
    access_key_public: str
    tenant_id: Optional[str] = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True

class CloudResourcesResponse(BaseModel):
    id: UUID
    cloud_account_id: UUID
    resource_type: str
    resource_id: str
    region: str
    detail: Dict[str, Any]

    class Config:
        from_attributes = True