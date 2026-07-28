import SearchableSelect from "@/components/admin/SearchableSelect";
import { API_URL } from "@/lib/config";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import { useFormContext, Controller } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";
import { AlertCircle } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface TagItem {
  id: string;
  name: string;
}

export default function GeneralTab({ excludeId }: { excludeId?: string }) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
  const [creatingTag, setCreatingTag] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugWarning, setSlugWarning] = useState<string | null>(null);

  const watchSlug = watch("slug");
  const watchTags = watch("tags") || [];

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((r) => r.json())
      .then((j) => j.success && setCategories(j.data || []))
      .catch(console.error);

    fetch(`${API_URL}/api/brands?limit=2000`)
      .then((r) => r.json())
      .then((j) => j.success && setBrands(j.data || []))
      .catch(console.error);

    fetch(`${API_URL}/api/tags`)
      .then((r) => r.json())
      .then((j) => j.success && setAvailableTags(j.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!watchSlug) {
      setSlugWarning(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const url = new URL(`${API_URL}/api/products/check-slug`);
        url.searchParams.append("slug", watchSlug);
        if (excludeId) url.searchParams.append("excludeId", excludeId);

        const res = await fetch(url.toString());
        const json = await res.json();
        if (json.success && !json.available) {
          setSlugWarning(
            "This slug is already taken. Please enter a unique slug.",
          );
        } else {
          setSlugWarning(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSlugChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [watchSlug, excludeId]);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const flatCats: { id: string; name: string; depth: number }[] = [];
  const flatten = (cats: Category[], depth = 0) => {
    cats.forEach((c) => {
      flatCats.push({ id: c.id, name: c.name, depth });
      if (c.children?.length) flatten(c.children, depth + 1);
    });
  };
  flatten(categories);

  const categoryOptions = flatCats.map((c) => ({
    value: c.id,
    label: `${"—".repeat(c.depth)} ${c.name}`,
  }));

  const brandOptions = brands.map((b) => ({
    value: b.id,
    label: b.name,
  }));

  const tagOptions = availableTags.map((t) => ({ value: t.id, label: t.name }));

  function getToken() {
    return typeof window !== "undefined"
      ? localStorage.getItem("femcart_access_token") ||
          localStorage.getItem("token") ||
          ""
      : "";
  }

  const handleCreateTag = async (inputValue: string) => {
    setCreatingTag(true);
    try {
      const newTagNames = inputValue
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const createdTags: TagItem[] = [];
      const newTagIds: string[] = [];

      for (const tName of newTagNames) {
        const existing = availableTags.find(
          (t) => t.name.toLowerCase() === tName.toLowerCase(),
        );
        if (existing) {
          if (!watchTags.includes(existing.id)) newTagIds.push(existing.id);
        } else {
          const res = await fetch(`${API_URL}/api/tags`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ name: tName }),
          });
          const json = await res.json();
          if (json.success) {
            createdTags.push(json.data);
            newTagIds.push(json.data.id);
          }
        }
      }

      if (createdTags.length > 0)
        setAvailableTags((prev) => [...prev, ...createdTags]);
      if (newTagIds.length > 0 || createdTags.length > 0) {
        setValue("tags", Array.from(new Set([...watchTags, ...newTagIds])));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingTag(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            General Information
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Basic details about your product.
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Product Name <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Premium Cotton T-Shirt"
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.name ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white font-medium transition-colors`}
            />
            {errors.name && (
              <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {errors.name.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Custom Slug (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("slug", {
                  onChange: (e) =>
                    setValue(
                      "slug",
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    ),
                })}
                placeholder="Leave blank to auto-generate from name"
                className={`w-full px-4 py-2.5 rounded-lg border ${slugWarning || errors.slug ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white font-medium transition-colors`}
              />
              {slugChecking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
              )}
            </div>
            {slugWarning ? (
              <p className="absolute top-full left-0 mt-1 text-[11px] text-pink-500 font-medium">
                {slugWarning}
              </p>
            ) : errors.slug ? (
              <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {errors.slug.message}
              </p>
            ) : (
              <p className="absolute top-full left-0 mt-1 text-[11px] text-gray-500">
                Custom URL identifier. Must be unique. Only lowercase letters,
                numbers, and hyphens.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Short Description
            </label>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
              <Controller
                name="shortDescription"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    value={field.value || ""}
                    onChange={field.onChange}
                    modules={quillModules}
                    className="h-32 mb-10"
                  />
                )}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              A concise summary of the product.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Full Description
            </label>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    value={field.value || ""}
                    onChange={field.onChange}
                    modules={quillModules}
                    className="h-64 mb-10"
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Pricing
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Set the regular and special prices for this product.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Regular Price (?) <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              {...register("price")}
              placeholder="0.00"
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.price ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors`}
            />
            {errors.price && (
              <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {errors.price.message}
              </p>
            )}
          </div>
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Special Price
            </label>
            <input
              type="text"
              {...register("specialPrice")}
              placeholder="0.00"
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.specialPrice ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors`}
            />
            {errors.specialPrice && (
              <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {errors.specialPrice.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Special Price Start
            </label>
            <input
              type="datetime-local"
              {...register("specialPriceStart")}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Special Price End
            </label>
            <input
              type="datetime-local"
              {...register("specialPriceEnd")}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Organization
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Categorize and label your product for better discoverability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Categories <span className="text-pink-500">*</span>
            </label>
            <Controller
              name="categoryIds"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={categoryOptions}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select categories..."
                  className={`text-gray-900 dark:text-white ${errors.categoryIds ? "border-pink-500 border rounded-lg" : ""}`}
                  isMulti
                />
              )}
            />
            {errors.categoryIds && (
              <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {errors.categoryIds.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Brand
            </label>
            <Controller
              name="brandId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={brandOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select brand..."
                  className="text-gray-900 dark:text-white"
                />
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Halal Status
            </label>
            <Controller
              name="isHalal"
              control={control}
              render={({ field }) => (
                <select
                  value={field.value ? "true" : "false"}
                  onChange={(e) => field.onChange(e.target.value === "true")}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors"
                >
                  <option value="true">100% Halal</option>
                  <option value="false">Standard</option>
                </select>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Tags
            </label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={tagOptions}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Search or type to add tags..."
                  className="text-gray-900 dark:text-white"
                  isMulti
                  creatable
                  onCreateOption={handleCreateTag}
                  isLoading={creatingTag}
                />
              )}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-6">
          <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <input
              type="checkbox"
              {...register("featured")}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-semibold text-sm text-gray-900 dark:text-white block">
                Featured Product
              </span>
              <span className="text-xs text-gray-500">
                Show this product in featured sections
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
