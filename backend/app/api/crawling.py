from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crawler import crawl_articles
from app.database import get_db
from app.models.article import Article
from app.schemas.crawling import CrawlRequest

router = APIRouter(prefix="/crawling", tags=["crawling"])


@router.post("/run")
def run_crawl(payload: CrawlRequest, db: Session = Depends(get_db)) -> dict:
    started_at = datetime.now(timezone.utc)
    candidates = crawl_articles(payload.period, payload.media_names)
    existing_urls = {url for (url,) in db.query(Article.url).all()}
    added = 0
    duplicates = 0

    for candidate in candidates:
        if candidate["url"] in existing_urls:
            duplicates += 1
            continue
        article = Article(
            published_at=datetime.fromisoformat(candidate["publishedAt"]),
            period=candidate["period"],
            category=candidate["category"],
            search_keywords=candidate["searchKeywords"],
            title=candidate["title"],
            media_name=candidate["mediaName"],
            commodities=candidate["commodities"],
            commodity_scope=candidate["commodityScope"],
            related_countries=candidate["relatedCountries"],
            summary=candidate["summary"],
            url=candidate["url"],
            sentiment=candidate["sentiment"],
            sentiment_score=candidate["sentimentScore"],
            main_points=candidate["mainPoints"],
        )
        db.add(article)
        existing_urls.add(candidate["url"])
        added += 1
    db.commit()
    completed_at = datetime.now(timezone.utc)
    return {
        "id": str(uuid4()),
        "period": payload.period,
        "mediaNames": payload.media_names,
        "startedAt": started_at.isoformat(),
        "completedAt": completed_at.isoformat(),
        "status": "success",
        "articlesFound": len(candidates),
        "articlesAdded": added,
        "duplicatesSkipped": duplicates,
        "message": f"Crawling selesai. {added} artikel ditambahkan; {duplicates} duplikat dilewati.",
    }
