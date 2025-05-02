"use client";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface Field {
  name: string;
  label: string;
  type: string;
  validations?: string[];
  description?: string;
}

interface DynamicFormProps {
  fields: Field[];
  onSubmit?: (values: Record<string, any>) => void;
}

export default function DynamicForm({ fields, onSubmit }: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      initial[f.name] = f.type === "checkbox" ? false : "";
    });
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(name: string, value: any) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.validations?.includes("required") && !values[f.name]) {
        errs[f.name] = "Required";
      }
      if (f.validations) {
        const max = f.validations.find((v) => v.startsWith("max:"));
        if (max) {
          const maxVal = parseInt(max.split(":")[1], 10);
          if (values[f.name] && values[f.name].length > maxVal) {
            errs[f.name] = `Max length is ${maxVal}`;
          }
        }
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) onSubmit(values);
    else console.log(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name}>
          <Label htmlFor={field.name}>{field.label}</Label>
          {field.type === "text" && (
            <Input
              id={field.name}
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.validations?.includes("required")}
              maxLength={field.validations?.find((v) => v.startsWith("max:"))?.split(":")[1]}
            />
          )}
          {field.type === "textarea" && (
            <Textarea
              id={field.name}
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.validations?.includes("required")}
              maxLength={field.validations?.find((v) => v.startsWith("max:"))?.split(":")[1]}
            />
          )}
          {field.type === "checkbox" && (
            <Input
              id={field.name}
              type="checkbox"
              checked={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.checked)}
            />
          )}
          {field.description && (
            <div className="text-xs text-zinc-400 mt-1">{field.description}</div>
          )}
          {errors[field.name] && (
            <div className="text-xs text-red-500 mt-1">{errors[field.name]}</div>
          )}
        </div>
      ))}
      <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Submit</button>
    </form>
  );
} 