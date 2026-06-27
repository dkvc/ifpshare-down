import { FETCH_API_PREFIX, FETCH_PUB_API_PREFIX, PREFIXES, API_SHARES_BASE, MDC_REGION_MAP } from '@/types/constants'

export const getMdcArea = (sId: string): string | null => {
  const prefix = sId.split('_')[0]
  return MDC_REGION_MAP[prefix] ?? null
}

export const isNewFormatSId = (sId: string): boolean => {
  return !sId.includes('/detail/')
}

export const extractSId = (url: string): string | null => {
  if (!url) return null
  for (const prefix of PREFIXES) {
    if (url.startsWith(prefix)) {
      const targetPath = url.slice(prefix.length)
      if (targetPath.startsWith('documentPreview.html/?s_id=') || targetPath.startsWith('documentPreview.html?s_id=')) {
        return targetPath.split('s_id=')[1] ?? null
      }
    }
  }
  return null
}

export const isNewFormatURL = (url: string): boolean => {
  const sId = extractSId(url)
  return sId !== null && isNewFormatSId(sId)
}

const getDocumentURL = (url: string): string | null => {
  if (url.length === 0) {
    return null
  }

  for (const prefix of PREFIXES) {
    if (url.startsWith(prefix)) {
      const targetPath = url.slice(prefix.length)
      if (targetPath.startsWith('documentPreview.html/?s_id=') || targetPath.startsWith('documentPreview.html?s_id=')) {
        const afterSId = targetPath.split('s_id=')[1]
        if (afterSId && isNewFormatSId(afterSId)) {
          return `${API_SHARES_BASE}/${afterSId}/resources`
        }
        const documentId = afterSId.split('/')[2]
        return `${FETCH_PUB_API_PREFIX}${documentId}`
      } else if (targetPath.startsWith('api/')) {
        return targetPath
      }
    }
  }

  return null
}

export const getFetchURL = (url: string): string | null => {
  const documentId = getDocumentURL(url)
  if (documentId) {
    return `${FETCH_API_PREFIX}${documentId}`
  }

  return null
}

export const proxyIfpshareUrl = (url: string): string => {
  for (const prefix of PREFIXES) {
    if (url.startsWith(prefix)) {
      return `${FETCH_API_PREFIX}${url.slice(prefix.length)}`
    }
  }
  return url
}
