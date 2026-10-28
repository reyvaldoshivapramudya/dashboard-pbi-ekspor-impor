from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Float, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PostgreSQLUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    period: Mapped[str] = mapped_column(String(7), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    search_keywords: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    media_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    commodities: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    commodity_scope: Mapped[str] = mapped_column(String(30), nullable=False)
    related_countries: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    sentiment: Mapped[str] = mapped_column(String(20), nullable=False)
    sentiment_score: Mapped[float] = mapped_column(Float, nullable=False)
    main_points: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": str(self.id),
            "publishedAt": self.published_at.isoformat(),
            "period": self.period,
            "category": self.category,
            "searchKeywords": self.search_keywords,
            "title": self.title,
            "mediaName": self.media_name,
            "commodities": self.commodities,
            "commodityScope": self.commodity_scope,
            "relatedCountries": self.related_countries,
            "summary": self.summary,
            "url": self.url,
            "sentiment": self.sentiment,
            "sentimentScore": self.sentiment_score,
            "mainPoints": self.main_points,
        }
