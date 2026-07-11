import type { ParsedJson, ShareResources } from '@/types'
import { getFetchURL, proxyIfpshareUrl } from './url'

export const parsePrefixedImageUrlsFromJson = (data: ParsedJson): string[] => {
  const imageUrls: string[] = []
  const items = data.items
  for (const item of items) {
    const prefixedUrl = getFetchURL(item.downloadUrl)
    if (prefixedUrl) {
      imageUrls.push(prefixedUrl)
    }
  }

  return imageUrls
}

export const parseImageUrlsFromResources = (data: ShareResources): string[] => {
  const imageUrls: string[] = []
  const sortedRecords = [...data].sort((a, b) => a.indexOf - b.indexOf)
  for (const record of sortedRecords) {
    const sortedThumbs = [...record.thumbnails].sort((a, b) => a.indexOf - b.indexOf)
    for (const thumb of sortedThumbs) {
      if (thumb.contentType === 'png') {
        imageUrls.push(proxyIfpshareUrl(thumb.url))
      }
    }
  }

  return imageUrls
}
