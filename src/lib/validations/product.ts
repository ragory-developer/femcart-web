import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().optional(),
  price: z
    .string()
    .min(1, "Price required")
    .refine((val) => !isNaN(parseFloat(val)), "Invalid price"),
  specialPrice: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(parseFloat(val)), "Invalid special price"),
  specialPriceStart: z.string().optional(),
  specialPriceEnd: z.string().optional(),
  stock: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(parseInt(val)), "Invalid stock number")
    .default("0"),
  image: z.string().optional(),
  isDefault: z.boolean().default(false),
  enabled: z.boolean().default(true),
  attributes: z
    .array(
      z.object({
        name: z.string().min(1, "Attribute name required"),
        value: z.string().min(1, "Attribute value required"),
      }),
    )
    .default([]),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(parseFloat(val)), "Invalid price"),
  specialPrice: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(parseFloat(val)), "Invalid special price"),
  specialPriceStart: z.string().optional(),
  specialPriceEnd: z.string().optional(),
  stock: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(parseInt(val)), "Invalid stock number")
    .default("0"),
  image: z.string().optional(),
  images: z.string().optional(),
  unit: z.string().default("piece"),
  weight: z.string().optional(),
  featured: z.boolean().default(false),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  brandId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  slug: z.string().optional(),
  sku: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  isHalal: z.boolean().default(true),
  upsellProducts: z.array(z.string()).default([]),
  upsellCategoryIds: z.array(z.string()).default([]),
  downsellProducts: z.array(z.string()).default([]),
  downsellCategoryIds: z.array(z.string()).default([]),

  // Custom nested state
  variants: z.array(variantSchema).default([]),
  specifications: z
    .array(
      z.object({
        name: z.string().min(1, "Specification name required"),
        value: z.string().min(1, "Specification value required"),
      }),
    )
    .default([]),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1, "Question required"),
        answer: z.string().min(1, "Answer required"),
      }),
    )
    .default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;
