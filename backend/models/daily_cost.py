from db.database import Base
from sqlalchemy import Column, String, Date, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship

class DailyCost(Base):
    __tablename__ = "daily_costs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    account_id = Column(UUID(as_uuid=True), ForeignKey("cloud_accounts.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    service_name = Column(String, nullable=False)
    cost = Column(Numeric(14, 5), nullable=False, default=0.0)
    currency = Column(String, nullable=False, default="USD")

    account = relationship('CloudAccount', back_populates='daily_costs')

    __table_args__ = (
        UniqueConstraint('account_id', 'date', 'service_name', name='_account_date_service_uc'),
    )
