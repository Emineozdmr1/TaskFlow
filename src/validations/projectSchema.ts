import { z } from "zod";

export const PROJECT_ICONS = [
  "FolderKanban",
  "Briefcase",
  "Rocket",
  "Code2",
  "Palette",
  "Target",
] as const;

export type ProjectIconType = (typeof PROJECT_ICONS)[number];

export const projectSchema = z.object({
  title: z
    .string()
    .min(3, "Proje başlığı en az 3 karakter olmalıdır.")
    .max(50, "Proje başlığı en fazla 50 karakter olabilir.")
    .nonempty("Lütfen bir proje başlığı giriniz."),
  category: z.enum(["Yazılım", "Tasarım", "Pazarlama", "Kişisel"], {
    errorMap: () => ({ message: "Lütfen geçerli bir kategori seçiniz." }),
  }),
  coverTheme: z.string().min(1, "Lütfen bir tema seçiniz."),
  coverIcon: z.enum(PROJECT_ICONS, {
    errorMap: () => ({ message: "Lütfen geçerli bir ikon seçiniz." }),
  }),
  coverImage: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;