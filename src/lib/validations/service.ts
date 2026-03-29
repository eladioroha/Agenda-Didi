import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  description: z.string().max(500).optional(),
  durationMins: z
    .number()
    .int()
    .min(15, "Duração mínima de 15 minutos")
    .max(480),
  price: z.number().min(0, "Preço não pode ser negativo"),
  isActive: z.boolean().optional().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
