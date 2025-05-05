import { createClient } from '@supabase/supabase-js';
import DynamicForm from '@/components/forms/DynamicForm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function CreateRecordPage({ params }: { params: Promise<{ table_name: string }> }) {
  const resolvedParams = await params;
  
  // Fetch the form JSON schema for this table
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('json')
    .eq('table_name', resolvedParams.table_name)
    .single();

  if (formError) {
    return <div className="text-red-500 p-8">Error loading form schema: {formError.message}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create {resolvedParams.table_name} Record</h1>
      <DynamicForm fields={form?.json?.fields || []} tableName={resolvedParams.table_name} />
    </div>
  );
} 