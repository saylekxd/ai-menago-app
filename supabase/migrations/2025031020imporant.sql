-- Tworzenie tabeli users z poprawionym kluczem podstawowym
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'worker')),
  business_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Tworzenie tabeli businesses
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view businesses"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only managers can update businesses"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = auth.uid()
      AND users.business_id = businesses.id
      AND (users.role = 'manager' OR users.role = 'admin')
    )
  );

-- Tworzenie tabeli tasks z poprawionymi kluczami obcymi
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  assigned_to UUID NOT NULL REFERENCES users(user_id),
  created_by UUID NOT NULL REFERENCES users(user_id),
  requires_photo BOOLEAN DEFAULT FALSE,
  verification_photo_url TEXT,
  completed_at TIMESTAMPTZ,
  business_id UUID NOT NULL REFERENCES businesses(id)
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks assigned to them"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    assigned_to = (SELECT user_id FROM users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = auth.uid()
      AND users.business_id = tasks.business_id
      AND (users.role = 'manager' OR users.role = 'admin')
    )
  );

CREATE POLICY "Users can update tasks assigned to them"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    assigned_to = (SELECT user_id FROM users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = auth.uid()
      AND users.business_id = tasks.business_id
      AND (users.role = 'manager' OR users.role = 'admin')
    )
  );

CREATE POLICY "Only managers can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = auth.uid()
      AND users.business_id = tasks.business_id
      AND (users.role = 'manager' OR users.role = 'admin')
    )
  );

-- Tworzenie tabeli task_performance z poprawionym kluczem obcym
CREATE TABLE IF NOT EXISTS task_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  pending_tasks INTEGER NOT NULL DEFAULT 0,
  overdue_tasks INTEGER NOT NULL DEFAULT 0,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE task_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own performance"
  ON task_performance
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT user_id FROM users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1
      FROM users u
      JOIN users auth_user ON auth_user.id = auth.uid()
      WHERE u.user_id = task_performance.user_id
      AND u.business_id = auth_user.business_id
      AND (auth_user.role = 'manager' OR auth_user.role = 'admin')
    )
  );



---  Dodaj dodatkowo politykę pozwalającą uwierzytelnionym użytkownikom na wstawianie danych do tabeli users. ---

CREATE POLICY "Authenticated users can insert their own profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());