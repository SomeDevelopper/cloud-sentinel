from sqlalchemy import Integer, DateTime, Column, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import JSONB, UUID
import enum
from sqlalchemy.sql import func
from db.database import Base
from sqlalchemy.orm import relationship

class StatusEnum(str, enum.Enum):
    SUCCESS = 'SUCCESS'
    FAILED = 'FAILED'

class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    account_id = Column(UUID(as_uuid=True), ForeignKey('cloud_accounts.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(Enum(StatusEnum), default=StatusEnum.SUCCESS)
    raw_data = Column(JSONB, nullable=False)

    cloud_account = relationship("CloudAccount", back_populates='scan_results')
