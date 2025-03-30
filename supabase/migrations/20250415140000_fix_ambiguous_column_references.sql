/*
  # Fix Ambiguous Column References in SQL Functions
  
  1. Changes
    - Fix ambiguous column references in SQL functions and policies
    - Qualify all column references with their table names
*/

-- Fix the is_user_assigned_to_task function to qualify the column references
CREATE OR REPLACE FUNCTION public.is_user_assigned_to_task(task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM task_assignments ta
    WHERE ta.task_id = $1
    AND ta.user_id = (SELECT user_id FROM users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the can_manage_task function to qualify the column references
CREATE OR REPLACE FUNCTION public.can_manage_task(task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tasks t
    JOIN users u ON u.business_id = t.business_id
    WHERE t.id = $1
    AND u.id = auth.uid()
    AND (u.role = 'manager' OR u.role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the sync_task_completion_status function
CREATE OR REPLACE FUNCTION sync_task_completion_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If all assignments for a task are completed, mark the task as completed
  IF TG_OP = 'UPDATE' AND NEW.completed = TRUE THEN
    UPDATE tasks t
    SET completed = TRUE,
        completed_at = CURRENT_TIMESTAMP
    WHERE t.id = NEW.task_id
    AND NOT EXISTS (
      SELECT 1 FROM task_assignments ta
      WHERE ta.task_id = NEW.task_id
      AND ta.completed = FALSE
    );
  END IF;
  
  -- If any assignment is not completed, ensure task is marked as not completed
  IF TG_OP = 'UPDATE' AND NEW.completed = FALSE THEN
    UPDATE tasks t
    SET completed = FALSE,
        completed_at = NULL
    WHERE t.id = NEW.task_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update task assignment policies with qualified column references
DROP POLICY IF EXISTS "Task assignment visibility policy" ON task_assignments;
CREATE POLICY "Task assignment visibility policy"
ON task_assignments
FOR SELECT
TO authenticated
USING (
  (
    SELECT u.user_id FROM users u WHERE u.id = auth.uid()
  ) = task_assignments.user_id
  OR 
  can_manage_task(task_assignments.task_id)
);

DROP POLICY IF EXISTS "Task assignment update policy" ON task_assignments;
CREATE POLICY "Task assignment update policy"
ON task_assignments
FOR UPDATE
TO authenticated
USING (
  (
    SELECT u.user_id FROM users u WHERE u.id = auth.uid()
  ) = task_assignments.user_id
  OR 
  can_manage_task(task_assignments.task_id)
); 