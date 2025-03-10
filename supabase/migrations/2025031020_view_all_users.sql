-- 🔸 Krok 1: Utwórz tabelę users (optymalna definicja): --

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

--- 🔸 Krok 2: Utwórz funkcję pomocniczą (eliminuje problem rekurencji): ---
CREATE OR REPLACE FUNCTION public.is_admin_of_business(business_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() 
      AND role = 'admin' 
      AND business_id = business_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


--- 🔸 Krok 3: Stwórz kompletne polityki RLS dla tabeli ---

-- Polityka na odczyt swoich danych
CREATE POLICY "Users can view their own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admin może widzieć wszystkich użytkowników tego samego biznesu
CREATE POLICY "Admins can view all users from their business"
ON users
FOR SELECT
TO authenticated
USING (public.is_admin_of_business(business_id));

-- Polityka umożliwiająca użytkownikowi utworzenie swojego profilu
CREATE POLICY "Users can insert their own profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Polityka umożliwiająca aktualizację własnych danych
CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);
