import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3333),
  SECRET: z.string(),
  HOST: z.coerce.string().default("127.0.0.1"),
})

export const env = envSchema.parse(process.env)
