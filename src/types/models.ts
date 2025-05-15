import { z } from 'zod'

export const ParsedItemSchema = z.object({
  contentType: z.literal('png'),
  downloadUrl: z.string().min(1),
})

export const ParsedJsonSchema = z.object({
  items: z.array(ParsedItemSchema).min(1),
})

export type ParsedJson = z.infer<typeof ParsedJsonSchema>
export type ParsedItem = z.infer<typeof ParsedItemSchema>
