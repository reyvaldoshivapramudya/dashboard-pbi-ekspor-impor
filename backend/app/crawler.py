import re
from collections import Counter
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
    "commodity": [
        "ekspor sawit",
        "ekspor CPO",
        "ekspor batu bara",
        "ekspor nikel",
        "ekspor timah",
        "ekspor karet",
        "ekspor kopi",
        "ekspor kakao",
        "impor beras",
        "impor pangan",
        "impor bahan baku",
    ],
    "policy": [
        "kebijakan ekspor",
        "kebijakan impor",
        "aturan ekspor",
        "aturan impor",
        "tarif bea masuk",
        "bea keluar",
        "antidumping",
        "larangan ekspor",
        "larangan impor",
        "pembatasan impor",
        "hilirisasi ekspor",
    ],
    "logistics": [
        "logistik ekspor",
        "logistik impor",
        "rantai pasok ekspor",
        "pelabuhan ekspor impor",
        "kontainer ekspor",
        "pengapalan ekspor",
        "tarif freight ekspor",
    ],
}

COMMODITIES = {
    "Sawit / CPO": ("kelapa sawit", "minyak sawit", "minyak kelapa sawit", "sawit", "cpo", "palm oil"),
    "Batu Bara": ("batu bara", "batubara"),
    "Nikel": ("nikel",),
    "Timah": ("timah",),
    "Tembaga": ("tembaga",),
    "Baja": ("baja", "besi dan baja"),
    "Karet": ("karet",),
    "Kopi": ("kopi",),
    "Kakao": ("kakao",),
    "Beras": ("beras",),
    "Gula": ("gula",),
    "Elektronik": ("elektronik",),
    "Tekstil dan Produk Tekstil": ("tekstil",),
    "Kayu dan Produk Kayu": ("kayu",),
    "Furnitur": ("furnitur", "mebel"),
    "Kendaraan Bermotor": ("kendaraan bermotor", "mobil", "otomotif"),
}

COUNTRIES = {
    "Amerika Serikat": ("amerika serikat", "united states", "as-ri"),
    "China": ("china", "tiongkok", "cina"),
    "India": ("india",),
    "Jepang": ("jepang", "japan"),
    "Korea Selatan": ("korea selatan", "south korea"),
    "Singapura": ("singapura", "singapore"),
    "Malaysia": ("malaysia",),
    "Thailand": ("thailand",),
    "Vietnam": ("vietnam",),
    "Uni Eropa": ("uni eropa", "european union", "eropa"),
    "Australia": ("australia",),
    "Arab Saudi": ("arab saudi", "saudi arabia"),
    "Brasil": ("brasil", "brazil"),
    "Rusia": ("rusia", "russia"),
}

POSITIVE_WORDS = ("naik", "meningkat", "surplus", "tumbuh", "dibuka", "membaik", "menguat")
NEGATIVE_WORDS = ("turun", "melemah", "terhambat", "larangan", "defisit", "gagal", "krisis", "anjlok")
CORE_TERMS = re.compile(
    r"\b(?:ekspor|mengekspor|pengiriman ekspor|impor|mengimpor|perdagangan internasional|"
    r"perdagangan luar negeri|bea masuk|bea keluar|antidumping|neraca dagang)\b",
    re.IGNORECASE,
)
BPS_PATTERN = re.compile(r"(?i:badan pusat statistik)|(?<!\d)\bBPS\b")
INDEX_PATTERN = re.compile(
    r"/(?:indeks|index|tag|tags|topic|topik|search|cari|terkini|arsip|archive|kanal|channel)(?:/|\?|$)",
    re.IGNORECASE,
)

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (compatible; EksimInsightCrawler/1.0)",
        "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
    }
)


def _period_dates(period: str) -> tuple[datetime, datetime]:
    start = datetime.strptime(period, "%Y-%m")
    end = start.replace(day=28) + timedelta(days=4)
    return start, end.replace(day=1)


def _parse_date(value: str) -> datetime | None:
    try:
        parsed = parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone(timedelta(hours=7))).replace(tzinfo=None)
    except (TypeError, ValueError, OverflowError):
        return None


def _parse_iso(value: str) -> datetime | None:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is not None:
            parsed = parsed.astimezone(timezone(timedelta(hours=7))).replace(tzinfo=None)
        return parsed
    except (TypeError, ValueError):
        return None


def _article_date(html: str) -> datetime | None:
    soup = BeautifulSoup(html, "lxml")
    for attrs in (
        {"property": "article:published_time"},
        {"name": "pubdate"},
        {"name": "publishdate"},
        {"itemprop": "datePublished"},
        {"name": "date"},
    ):
        tag = soup.find("meta", attrs=attrs)
        if tag and tag.get("content"):
            parsed = _parse_iso(tag["content"]) or _parse_date(tag["content"])
            if parsed:
                return parsed
    match = re.search(r'"datePublished"\s*:\s*"([^"]+)"', html)
    return _parse_iso(match.group(1)) if match else None


def _in_period(value: datetime | None, period: str) -> bool:
    if value is None:
        return True
    start, end = _period_dates(period)
    return start <= value < end


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
    try:
        text = trafilatura.extract(
            html,
            include_comments=False,
            include_tables=False,
            favor_precision=False,
            favor_recall=True,
            deduplicate=True,
        )
    except Exception:
        text = None
    if text:
        return re.sub(r"\s+", " ", text).strip()[:30000]

    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "noscript", "svg", "nav", "footer", "header", "aside", "form"]):
        tag.decompose()
    paragraphs = [p.get_text(" ", strip=True) for p in soup.find_all("p")]
    return re.sub(r"\s+", " ", " ".join(paragraphs)).strip()[:30000]


