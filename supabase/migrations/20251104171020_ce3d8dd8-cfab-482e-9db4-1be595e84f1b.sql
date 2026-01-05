-- Fix RLS policies for time_entries and overtime_entries tables

-- Drop existing policies for time_entries
DROP POLICY IF EXISTS "time_entries_select_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_insert_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_update_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_delete_policy" ON public.time_entries;

-- Create simplified policies for time_entries
-- Users can view their own time entries
CREATE POLICY "time_entries_select_policy" 
ON public.time_entries 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own time entries
CREATE POLICY "time_entries_insert_policy" 
ON public.time_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own time entries
CREATE POLICY "time_entries_update_policy" 
ON public.time_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own time entries
CREATE POLICY "time_entries_delete_policy" 
ON public.time_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Drop existing policies for overtime_entries
DROP POLICY IF EXISTS "Users can view their overtime entries" ON public.overtime_entries;

-- Create simplified policies for overtime_entries (using employee_id)
-- Users can view their own overtime entries
CREATE POLICY "overtime_entries_select_policy" 
ON public.overtime_entries 
FOR SELECT 
USING (auth.uid() = employee_id);

-- Users can insert their own overtime entries
CREATE POLICY "overtime_entries_insert_policy" 
ON public.overtime_entries 
FOR INSERT 
WITH CHECK (auth.uid() = employee_id);

-- Users can update their own overtime entries
CREATE POLICY "overtime_entries_update_policy" 
ON public.overtime_entries 
FOR UPDATE 
USING (auth.uid() = employee_id);

-- Users can delete their own overtime entries
CREATE POLICY "overtime_entries_delete_policy" 
ON public.overtime_entries 
FOR DELETE 
USING (auth.uid() = employee_id);