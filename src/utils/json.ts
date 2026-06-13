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
  for (const record of data) {
    for (const thumb of record.thumbnails) {
      if (thumb.contentType === 'png') {
        const proxiedUrl = proxyIfpshareUrl(thumb.url)
        imageUrls.push(proxiedUrl)
      }
    }
  }

  return imageUrls
}
