"use client";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '../dropzone';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Field {
  name: string;
  label: string;
  type: string;
  validations?: string[];
  description?: string;
  item_type?: string;
  relation?: {
    table: string;
    value_field: string;
    label_field: string;
  };
  bucket?: string;
  storage_path?: string;
  acl?: string;
}

interface DynamicFormProps {
  fields: Field[];
  tableName: string;
  onSubmit?: (values: Record<string, any>) => void;
  initialValues?: Record<string, any>;
  mode?: 'create' | 'edit';
  recordId?: string;
}

export default function DynamicForm({ fields, tableName, onSubmit, initialValues, mode = 'create', recordId }: DynamicFormProps) {
  const router = useRouter();
  console.log("table", tableName);
  const [values, setValues] = useState<Record<string, any>>(() => {
    if (initialValues) return { ...initialValues };
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "checkbox") initial[f.name] = false;
      else if (f.type === "array") initial[f.name] = [];
      else initial[f.name] = "";
    });
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [relationOptions, setRelationOptions] = useState<Record<string, Array<{ value: any; label: string }>>>({});
  const [tagInput, setTagInput] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValues) setValues({ ...initialValues });
  }, [initialValues]);

  useEffect(() => {
    const loadRelations = async () => {
      const relationFields = fields.filter((f) => f.type === "relation" && f.relation);
  
      const results = await Promise.all(
        relationFields.map(async (field) => {
          const { relation } = field;
          const { data, error } = await supabase
            .from(relation.table)
            .select(`${relation.value_field}, ${relation.label_field}`);
  
          if (error) {
            console.error(`Error loading relation for field "${field.name}" from table "${relation.table}":`, error);
            return { name: field.name, options: [] };
          }
  
          if (!data || data.length === 0) {
            console.warn(`No relation data found for field "${field.name}"`);
          }
  
          return {
            name: field.name,
            options: data.map((row: any) => ({
              value: row[relation.value_field],
              label: row[relation.label_field],
            })),
          };
        })
      );
  
      const newOptions: Record<string, any[]> = {};
      results.forEach((r) => {
        newOptions[r.name] = r.options;
      });
  
      setRelationOptions(newOptions);
    };
  
    loadRelations();
  }, [fields]);

  // Debug: log relationOptions state
  console.log('relationOptions', relationOptions);

  function handleChange(name: string, value: any) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleTagInputChange(name: string, value: string) {
    setTagInput((prev) => ({ ...prev, [name]: value }));
  }

  function handleTagInputKeyDown(name: string, e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "," || e.key === "Enter") && tagInput[name]?.trim()) {
      e.preventDefault();
      const newTag = tagInput[name].trim();
      if (!values[name].includes(newTag)) {
        setValues((prev) => ({ ...prev, [name]: [...prev[name], newTag] }));
      }
      setTagInput((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function removeTag(name: string, tag: string) {
    setValues((prev) => ({ ...prev, [name]: prev[name].filter((t: string) => t !== tag) }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.validations?.includes("required")) {
        if (f.type === "array" && (!values[f.name] || values[f.name].length === 0)) {
          errs[f.name] = "Required";
        } else if (!values[f.name]) {
          errs[f.name] = "Required";
        }
      }
      if (f.validations) {
        const max = f.validations.find((v) => v.startsWith("max:"));
        if (max) {
          const maxVal = Number.parseInt(max.split(":")[1], 10);
          if (values[f.name] && values[f.name].length > maxVal) {
            errs[f.name] = `Max length is ${maxVal}`;
          }
        }
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) {
      onSubmit(values);
    } else if (tableName) {
      const cleanValues = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== "")
      );
      let data, error;
      if (mode === 'edit' && recordId) {
        ({ data, error } = await supabase.from(tableName).update(cleanValues).eq('id', recordId).select());
      } else {
        ({ data, error } = await supabase.from(tableName).insert([cleanValues]).select());
      }
      console.log(mode === 'edit' ? "Update result:" : "Insert result:", { data, error });
      if (error) {
        alert(`Error: ${error.message}`);
      } else if (data && data[0] && data[0].id) {
        router.push(`/forms/${tableName}/${data[0].id}/edit`);
      } else {
        alert("Saved, but could not get record ID.");
      }
    } else {
      console.log(values);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto p-8 bg-zinc-900 rounded-lg shadow">
      {fields.map((field) => (
        <div key={field.name} className="mb-6">
          <Label htmlFor={field.name} className="block mb-2 text-base font-medium">{field.label}</Label>
          {field.type === 'file' && mode === 'edit' && recordId ? (
            (() => {
              const upload = useSupabaseUpload({
                bucketName: field.bucket,
                path: field.storage_path,
                allowedMimeTypes: field.validations?.includes('image') ? ['image/*'] : undefined,
                maxFiles: 1,
                upsert: true,
              });

              const handleFileUpload = async () => {
                await upload.onUpload();
                if (upload.isSuccess && upload.files.length > 0) {
                  const file = upload.files[0];
                  const { data, error } = await supabase.from('forms.files').insert({
                    resource_id: recordId,
                    resource_table_name: tableName,
                    field_name: field.name,
                    bucket: field.bucket,
                    path: `${field.storage_path}/${file.name}`,
                    acl: field.acl || 'public',
                    filename: file.name,
                    mime_type: file.type,
                    size: file.size,
                    metadata: {},
                  });
                  if (error) {
                    alert(`Error saving file metadata: ${error.message}`);
                  }
                }
              };

              return (
                <Dropzone {...upload}>
                  <DropzoneEmptyState />
                  <DropzoneContent />
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleFileUpload}
                    disabled={upload.loading || upload.files.some(f => f.errors.length > 0)}
                  >
                    Upload File
                  </button>
                </Dropzone>
              );
            })()
          ) : null}
          {field.type === "text" && (
            <Input
              id={field.name}
              className="mb-1 px-4 py-2"
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.validations?.includes("required")}
              maxLength={field.validations?.find((v) => v.startsWith("max:"))?.split(":")[1]}
            />
          )}
          {field.type === "textarea" && (
            <Textarea
              id={field.name}
              className="mb-1 px-4 py-2"
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.validations?.includes("required")}
              maxLength={field.validations?.find((v) => v.startsWith("max:"))?.split(":")[1]}
            />
          )}
          {field.type === "checkbox" && (
            <input
              id={field.name}
              type="checkbox"
              className="w-4 h-4 align-middle mr-2"
              checked={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.checked)}
            />
          )}
          {field.type === "array" && (
            <div className="flex flex-wrap gap-2 items-center">
              {values[field.name].map((tag: string) => (
                <span key={tag} className="inline-flex items-center bg-zinc-800 text-zinc-100 px-2 py-1 rounded-full text-xs">
                  {tag}
                  <button
                    type="button"
                    className="ml-2 text-zinc-400 hover:text-red-400"
                    onClick={() => removeTag(field.name, tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <Input
                id={field.name + "-tag-input"}
                className="w-auto min-w-[120px] px-2 py-1"
                value={tagInput[field.name] || ""}
                onChange={(e) => handleTagInputChange(field.name, e.target.value)}
                onKeyDown={(e) => handleTagInputKeyDown(field.name, e)}
                placeholder="Add tag"
              />
            </div>
          )}
          {field.type === "relation" && relationOptions[field.name] && (
            <select
              id={field.name}
              className="mb-1 px-4 py-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-100"
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.validations?.includes("required")}
            >
              <option value="">Select {field.label}</option>
              {relationOptions[field.name].map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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