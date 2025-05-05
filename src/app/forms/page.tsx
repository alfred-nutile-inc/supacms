import { createClient } from '@supabase/supabase-js';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function FormsListPage() {
  const { data: forms, error } = await supabase.from('forms').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forms</h1>
        <Button type="button" disabled>New Form (coming soon)</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Table Name</TableHead>
            <TableHead>View All</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms?.map(form => (
            <TableRow key={form.id}>
              <TableCell>{form.name}</TableCell>
              <TableCell>{form.table_name}</TableCell>
              <TableCell>
                <Button asChild variant="link">
                  <a href={`/forms/${form.table_name}/all`}>View All</a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {error && <div className="text-red-500 mt-4">{error.message}</div>}
    </div>
  );
} 