import { z } from 'zod'

export const analysisConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  provider: z.string().min(1, 'Provider is required'),
  is_default: z.boolean().default(false),
  provider_params: z.record(z.unknown()).default({}),
})

export type AnalysisConfigSchema = z.infer<typeof analysisConfigSchema>
