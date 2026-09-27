import { z } from "zod";

export const talentSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must contain at least two characters.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens for the slug."),
  name: z.string().trim().min(2, "Name must contain at least two characters."),
  discipline: z.string().trim().min(2, "Discipline is required."),
  location: z.string().trim().min(2, "Location is required."),
  bio: z.string().trim().min(10, "Biography must contain at least ten characters."),
  image: z.string().trim().url("Upload an image or enter a valid image URL."),
  tags: z.array(z.string().trim().min(1)).max(20),
  featured: z.boolean(),
  published: z.boolean(),
});

export function talentValidationError(error: z.ZodError) {
  return error.issues[0]?.message || "Check the profile details.";
}
