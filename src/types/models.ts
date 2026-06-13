import { z } from 'zod'

export const ParsedItemSchema = z.object({
  contentType: z.literal('png'),
  downloadUrl: z.string().min(1),
})

export const ParsedJsonSchema = z.object({
  items: z.array(ParsedItemSchema).min(1),
})

export const ThumbnailSchema = z.object({
  name: z.string(),
  contentType: z.literal('png'),
  url: z.string(),
  indexOf: z.number(),
  size: z.number(),
})

export const ShareRecordSchema = z.object({
  itemId: z.string(),
  thumbnails: z.array(ThumbnailSchema).min(1),
})

export const ShareResourcesSchema = z.array(ShareRecordSchema).min(1)

export type ParsedJson = z.infer<typeof ParsedJsonSchema>
export type ParsedItem = z.infer<typeof ParsedItemSchema>
export type ShareResources = z.infer<typeof ShareResourcesSchema>
export type Thumbnail = z.infer<typeof ThumbnailSchema>
