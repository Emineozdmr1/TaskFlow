import { z } from "zod";

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, "Görev başlığı en az 3 karakter olmalıdır.")
    .max(100, "Görev başlığı en fazla 100 karakter olabilir.")
    .nonempty("Lütfen görev başlığı giriniz."),
  description: z.string().optional(),
  projectId: z.string().min(1, "Lütfen görevin ait olduğu projeyi seçiniz."),
  priority: z.enum(["Düşük", "Orta", "Yüksek"]),
  status: z.enum(["Yapılacak", "Devam Ediyor", "Tamamlandı"]),
  startDate: z.string().optional(),
  dueDate: z.string().min(1, "Lütfen bir teslim tarihi belirleyiniz."),
  tagId: z.string().optional(),
  assignedTo: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;