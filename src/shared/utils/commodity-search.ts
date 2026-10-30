type SearchHistoryScope = 'commodity' | 'article'
type SearchHistoryOwner = string
const MAX_SEARCH_HISTORY = 10

function getSearchHistoryKey(scope: SearchHistoryScope, owner: SearchHistoryOwner): string {
  return `eksim-insight:${encodeURIComponent(owner)}:${scope}-search-history:v1`
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('id-ID')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previous[0] ?? 0
    previous[0] = leftIndex

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const above = previous[rightIndex] ?? 0
      previous[rightIndex] = Math.min(
        (previous[rightIndex] ?? 0) + 1,
        (previous[rightIndex - 1] ?? 0) + 1,
        diagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      )
      diagonal = above
    }
  }

  return previous[right.length] ?? 0
}

function tokenSimilarity(queryToken: string, candidateTokens: string[]): number {
  let bestScore = 0

  for (const candidateToken of candidateTokens) {
    if (candidateToken === queryToken) return 1

    if (candidateToken.includes(queryToken) || queryToken.includes(candidateToken)) {
      bestScore = Math.max(bestScore, 0.82)
      continue
    }

    const longestLength = Math.max(queryToken.length, candidateToken.length)
    if (longestLength < 4) continue

    const score = 1 - editDistance(queryToken, candidateToken) / longestLength
    bestScore = Math.max(bestScore, score)
  }

  return bestScore
}

export function getSimilarCommodities(query: string, commodities: string[]): string[] {
  const normalizedQuery = normalizeSearchText(query)
  const queryTokens = normalizedQuery.split(' ').filter(Boolean)

  if (queryTokens.length === 0) return []

  const uniqueCommodities = [...new Set(commodities.filter((commodity) => commodity.trim()))]

  return uniqueCommodities
    .map((commodity) => {
      const normalizedCommodity = normalizeSearchText(commodity)
      const candidateTokens = normalizedCommodity.split(' ')
      const tokenScores = queryTokens.map((token) => tokenSimilarity(token, candidateTokens))
      const coverage = tokenScores.filter((score) => score >= 0.55).length / queryTokens.length
      const averageScore =
        tokenScores.reduce((total, score) => total + score, 0) / queryTokens.length
      const phraseBonus = normalizedCommodity.includes(normalizedQuery) ? 0.1 : 0

      return {
        commodity,
        score: averageScore * 0.7 + coverage * 0.3 + phraseBonus,
        coverage,
      }
    })
    .filter(({ score, coverage }) => score >= 0.55 && coverage > 0)
    .sort(
      (left, right) =>
        right.score - left.score || left.commodity.localeCompare(right.commodity, 'id'),
    )
    .slice(0, 8)
    .map(({ commodity }) => commodity)
}

export function readCommoditySearchHistory(
  scope: SearchHistoryScope = 'commodity',
  owner = 'anonymous',
): string[] {
  if (typeof window === 'undefined') return []

  try {
    const storedHistory = window.localStorage.getItem(getSearchHistoryKey(scope, owner))
    if (!storedHistory) return []

    const parsedHistory: unknown = JSON.parse(storedHistory)

    if (Array.isArray(parsedHistory) && parsedHistory.every((entry) => typeof entry === 'string')) {
      return parsedHistory.slice(0, MAX_SEARCH_HISTORY)
    }
  } catch (error) {
    console.warn('Riwayat pencarian komoditas tidak dapat dibaca.', error)
    return []
  }

  window.localStorage.removeItem(getSearchHistoryKey(scope, owner))
  return []
}

export function saveCommoditySearch(
  query: string,
  history: string[],
  scope: SearchHistoryScope = 'commodity',
  owner = 'anonymous',
): string[] {
  const normalizedQuery = query.trim().replace(/\s+/g, ' ')
  if (!normalizedQuery) return history

  const nextHistory = [
    normalizedQuery,
    ...history.filter(
      (entry) => normalizeSearchText(entry) !== normalizeSearchText(normalizedQuery),
    ),
  ].slice(0, MAX_SEARCH_HISTORY)

  try {
    window.localStorage.setItem(getSearchHistoryKey(scope, owner), JSON.stringify(nextHistory))
    return nextHistory
  } catch (error) {
    console.error('Riwayat pencarian komoditas gagal disimpan.', error)
    return history
  }
}

export function removeCommoditySearchHistory(
  query: string,
  history: string[],
  scope: SearchHistoryScope = 'commodity',
  owner = 'anonymous',
): string[] {
  const nextHistory = history.filter((entry) => entry !== query)

  try {
    window.localStorage.setItem(getSearchHistoryKey(scope, owner), JSON.stringify(nextHistory))
    return nextHistory
  } catch (error) {
    console.error('Riwayat pencarian komoditas gagal dihapus.', error)
    return history
  }
}
