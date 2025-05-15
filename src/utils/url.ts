/**
 * @description
 * Check if given URL is either of form
 * 1. https://air.ifpshare.com/${targetPath}
 * 2. http://air.ifpshare.com/${targetPath}
 * 3. //air.ifpshare.com/${targetPath}
 * 4. air.ifpshare.com/${targetPath}
 *
 * such that if
 * targetPath of form:
 * 1. /documentPreview.html?s_id=<something>/detail/<documentId>/record
 * 2. /api/pub/files/<documentId>
 *    Then extract documentId
 */

// No need for regex since prefixes are fixed
import { FETCH_API_PREFIX, FETCH_PUB_API_PREFIX, PREFIXES } from '@/types/constants'

const getDocumentURL = (url: string): string | null => {
  if (url.length === 0) {
    return null
  }

  for (const prefix of PREFIXES) {
    if (url.startsWith(prefix)) {
      const targetPath = url.slice(prefix.length)
      if (targetPath.startsWith('documentPreview.html?s_id=')) {
        const documentId = targetPath.split('/')[2]
        return `${FETCH_PUB_API_PREFIX}${documentId}`
      } else if (targetPath.startsWith('api/')) {
        return targetPath
      }
    }
  }

  return null
}

/**
 * Given an url, get its document id and prefix it with
 * `FETCH_API_PREFIX` from constants.ts
 */
export const getFetchURL = (url: string): string | null => {
  const documentId = getDocumentURL(url)
  if (documentId) {
    return `${FETCH_API_PREFIX}${documentId}`
  }

  return null
}
