from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ArticlePayload(BaseModel):
    published_at: datetime = Field(alias="publishedAt")
    period: str = Field(min_length=7, max_length=7)
    category: str
    search_keywords: list[str] = Field(default_factory=list, alias="searchKeywords")
    title: str
    media_name: str = Field(alias="mediaName")
    commodities: list[str] = Field(default_factory=list)
    commodity_scope: str = Field(alias="commodityScope")
    related_countries: list[str] = Field(default_factory=list, alias="relatedCountries")
    summary: str
    url: HttpUrl
    sentiment: str
    sentiment_score: float = Field(alias="sentimentScore", ge=0, le=1)
    main_points: list[str] | None = Field(default=None, alias="mainPoints")

    model_config = ConfigDict(populate_by_name=True)


class ArticleResponse(ArticlePayload):
    id: UUID

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
