/*
  # Migrate Existing Task Assignments to New Junction Table
  
  1. Changes
    - Migrate all existing task assignments from tasks.assigned_to to task_assignments
    - Ensures backward compatibility with existing data
*/

-- Insert task assignment records for all existing tasks
INSERT INTO task_assignments (task_id, user_id, completed, completed_at, verification_photo_url)
SELECT 
  id as task_id,
  assigned_to as user_id,
  completed,
  completed_at,
  verification_photo_url
FROM tasks
WHERE assigned_to IS NOT NULL
ON CONFLICT (task_id, user_id) DO NOTHING;

-- Set task-level verification photo URL to NULL if migrated to task_assignments
-- This is to avoid duplication of data
UPDATE tasks
SET verification_photo_url = NULL
WHERE assigned_to IS NOT NULL;

-- Add a trigger to maintain backward compatibility during transition period
CREATE OR REPLACE FUNCTION sync_task_completion_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If all assignments for a task are completed, mark the task as completed
  IF TG_OP = 'UPDATE' AND NEW.completed = TRUE THEN
    UPDATE tasks
    SET completed = TRUE,
        completed_at = CURRENT_TIMESTAMP
    WHERE id = NEW.task_id
    AND NOT EXISTS (
      SELECT 1 FROM task_assignments
      WHERE task_id = NEW.task_id
      AND completed = FALSE
    );
  END IF;
  
  -- If any assignment is not completed, ensure task is marked as not completed
  IF TG_OP = 'UPDATE' AND NEW.completed = FALSE THEN
    UPDATE tasks
    SET completed = FALSE,
        completed_at = NULL
    WHERE id = NEW.task_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_task_completion
AFTER UPDATE ON task_assignments
FOR EACH ROW
EXECUTE FUNCTION sync_task_completion_status(); 