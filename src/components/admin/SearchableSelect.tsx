import { useEffect, useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: any; // Can be string or array
  onChange: (val: any) => void;
  placeholder?: string;
  className?: string;
  creatable?: boolean;
  isMulti?: boolean;
  onCreateOption?: (val: string) => void;
  isLoading?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  className,
  creatable,
  isMulti,
  onCreateOption,
  isLoading,
}: SearchableSelectProps) {
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleChange = (selectedOption: any) => {
    if (isMulti) {
      onChange(
        selectedOption ? selectedOption.map((opt: any) => opt.value) : [],
      );
    } else {
      onChange(selectedOption ? selectedOption.value : "");
    }
  };

  const selected = isMulti
    ? options.filter((opt) => Array.isArray(value) && value.includes(opt.value))
    : options.find((opt) => opt.value === value) || null;

  const Component = creatable ? CreatableSelect : Select;

  return (
    <div className={className}>
      <Component
        value={selected}
        onChange={handleChange}
        options={options}
        onCreateOption={onCreateOption}
        isLoading={isLoading}
        isMulti={isMulti}
        {...(creatable
          ? {
              inputValue,
              onInputChange: (val: string, actionMeta: any) => {
                if (actionMeta.action === "input-change") setInputValue(val);
                else if (
                  actionMeta.action === "set-value" ||
                  actionMeta.action === "menu-close"
                )
                  setInputValue("");
              },
              onKeyDown: (event: any) => {
                if (!inputValue) return;
                if (
                  event.key === "Enter" ||
                  event.key === "Tab" ||
                  event.key === ","
                ) {
                  if (onCreateOption) {
                    event.preventDefault();
                    onCreateOption(inputValue);
                    setInputValue("");
                  }
                }
              },
            }
          : {})}
        placeholder={placeholder}
        isClearable
        unstyled // Use unstyled to rely entirely on Tailwind
        classNames={{
          control: (state) =>
            `px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] min-h-[44px] w-full rounded-xl border text-[16px] sm:text-[clamp(0.875rem,2vw,1rem)] transition-all outline-none ${
              state.isFocused
                ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-gray-700"
                : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
            }`,
          menu: () =>
            "mt-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden z-50",
          menuList: () => "p-1 max-h-60 overflow-y-auto custom-scrollbar",
          option: (state) =>
            `px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] min-h-[44px] text-[clamp(0.875rem,2vw,1rem)] rounded-lg cursor-pointer flex items-center ${
              state.isSelected
                ? "bg-emerald-500 text-white"
                : state.isFocused
                  ? "bg-emerald-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            }`,
          singleValue: () => "text-gray-900 dark:text-white",
          input: () => "text-gray-900 dark:text-white",
          placeholder: () => "text-gray-400",
          clearIndicator: () =>
            "text-gray-400 hover:text-pink-500 cursor-pointer p-1 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center",
          dropdownIndicator: () =>
            "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer p-1 min-h-[44px] min-w-[44px] flex items-center justify-center",
          multiValue: () =>
            "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 rounded-lg m-1",
          multiValueLabel: () =>
            "px-2 py-1 text-xs font-semibold flex items-center",
          multiValueRemove: () =>
            "px-2 py-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 hover:text-pink-500 rounded-r-lg cursor-pointer",
        }}
      />
    </div>
  );
}
