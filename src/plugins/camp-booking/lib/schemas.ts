import { z } from "zod"

export const campChildSchema = z.object({
  name: z.string().min(1, "A gyerek neve kötelező"),
  birthDate: z.string().min(1, "Születési dátum kötelező"),
  dietaryRequest: z.string().optional(),
  allergies: z.string().optional(),
})

export const createHoldSchema = z.object({
  sessionId: z.string().min(1),
  ticketTypeId: z.string().min(1),
  childCount: z.number().int().min(1).max(20),
  buyerName: z.string().min(1, "Név kötelező"),
  buyerEmail: z.string().email("Érvényes email szükséges"),
  buyerPhone: z.string().min(6, "Telefonszám kötelező"),
  children: z.array(campChildSchema).min(1),
})

export type CreateHoldInput = z.infer<typeof createHoldSchema>
