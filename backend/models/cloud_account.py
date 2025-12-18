import uuid
import enum
from sqlalchemy import Column, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from db.database import Base
from sqlalchemy import func

class ScanStatusEnum(str, enum.Enum):
    PENDING = 'Pending'
    SUCCESS = 'Success'
    FAILED = 'Failed'

class CloudAccount(Base):
    __tablename__ = 'cloud_accounts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    account_name = Column(String, nullable=False)
    provider = Column(String, nullable=False, index=True)
    access_key_public = Column(String, nullable=False)
    tenant_id = Column(String, nullable=True)
    dek_encrypted = Column(String, nullable=False)
    cloud_secret_encrypted = Column(String, nullable=False)
    last_scan_status = Column(Enum(ScanStatusEnum), default=ScanStatusEnum.PENDING)
    last_scan_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User', back_populates='cloud_accounts')
    daily_costs = relationship("DailyCost", back_populates="account", cascade="all, delete-orphan")
    anomalies = relationship("Anomaly", back_populates="cloud_account")
    scan_results = relationship("ScanResult", back_populates="cloud_account")
    resource = relationship("CloudResource", back_populates="cloud_account")
