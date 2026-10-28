from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.article import Article
from app.schemas.article import ArticlePayload

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("")
def list_articles(
    period: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[dict]:
    statement = select(Article).order_by(Article.published_at.desc())
    if period and period != "all":
        statement = statement.where(Article.period == period)

    return [article.to_dict() for article in db.scalars(statement).all()]


@router.get("/{article_id}")
def get_article(article_id: UUID, db: Session = Depends(get_db)) -> dict:
    article = db.get(Article, article_id)
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artikel tidak ditemukan.")
    return article.to_dict()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_article(payload: ArticlePayload, db: Session = Depends(get_db)) -> dict:
    values = payload.model_dump(by_alias=False)
    values["url"] = str(payload.url)
    article = Article(
        **values,
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article.to_dict()


@router.put("/{article_id}")
def update_article(
    article_id: UUID,
    payload: ArticlePayload,
    db: Session = Depends(get_db),
) -> dict:
    article = db.get(Article, article_id)
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artikel tidak ditemukan.")

    for key, value in payload.model_dump(by_alias=False).items():
        setattr(article, key, str(value) if key == "url" else value)

    db.commit()
    db.refresh(article)
    return article.to_dict()


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(article_id: UUID, db: Session = Depends(get_db)) -> None:
    article = db.get(Article, article_id)
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artikel tidak ditemukan.")

    db.delete(article)
    db.commit()
