-- ============================================
-- PURGE COMPLÈTE DE LA BASE SUPABASE
-- Exécuter dans Supabase > SQL Editor
-- ATTENTION : supprime TOUTES les tables publiques
-- ============================================

-- Désactiver les triggers temporairement
SET session_replication_role = replica;

-- Supprimer toutes les tables du schéma public
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    RAISE NOTICE 'Table supprimée : %', r.tablename;
  END LOOP;
END $$;

-- Supprimer toutes les fonctions custom du schéma public
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
  ) LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
  END LOOP;
END $$;

-- Supprimer les types enum custom
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT typname FROM pg_type
    WHERE typnamespace = 'public'::regnamespace
    AND typtype = 'e'
  ) LOOP
    EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
  END LOOP;
END $$;

-- Réactiver les triggers
SET session_replication_role = DEFAULT;

SELECT 'Base purgée avec succès ✅' AS status;
