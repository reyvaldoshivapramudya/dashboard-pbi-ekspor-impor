from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.articles import router as articles_router
from app.api.crawling import router as crawling_router
from app.config import settings
from app.database import Base, engine
from app.models import Article

app = FastAPI(title="Dashboard PBI Ekspor Impor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(articles_router, prefix="/api")
app.include_router(crawling_router, prefix="/api")
