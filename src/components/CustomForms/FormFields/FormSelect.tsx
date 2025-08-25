"use client";

import { useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FormSelectProps } from "../types";

export function FormSelect({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  options,
}: FormSelectProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;
  const currentValue = watch(name);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        <bdi>
          {label}
          {required && <span className="text-destructive ms-1">*</span>}
        </bdi>
      </Label>

      <Select
        value={currentValue || ""}
        onValueChange={(value) => setValue(name, value)}
        disabled={disabled}
      >
        <SelectTrigger
          className={error ? "border-destructive" : ""}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
