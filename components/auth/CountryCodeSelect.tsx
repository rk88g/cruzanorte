"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { COUNTRY_CODE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CountryCodeSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

const countryCodeLabels: Record<string, string> = {
  "+52": "Mexico (+52)",
  "+1": "Estados Unidos (+1)",
  "+57": "Colombia (+57)",
  "+502": "Guatemala (+502)",
  "+504": "Honduras (+504)",
  "+503": "El Salvador (+503)",
  "+505": "Nicaragua (+505)",
  "+506": "Costa Rica (+506)",
  "+507": "Panama (+507)",
  "+58": "Venezuela (+58)",
  "+593": "Ecuador (+593)",
  "+51": "Peru (+51)"
};

export const CountryCodeSelect = forwardRef<HTMLSelectElement, CountryCodeSelectProps>(
  function CountryCodeSelect({ className, ...props }, ref) {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "min-h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-11 text-base font-medium text-foreground shadow-soft outline-none transition hover:border-primary/70 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm",
            className
          )}
          ref={ref}
          {...props}
        >
          {COUNTRY_CODE_OPTIONS.map((country) => (
            <option className="bg-background text-foreground" key={country.value} value={country.value}>
              {countryCodeLabels[country.value] ?? country.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    );
  }
);
