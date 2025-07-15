import { z } from 'zod'

const invalid_type_error = 'We expect a string here'

export const clientSchema = z.object({
  name: z
    .string({ invalid_type_error, required_error: "Name can't be blank" })
    .min(1, 'Name is required'),
  client_id: z
    .string({ invalid_type_error, required_error: "Client ID can't be blank" })
    .min(1, 'Client ID is required')
    .refine((val) => /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(val), 'invalid format'),
})

export type ClientSchema = z.infer<typeof clientSchema>
