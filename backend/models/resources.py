from db.database import Base
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

class CloudResource(Base):
    __tablename__ = "resource"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    cloud_account_id = Column(UUID(as_uuid=True), ForeignKey('cloud_accounts.id'), nullable=False)
    resource_type = Column(String)
    resource_id = Column(String)
    region = Column(String)

    detail = Column(JSONB)

    cloud_account = relationship('CloudAccount', back_populates='resource')
