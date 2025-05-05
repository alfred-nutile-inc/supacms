import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default async function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // User is logged in, redirect to forms
    redirect('/forms');
  } else {
    // User is not logged in, redirect to login
    redirect('/auth/login');
  }
  
  // This part will never be rendered since we always redirect
  return null;
}
