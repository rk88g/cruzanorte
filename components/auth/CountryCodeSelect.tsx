"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { COUNTRY_CODE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CountryCodeSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const CountryCodeSelect = forwardRef<HTMLSelectElement, CountryCodeSelectProps>(
  function CountryCodeSelect({ className, ...props }, ref) {
    return (
      <select
        className={cn(
          "min-h-12 rounded-lg border border-border bg-background px-4 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
          className
        )}
        ref={ref}
        {...props}
      >
        {COUNTRY_CODE_OPTIONS.map((country) => (
          <option key={country.value} value={country.value}>
            {country.label} {country.value}
          </option>
        ))}
      </select>
    );
  }
);
