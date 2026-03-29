import { z } from "zod";

export const createAppointmentSchema = z.object({
  serviceId: z.string().min(1, "Selecione um serviço"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  clientName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100),
  clientPhone: z
    .string()
    .regex(
      /^\+?[1-9]\d{7,14}$/,
      "Telefone inválido. Use formato internacional (ex: +5511999998888)"
    ),
  clientEmail: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"])
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  serviceId: z.string().optional(),
  notes: z.string().max(500).optional(),
});
