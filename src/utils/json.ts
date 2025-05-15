/**
 * @description
 * Check if given JSON object conforms to schema ParsedJson and contains an ParsedItemSchema array.
 * Each ParsedItem element should have a contentType and downloadUrl property.
 *
 * Then, Parse Image URLs from the given JSON object.
 * @param data - The ParsedJSON type object to parse.
 * @returns An array of prefixed image URLs found in the Parsed JSON type object.
 */
import type { ParsedJson } from '@/types'
import { getFetchURL } from './url'

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
