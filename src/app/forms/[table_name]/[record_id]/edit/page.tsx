import { createClient } from '@/lib/supabase/server';
import DynamicForm from '@/components/forms/DynamicForm';

export default async function EditRecordPage({ 
  params 
}: { 
  params: Promise<{ table_name: string; record_id: string }> 
}) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // 1. Fetch the form JSON schema for this table
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('json')
    .eq('table_name', resolvedParams.table_name)
    .single();

  // 2. Fetch the existing record by ID
  const { data: record, error: recordError } = await supabase
    .from(resolvedParams.table_name)
    .select('*')
    .eq('id', resolvedParams.record_id)
    .single();

  if (formError) {
    return <div className="text-red-500 p-8">Error loading form schema: {formError.message}</div>;
  }
  if (recordError) {
    return <div className="text-red-500 p-8">Error loading record: {recordError.message}</div>;
  }
  if (!form?.json?.fields || !record) {
    return <div className="text-zinc-400 p-8">Form or record not found.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit {resolvedParams.table_name} Record</h1>
      <DynamicForm
        fields={form.json.fields}
        tableName={resolvedParams.table_name}
        initialValues={record}
        mode="edit"
        recordId={resolvedParams.record_id}
      />
    </div>
  );
} 