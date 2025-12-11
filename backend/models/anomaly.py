# TABLE anomalies (
#     id SERIAL PRIMARY KEY,
#     account_id UUID FOREIGN KEY,
#     detected_at TIMESTAMP,
#     resource_id VARCHAR, -- ex: 'i-0123456789'
#     severity VARCHAR, -- 'LOW', 'MEDIUM', 'HIGH'
#     issue_type VARCHAR, -- 'ZOMBIE_DISK', 'IDLE_VM'
#     estimated_waste DECIMAL(10, 2), -- Argent perdu par mois
#     status VARCHAR -- 'OPEN', 'IGNORED', 'FIXED'
# );
from db.database import Base
from sqlalchemy import Column, Numeric, String, ForeignKey, DateTime, Integer, Enum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

class SeverityEnum(str, enum.Enum):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'

class StatusEnum(str, enum.Enum):
    OPEN = 'OPEN'
    IGNORED = 'IGNORED'
    FIXED = 'FIXED'

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    account_id = Column(UUID(as_uuid=True), ForeignKey("cloud_accounts.id"), nullable=False)
    detected_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resource_id = Column(String, nullable=False)
    severity = Column(Enum(SeverityEnum), nullable=False, default=SeverityEnum.LOW)
    issue_type = Column(String, nullable=False)
    estimated_waste = Column(Numeric(10, 2), nullable=False, default=0.00)
    status = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.OPEN)

    cloud_account = relationship("CloudAccount", back_populates="anomalies")

    __table_args__ = (
         UniqueConstraint('account_id', 'resource_id', 'issue_type', 'detected_at', name='_unique_anomaly_uc'),
     )