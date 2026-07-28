import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  headerAction?: ReactNode;
  bgWhite?: boolean;
  textAlign?: "left" | "center" | "right";
  builderClassName?: string;
  builderStyle?: React.CSSProperties;
}

export default function SectionWrapper({
  children,
  eyebrow,
  title,
  subtitle,
  className = "",
  headerAction,
  bgWhite = false,
  textAlign = "left",
  builderClassName = "",
  builderStyle = {},
}: SectionWrapperProps) {
  const isCenter = textAlign === "center";
  const isRight = textAlign === "right";

  const headerLayoutClass = isCenter
    ? "flex flex-col items-center text-center justify-center mb-3 lg:mb-6"
    : isRight
      ? "flex flex-col md:flex-row-reverse md:items-end justify-between gap-4 mb-3 lg:mb-6 text-right ml-auto"
      : "flex flex-col md:flex-row md:items-end justify-between gap-4 mb-3 lg:mb-6";

  const defaultPadding = "py-2 lg:py-10";
  const defaultBg = bgWhite ? "bg-white" : "bg-[var(--color-off-white)]";

  const hasCustomColor =
    !!builderStyle?.color || builderClassName?.includes("text-");

  // Fallback for builder title to allow HTML inside
  const displayTitle = title || "";

  return (
    <section className={cn(defaultPadding, defaultBg, className)}>
      <div className="container mx-auto px-1 sm:px-6 lg:px-8">
        {(eyebrow || title || subtitle || headerAction) && (
          <div className={headerLayoutClass}>
            <div
              className={
                isCenter ? "flex flex-col items-center text-center" : ""
              }
            >
              {eyebrow && (
                <p className="font-display text-[11px] font-bold tracking-[2px] uppercase text-[var(--color-lime)] flex items-center gap-2 mb-2.5">
                  {!isCenter && !isRight && (
                    <span className="block w-[22px] h-[2px] bg-[var(--color-lime)]"></span>
                  )}
                  {eyebrow}
                  {isRight && (
                    <span className="block w-[22px] h-[2px] bg-[var(--color-lime)]"></span>
                  )}
                </p>
              )}
              {title && (
                <h2
                  data-field="title"
                  className={cn(
                    "font-display text-[24px] md:text-[36px] font-black uppercase text-[var(--color-olive)] leading-none tracking-[-0.5px] mb-2 cursor-text",
                    hasCustomColor && "text-inherit",
                  )}
                  dangerouslySetInnerHTML={{ __html: displayTitle }}
                />
              )}
              {subtitle && (
                <p
                  data-field="subtitle"
                  className={cn(
                    "text-[14px] text-[#7A7A7A] leading-[1.65] max-w-[540px] font-body cursor-text",
                    hasCustomColor && "text-inherit opacity-80",
                    isCenter && "mx-auto",
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="flex-shrink-0 mt-4 md:mt-0">{headerAction}</div>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
