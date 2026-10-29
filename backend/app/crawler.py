import re
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from urllib.parse import quote, urlparse

import feedparser
import requests
import trafilatura
from bs4 import BeautifulSoup
from googlenewsdecoder import gnewsdecoder

MEDIA_SOURCES = {
    "Antara": "antaranews.com",
    "CNBC Indonesia": "cnbcindonesia.com",
    "DetikFinance": "finance.detik.com",
    "Liputan6": "liputan6.com",
    "SINDOnews": "sindonews.com",
    "Tribun": "tribunnews.com",
}

KEYWORDS = {
    "commodity": ["ekspor sawit", "ekspor nikel", "ekspor batu bara", "impor beras"],
    "policy": ["kebijakan ekspor", "kebijakan impor", "tarif impor", "antidumping"],
    "logistics": ["logistik ekspor", "pelabuhan ekspor impor", "kontainer ekspor"],
}

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (compatible; EksimInsightCrawler/1.0)",
        "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
    }
)


def _period_dates(period: str) -> tuple[datetime, datetime]:
    start = datetime.strptime(period, "%Y-%m")
    end = datetime(start.year + (start.month == 12), 1 if start.month == 12 else start.month + 1, 1)
    return start, end


def _in_period(value: datetime | None, period: str) -> bool:
    if value is None:
        return True
    start, end = _period_dates(period)
    return start <= value.replace(tzinfo=None) < end


def _parse_date(value: str) -> datetime | None:
    try:
        parsed = parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone(timedelta(hours=7))).replace(tzinfo=None)
    except (TypeError, ValueError, OverflowError):
        return None


def _article_date(html: str) -> datetime | None:
    soup = BeautifulSoup(html, "lxml")
    for attrs in (
        {"property": "article:published_time"},
        {"name": "publishdate"},
        {"itemprop": "datePublished"},
    ):
        tag = soup.find("meta", attrs=attrs)
        if tag and tag.get("content"):
            try:
                return datetime.fromisoformat(tag["content"].replace("Z", "+00:00")).replace(
                    tzinfo=None
                )
            except ValueError:
                continue
    return None


def _resolve_url(url: str) -> str:
    if "news.google.com" not in url:
        return url
    try:
        result = gnewsdecoder(url, interval=1, timeout=15)
        decoded = result.get("decoded_url", "") if isinstance(result, dict) else ""
        if decoded.startswith("http"):
            return decoded
    except Exception:
        pass
    try:
        response = SESSION.get(url, timeout=15, allow_redirects=True)
        if response.url.startswith("http") and "news.google.com" not in response.url:
            return response.url
    except requests.RequestException:
        pass
    return ""


def _extract_text(html: str) -> str:
    text = trafilatura.extract(
        html,
        include_comments=False,
        include_tables=False,
        favor_precision=False,
        favor_recall=True,
        deduplicate=True,
    )
    if text:
        return re.sub(r"\s+", " ", text).strip()[:30000]

    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "noscript", "svg", "nav", "footer", "header", "aside"]):
        tag.decompose()
    return re.sub(r"\s+", " ", " ".join(p.get_text(" ", strip=True) for p in soup.find_all("p"))).strip()[
        :30000
    ]


def _summary(text: str) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return " ".join(sentence for sentence in sentences if len(sentence) >= 40)[:900].strip()


def _classify(text: str) -> tuple[list[str], str]:
    names = {
        "Sawit / CPO": ["sawit", "cpo", "palm oil"],
        "Nikel": ["nikel"],
        "Batu Bara": ["batu bara"],
        "Beras": ["beras"],
        "Baja": ["baja"],
    }
    found = [name for name, words in names.items() if any(word in text.lower() for word in words)]
    return found[:3], "specific" if found else "cross_commodity"


def _sentiment(text: str) -> tuple[str, float]:
    negative = ("turun", "melemah", "terhambat", "larangan", "defisit", "gagal", "krisis")
    positive = ("naik", "meningkat", "surplus", "tumbuh", "dibuka", "membaik")
    score = sum(text.lower().count(word) for word in positive) - sum(
        text.lower().count(word) for word in negative
    )
    if score < 0:
        return "negative", 0.6
    return "positive", 0.6


def crawl_articles(period: str, media_names: list[str], limit_per_media: int = 8) -> list[dict]:
    articles: list[dict] = []
    seen_urls: set[str] = set()
    for media_name in media_names:
        domain = MEDIA_SOURCES.get(media_name)
        if not domain:
            continue
        candidates: list[tuple[str, str, str, str]] = []
        for category, keywords in KEYWORDS.items():
            for keyword in keywords:
                query = f"{keyword} site:{domain} after:{period}-01 before:{period}-32"
                rss_url = (
                    "https://news.google.com/rss/search?q="
                    f"{quote(query)}&hl=id&gl=ID&ceid=ID:id"
                )
                feed = feedparser.parse(rss_url)
                for entry in feed.entries[:4]:
                    candidates.append(
                        (entry.get("title", ""), entry.get("link", ""), category, keyword)
                    )
        for title, google_url, category, keyword in candidates:
            if len([item for item in articles if item["mediaName"] == media_name]) >= limit_per_media:
                break
            url = _resolve_url(google_url)
            if not url or url in seen_urls or domain not in urlparse(url).netloc:
                continue
            try:
                response = SESSION.get(url, timeout=25)
                response.raise_for_status()
            except requests.RequestException:
                continue
            text = _extract_text(response.text)
            if len(text) < 300:
                continue
            published = _article_date(response.text) or datetime.strptime(f"{period}-15", "%Y-%m-%d")
            if not _in_period(published, period):
                continue
            clean_title = re.sub(r"\s+[-|–]\s+[^-|–]{2,70}$", "", title).strip()
            summary = _summary(text)
            if not summary:
                continue
            commodities, scope = _classify(f"{clean_title} {summary} {text[:5000]}")
            sentiment, sentiment_score = _sentiment(f"{clean_title} {summary}")
            articles.append(
                {
                    "publishedAt": published.isoformat(),
                    "period": period,
                    "category": category,
                    "searchKeywords": [keyword],
                    "title": clean_title,
                    "mediaName": media_name,
                    "commodities": commodities,
                    "commodityScope": scope,
                    "relatedCountries": [],
                    "summary": summary,
                    "url": url,
                    "sentiment": sentiment,
                    "sentimentScore": sentiment_score,
                    "mainPoints": None,
                }
            )
            seen_urls.add(url)
    return articles
