"use client";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Dropzone, DropzoneContent, DropzoneEmptyState, useDropzoneContext } from '../dropzone';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import { Button } from "../ui/button";
import { File, Loader2, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import MDEditor from '@uiw/react-md-editor';

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

// Custom DropzoneContent without the default Upload files button
const CustomDropzoneContent = ({ className }: { className?: string }) => {
  const {
    files,
    setFiles,
    loading,
    successes,
    errors,
    maxFileSize,
    isSuccess,
  } = useDropzoneContext();

  const handleRemoveFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  if (isSuccess) {
    return (
      <div className={cn('flex flex-row items-center gap-x-2 justify-center', className)}>
        <CheckCircle size={16} className="text-primary" />
        <p className="text-primary text-sm">
          Successfully uploaded {files.length} file{files.length > 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {files.map((file, idx) => {
        const fileError = errors.find((e) => e.name === file.name);
        const isSuccessfullyUploaded = !!successes.find((e) => e === file.name);

        return (
          <div
            key={`${file.name}-${idx}`}
            className="flex items-center gap-x-4 border-b py-2 first:mt-4 last:mb-4"
          >
            {file.type.startsWith('image/') ? (
              <div className="h-10 w-10 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                <img src={file.preview} alt={file.name} className="object-cover" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center">
                <File size={18} />
              </div>
            )}

            <div className="shrink grow flex flex-col items-start truncate">
              <p title={file.name} className="text-sm truncate max-w-full">
                {file.name}
              </p>
              {file.errors.length > 0 ? (
                <p className="text-xs text-destructive">
                  {file.errors
                    .map((e) =>
                      e.message.startsWith('File is larger than')
                        ? `File is larger than ${formatBytes(maxFileSize, 2)} (Size: ${formatBytes(file.size, 2)})`
                        : e.message
                    )
                    .join(', ')}
                </p>
              ) : loading && !isSuccessfullyUploaded ? (
                <p className="text-xs text-muted-foreground">Uploading file...</p>
              ) : !!fileError ? (
                <p className="text-xs text-destructive">Failed to upload: {fileError.message}</p>
              ) : isSuccessfullyUploaded ? (
                <p className="text-xs text-primary">Successfully uploaded file</p>
              ) : (
                <p className="text-xs text-muted-foreground">{formatBytes(file.size, 2)}</p>
              )}
            </div>

            {!loading && !isSuccessfullyUploaded && (
              <Button
                size="icon"
                variant="link"
                className="shrink-0 justify-self-end text-muted-foreground hover:text-foreground"
                onClick={() => handleRemoveFile(file.name)}
              >
                <X />
              </Button>
            )}
          </div>
        );
      })}
      {/* No Upload files button here */}
    </div>
  );
};

// Helper function to format bytes
const formatBytes = (
  bytes: number,
  decimals = 2,
  size?: 'bytes' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB' | 'ZB' | 'YB'
) => {
  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (bytes === 0 || bytes === undefined) return size !== undefined ? `0 ${size}` : '0 bytes';
  const i = size !== undefined ? sizes.indexOf(size) : Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

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
  const [existingFiles, setExistingFiles] = useState<Record<string, any[]>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialValues) setValues({ ...initialValues });
  }, [initialValues]);

  useEffect(() => {
    const loadRelations = async () => {
      const relationFields = fields.filter((f) => f.type === "relation" && f.relation);
  
      const results = await Promise.all(
        relationFields.map(async (field) => {
          const { relation } = field;
          if (!relation) {
            return { name: field.name, options: [] };
          }
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

  // Define fetchExistingFiles as a named function
  const fetchExistingFiles = async () => {
    if (mode === 'edit' && recordId) {
      console.log('Fetching files for record:', recordId, 'in table:', tableName);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('resource_id', recordId)
        .eq('resource_table_name', tableName);
      
      if (error) {
        console.error('Error fetching files:', error);
        return;
      }
      
      console.log('Found files:', data);
      if (data && data.length > 0) {
        // Group files by field_name
        const filesByField: Record<string, any[]> = {};
        data.forEach(file => {
          if (!filesByField[file.field_name]) {
            filesByField[file.field_name] = [];
          }
          filesByField[file.field_name].push(file);
        });
        setExistingFiles(filesByField);
        console.log('Grouped files by field:', filesByField);
      }
    }
  };
  
  useEffect(() => {
    // Fetch existing files for this record if we're in edit mode
    fetchExistingFiles();
  }, [mode, recordId, tableName]);

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
      // Filter out file fields from values before submitting
      const cleanValues = Object.fromEntries(
        Object.entries(values)
          .filter(([key, v]) => v !== "" && !fields.find(f => f.name === key && f.type === 'file'))
      );
      
      console.log('Submitting form with cleaned values (excluding file fields):', cleanValues);
      
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

  // Add a function to delete a file
  const handleDeleteFile = async (file: any) => {
    if (!file || !file.id) return;
    
    // Set loading state for this file
    setIsDeleting(prev => ({ ...prev, [file.id]: true }));
    
    try {
      console.log('Deleting file:', file);
      
      // Try different approaches to deleting the file from storage
      if (file.bucket && file.path) {
        // Log all possible paths to help debug
        console.log('Attempting file deletion with the following paths:');
        
        // Path directly from database
        const dbPath = file.path;
        console.log('1. Database path:', dbPath);
        
        // Path with 'public/' removed if it exists
        let noPublicPath = file.path;
        if (noPublicPath.startsWith('public/')) {
          noPublicPath = noPublicPath.replace('public/', '');
        }
        console.log('2. Path without public prefix:', noPublicPath);
        
        // Path with just the filename
        const pathParts = file.path.split('/');
        const filenameOnly = pathParts[pathParts.length - 1];
        console.log('3. Filename only:', filenameOnly);
        
        // Try deleting with the original path first
        console.log(`Attempting to delete from bucket "${file.bucket}" with path "${dbPath}"`);
        let { error: storageError1 } = await supabase
          .storage
          .from(file.bucket)
          .remove([dbPath]);
        
        if (storageError1) {
          console.error('First deletion attempt failed:', storageError1);
          
          // Try with the no public prefix path
          console.log(`Attempting to delete from bucket "${file.bucket}" with path "${noPublicPath}"`);
          let { error: storageError2 } = await supabase
            .storage
            .from(file.bucket)
            .remove([noPublicPath]);
          
          if (storageError2) {
            console.error('Second deletion attempt failed:', storageError2);
            
            // Try with just the filename as a last resort
            console.log(`Attempting to delete from bucket "${file.bucket}" with filename "${filenameOnly}"`);
            let { error: storageError3 } = await supabase
              .storage
              .from(file.bucket)
              .remove([filenameOnly]);
            
            if (storageError3) {
              console.error('Third deletion attempt failed:', storageError3);
              console.warn('All storage deletion attempts failed. Will continue with database deletion.');
            } else {
              console.log('Successfully deleted file using filename only!');
            }
          } else {
            console.log('Successfully deleted file using path without public prefix!');
          }
        } else {
          console.log('Successfully deleted file using original database path!');
        }
      } else {
        console.error('Missing bucket or path information for file:', file);
      }
      
      // Then, delete from files table
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);
      
      if (dbError) {
        console.error('Error deleting file record:', dbError);
        alert(`Error deleting file record: ${dbError.message}`);
        return;
      }
      
      console.log('File record successfully deleted from database');
      
      // Update UI by removing the file from state
      setExistingFiles(prev => {
        const newFiles = { ...prev };
        
        // Find which field this file belongs to
        Object.keys(newFiles).forEach(fieldName => {
          newFiles[fieldName] = newFiles[fieldName].filter(f => f.id !== file.id);
        });
        
        return newFiles;
      });
      
      console.log('File removed from UI');
    } catch (err) {
      console.error('Error in delete process:', err);
      alert('An unexpected error occurred while deleting the file');
    } finally {
      setIsDeleting(prev => ({ ...prev, [file.id]: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto p-8 bg-zinc-900 rounded-lg shadow">
      {fields.map((field) => (
        <div key={field.name} className="mb-6">
          <Label htmlFor={field.name} className="block mb-2 text-base font-medium">{field.label}</Label>
          {field.type === 'file' && mode === 'edit' && recordId ? (
            (() => {
              const upload = useSupabaseUpload({
                bucketName: field.bucket || '',
                path: field.storage_path || '',
                allowedMimeTypes: field.validations?.includes('image') ? ['image/*'] : undefined,
                maxFiles: 1,
                upsert: true,
              });

              // Monitor changes to files array for automatic uploads
              useEffect(() => {
                // Check if there are successfully uploaded files
                const hasSuccessfulUploads = upload.isSuccess && upload.files.length > 0;
                
                if (hasSuccessfulUploads) {
                  console.log('Detected successful file upload, saving metadata...');
                  saveFileMetadata();
                }
              }, [upload.isSuccess, upload.files.length]);
              
              // Extract file save logic to its own function
              const saveFileMetadata = async () => {
                if (!upload.isSuccess || upload.files.length === 0) return;
                
                const file = upload.files[0];
                console.log('Saving metadata for file:', file);
                
                // Get the resource_table_name from the form.json.form_name if available, otherwise use tableName
                let resource_table = tableName;
                
                // Format the path to match what would be in storage
                const fullPath = field.storage_path ? `${field.storage_path}/${file.name}` : file.name;
                
                console.log('Inserting into files table with:', {
                  resource_id: recordId,
                  resource_table_name: resource_table,
                  field_name: field.name,
                  fullPath,
                });
                
                // Create the file metadata record
                const { data, error } = await supabase
                  .from('files')
                  .insert({
                    resource_id: recordId,
                    resource_table_name: resource_table,
                    field_name: field.name,
                    bucket: field.bucket || '',
                    path: fullPath,
                    acl: field.acl || 'public',
                    filename: file.name,
                    mime_type: file.type,
                    size: file.size,
                    metadata: {},
                  })
                  .select();
                
                console.log('File metadata insert result:', { data, error });
                
                if (error) {
                  alert(`Error saving file metadata: ${error.message}`);
                  console.error('File metadata insert error:', error);
                } else {
                  // For file fields, we don't need to update the main record
                  // We'll just rely on the relationship through the files table
                  console.log('File metadata saved successfully. Not updating main record for file fields.');
                  
                  // Force a refresh of the file list after successful upload
                  await fetchExistingFiles();
                }
              };

              return (
                <div>
                  {/* Show existing files if any */}
                  {existingFiles[field.name] && existingFiles[field.name].length > 0 ? (
                    <div className="mb-4 space-y-2">
                      <h4 className="text-sm font-medium text-zinc-400">Current files:</h4>
                      {existingFiles[field.name].map(file => (
                        <div key={file.id} className="flex items-center p-2 bg-zinc-800 rounded">
                          <span className="mr-auto text-sm">{file.filename}</span>
                          <span className="text-xs text-zinc-400 mx-2">({file.path})</span>
                          {file.mime_type?.startsWith('image/') && (
                            <img 
                              src={`${supabaseUrl}/storage/v1/object/public/${file.bucket}/${file.path}`}
                              alt={file.filename}
                              className="h-10 w-10 object-cover rounded"
                            />
                          )}
                          <button
                            type="button"
                            className="ml-2 px-2 py-1 rounded text-red-400 hover:bg-red-900 hover:text-white"
                            onClick={() => handleDeleteFile(file)}
                            disabled={isDeleting[file.id]}
                          >
                            {isDeleting[file.id] ? (
                              <span className="text-xs">Deleting...</span>
                            ) : (
                              <span>×</span>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-400 mb-2">No files uploaded yet</div>
                  )}

                  <Dropzone {...upload}>
                    <DropzoneEmptyState />
                    <CustomDropzoneContent />
                    {upload.files.length > 0 && !upload.isSuccess && (
                      <div className="mt-2 text-center">
                        <button
                          type="button"
                          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 w-full"
                          onClick={upload.onUpload}
                          disabled={upload.loading || upload.files.some(f => f.errors.length > 0)}
                        >
                          {upload.loading ? 'Uploading...' : 'Upload to Storage'}
                        </button>
                      </div>
                    )}
                  </Dropzone>
                </div>
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
            <div data-color-mode="dark">
              <MDEditor
                id={field.name}
                value={values[field.name]}
                onChange={(value) => handleChange(field.name, value || "")}
                textareaProps={{
                  required: field.validations?.includes("required"),
                  maxLength: field.validations?.find((v) => v.startsWith("max:"))?.split(":")[1]
                }}
              />
            </div>
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