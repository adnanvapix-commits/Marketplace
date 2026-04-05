-- Migration: home_experience_migration.sql
-- Adds whatsapp_number and username columns to users table
-- Adds search indexes for admin user management

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS username text;

-- Index for admin search by full_name
CREATE INDEX IF NOT EXISTS idx_users_full_name ON public.users(full_name);

-- Index for admin search by company_name
CREATE INDEX IF NOT EXISTS idx_users_company_name ON public.users(company_name);
