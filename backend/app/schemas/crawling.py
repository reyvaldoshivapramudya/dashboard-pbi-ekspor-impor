from pydantic import BaseModel, Field


class CrawlRequest(BaseModel):
    period: str = Field(pattern=r"^\d{4}-\d{2}$")
    media_names: list[str] = Field(min_length=1, alias="mediaNames")

    model_config = {"populate_by_name": True}


class CrawlResponse(BaseModel):
    id: str
    period: str
    media_names: list[str] = Field(alias="mediaNames")
    started_at: str = Field(alias="startedAt")
    completed_at: str | None = Field(alias="completedAt")
    status: str
    articles_found: int = Field(alias="articlesFound")
    articles_added: int = Field(alias="articlesAdded")
    duplicates_skipped: int = Field(alias="duplicatesSkipped")
    message: str

    model_config = {"populate_by_name": True}
