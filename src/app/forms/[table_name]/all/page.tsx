import { createClient } from '@supabase/supabase-js';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type Field = { 
  name: string; 
  label?: string;
  views?: { name: string; display: string }[];
};

export default async function RecordsListPage({ params }: { params: Promise<{ table_name: string }> }) {
  const resolvedParams = await params;
  
  // 1. Fetch the form JSON schema for this table
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('json')
    .eq('table_name', resolvedParams.table_name)
    .single();

  if (formError) {
    return <div className="text-red-500 p-8">Error loading form schema: {formError.message}</div>;
  }

  const allFields: Field[] = form?.json?.fields || [];
  
  // Filter out fields that should be hidden in the "all" view
  const fields = allFields.filter(field => {
    console.log(field);
    if (!field.views) return true;
    const allView = field.views.find(view => view.name === 'all');
    return !allView || allView.display !== 'none';
  });
  
  const fieldNames = fields.map((f) => f.name);

  // 2. Fetch all records from the specified table
  let records: Record<string, unknown>[] = [];
  let recordsError: { message: string } | null = null;
  try {
    const { data, error } = await supabase.from(resolvedParams.table_name).select('*');
    if (error) recordsError = error;
    else records = data || [];
  } catch (e) {
    recordsError = { message: (e as Error).message };
  }

  if (recordsError) {
    return <div className="text-red-500 p-8">Error loading records: {recordsError.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold capitalize">{resolvedParams.table_name} Records</h1>
        <Link
          href={`/forms/${resolvedParams.table_name}/create`}
          className="inline-block px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold"
        >
          + Create
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map((field) => (
              <TableHead key={field.name}>{field.label || field.name}</TableHead>
            ))}
            <TableHead>Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={String(record.id) || String(record[fields[0]?.name])}>
              {fieldNames.map((name) => (
                <TableCell key={name}>{String(record[name] ?? '')}</TableCell>
              ))}
              <TableCell>
                <Link
                  href={`/forms/${resolvedParams.table_name}/${record.id}/edit`}
                  className="inline-block px-3 py-1 rounded bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                >
                  Edit
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {records.length === 0 && <div className="text-zinc-400 mt-6">No records found.</div>}
    </div>
  );
} 