def _clean_title(title: str) -> str:
    result = title.strip()
    for _ in range(3):
        result = re.sub(
            r"\s+[-|–]\s+(?:Antara|ANTARA News|CNBC Indonesia|DetikFinance|Liputan6|SINDOnews|Tribun.*)$",
            "",
            result,
            flags=re.IGNORECASE,
        ).strip()
    return result


def _sentences(text: str) -> list[str]:
    return [sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", text) if len(sentence.strip()) >= 40]


def _summary_and_points(text: str) -> tuple[str, list[str]]:
    sentences = _sentences(text)
    summary = " ".join(sentences[:3])[:900].strip()
    if not summary:
        summary = re.sub(r"\s+", " ", text).strip()[:900]
    points = sorted(
        sentences,
        key=lambda sentence: (
            bool(CORE_TERMS.search(sentence)),
            sum(sentence.lower().count(word) for word in POSITIVE_WORDS + NEGATIVE_WORDS),
            len(sentence),
        ),
        reverse=True,
    )[:3]
    return summary, points or [summary]


def _classify(text: str) -> tuple[list[str], str]:
    lowered = text.lower()
    found = [
        label
        for label, words in COMMODITIES.items()
        if any(re.search(rf"(?<!\w){re.escape(word)}(?!\w)", lowered) for word in words)
    ]
    return found[:3], "specific" if found else "cross_commodity"


def _countries(text: str) -> list[str]:
    lowered = text.lower()
    counts = {
        label: sum(lowered.count(word) for word in words)
        for label, words in COUNTRIES.items()
    }
    return [label for label, count in sorted(counts.items(), key=lambda item: item[1], reverse=True) if count][:5]


def _category_text(title: str, text: str, fallback: str) -> str:
    lowered = f"{title} {text}".lower()
    if any(word in lowered for word in ("pelabuhan", "kontainer", "logistik", "pelayaran")):
        return "logistics"
    if any(word in lowered for word in ("kebijakan", "aturan", "tarif", "bea masuk", "larangan")):
        return "policy"
    return fallback


def _sentiment(text: str) -> tuple[str, float]:
    lowered = text.lower()
    positive = sum(lowered.count(word) for word in POSITIVE_WORDS)
    negative = sum(lowered.count(word) for word in NEGATIVE_WORDS)
    total = max(positive + negative, 1)
    if negative > positive:
        return "negative", round(min(0.95, 0.5 + negative / total * 0.45), 2)
    return "positive", round(min(0.95, 0.5 + positive / total * 0.45), 2)


def crawl_articles(period: str, media_names: list[str], limit_per_media: int = 8) -> list[dict]:
    articles: list[dict] = []
    seen_urls: set[str] = set()
    start, end = _period_dates(period)
    after = start.strftime("%Y-%m-%d")
    before = end.strftime("%Y-%m-%d")

    for media_name in media_names:
        domain = MEDIA_SOURCES.get(media_name)
        if not domain:
            continue
        candidates: list[tuple[str, str, str, str]] = []
        seen_titles: set[str] = set()
        for category, keywords in KEYWORDS.items():
            for keyword in keywords:
                query = f"{keyword} site:{domain} after:{after} before:{before}"
                rss_url = (
                    "https://news.google.com/rss/search?q="
                    f"{quote(query)}&hl=id&gl=ID&ceid=ID:id"
                )
                feed = feedparser.parse(rss_url)
                for entry in feed.entries[:5]:
                    title = _clean_title(entry.get("title", ""))
                    if not title or title.lower() in seen_titles:
                        continue
                    seen_titles.add(title.lower())
                    candidates.append((title, entry.get("link", ""), category, keyword))

        for title, google_url, category, keyword in candidates:
            if sum(item["mediaName"] == media_name for item in articles) >= limit_per_media:
                break
            url = _resolve_url(google_url)
            host = urlparse(url).netloc.lower()
            if not url or url in seen_urls or not (host == domain or host.endswith(f".{domain}")):
                continue
            if INDEX_PATTERN.search(urlparse(url).path.lower()):
                continue
            try:
                response = SESSION.get(url, timeout=25)
                response.raise_for_status()
            except requests.RequestException:
                continue
            text = _extract_text(response.text)
            if len(text) < 300 or BPS_PATTERN.search(text[:800]) or len(BPS_PATTERN.findall(text)) >= 3:
                continue
            published = _article_date(response.text) or _parse_date("")
            if published is None:
                published = datetime.strptime(f"{period}-15", "%Y-%m-%d")
            if not _in_period(published, period):
                continue
            title = _clean_title(title)
            full_text = f"{title} {text}"
            if not CORE_TERMS.search(full_text) or len(CORE_TERMS.findall(text)) < 1:
                continue
            summary, points = _summary_and_points(text)
            if not summary:
                continue
            commodities, scope = _classify(full_text)
            sentiment, sentiment_score = _sentiment(f"{title} {summary}")
            articles.append(
                {
                    "publishedAt": published.isoformat(),
                    "period": period,
                    "category": _category_text(title, text, category),
                    "searchKeywords": [keyword],
                    "title": title,
                    "mediaName": media_name,
                    "commodities": commodities,
                    "commodityScope": scope,
                    "relatedCountries": _countries(f"{title} {summary} {text[:5000]}"),
                    "summary": summary,
                    "url": url,
                    "sentiment": sentiment,
                    "sentimentScore": sentiment_score,
                    "mainPoints": points,
                }
            )
            seen_urls.add(url)
    return articles
