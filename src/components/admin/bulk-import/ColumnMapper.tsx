import React, { useEffect } from "react";

interface FieldDefinition {
  key: string;
  label: string;
  required?: boolean;
  description?: string;
}

interface ColumnMapperProps {
  headers: string[];
  fields: FieldDefinition[];
  mapping: Record<string, string>;
  setMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function ColumnMapper({
  headers,
  fields,
  mapping,
  setMapping,
}: ColumnMapperProps) {
  
  // Auto-match headers to database fields on initial load
  useEffect(() => {
    const initialMapping: Record<string, string> = { ...mapping };
    let changed = false;

    fields.forEach((field) => {
      if (!initialMapping[field.key]) {
        const fieldKeyLower = field.key.toLowerCase();
        const fieldLabelLower = field.label.toLowerCase();

        const match = headers.find((h) => {
          const headerLower = h.toLowerCase().replace(/[^a-z0-9]/g, "");
          const keyClean = fieldKeyLower.replace(/[^a-z0-9]/g, "");
          const labelClean = fieldLabelLower.replace(/[^a-z0-9]/g, "");

          return (
            headerLower === keyClean ||
            headerLower === labelClean ||
            headerLower.includes(keyClean) ||
            keyClean.includes(headerLower)
          );
        });

        if (match) {
          initialMapping[field.key] = match;
          changed = true;
        }
      }
    });

    if (changed) {
      setMapping(initialMapping);
    }
  }, [headers, fields]);

  const handleChange = (fieldKey: string, value: string) => {
    setMapping((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 p-4 rounded-2xl">
        <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
          💡 Smart Auto-Mapping Active
        </h3>
        <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
          We matched columns with similar names automatically. Please review and adjust the dropdowns below to verify accuracy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const isSelected = !!mapping[field.key];
          return (
            <div
              key={field.key}
              className={`p-4 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm"
                  : field.required 
                  ? "bg-rose-50/30 dark:bg-rose-950/20 border-rose-400 dark:border-rose-900 shadow-[0_0_12px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/20"
                  : "bg-gray-50/50 dark:bg-gray-900/30 border-dashed border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  {field.label}
                  {field.required && (
                    <span className="text-rose-500 font-black">*</span>
                  )}
                </label>
                {field.description && (
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                    {field.description}
                  </span>
                )}
              </div>

              <select
                value={mapping[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border bg-transparent outline-none transition-all ${
                  mapping[field.key]
                    ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 focus:border-emerald-500"
                    : field.required
                    ? "border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 focus:border-rose-500"
                    : "border-gray-250 dark:border-gray-800 text-gray-500 focus:border-blue-500"
                }`}
              >
                <option value="" className="text-gray-400">
                  -- Ignore Field --
                </option>
                {headers.map((header) => (
                  <option
                    key={header}
                    value={header}
                    className="text-gray-800 dark:text-gray-200 font-medium"
                  >
                    {header}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
