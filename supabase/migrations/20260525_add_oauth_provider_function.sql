-- Add function to get OAuth provider for an email
-- Uses SECURITY DEFINER so it runs with the service role's privileges
-- This allows checking if an email is registered via OAuth without admin API access
CREATE OR REPLACE FUNCTION get_oauth_provider(p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth
AS $$
DECLARE
  v_provider text;
BEGIN
  SELECT am.provider::text
  INTO v_provider
  FROM auth.users u
  JOIN auth.users app_metadata(am) ON u.id = am.instance_id
  WHERE u.email = p_email
    AND u.instance_id IS NOT NULL
  LIMIT 1;

  RETURN v_provider;
END;
$$;

-- Also try a simpler approach using the users table directly
CREATE OR REPLACE FUNCTION get_oauth_provider_v2(p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth
AS $$
DECLARE
  v_provider text;
  v_provider_id text;
  v_raw_app_meta jsonb;
  v_raw_user_meta jsonb;
BEGIN
  -- First: check auth.identities table (most reliable for OAuth users)
  SELECT i.provider, i.id
  INTO v_provider, v_provider_id
  FROM auth.identities i
  WHERE i.identity_data->>'email' = p_email
    AND i.provider != 'email'
  LIMIT 1;

  IF v_provider IS NOT NULL THEN
    RETURN v_provider;
  END IF;

  -- Also try matching by user_id -> email in identities
  SELECT i.provider
  INTO v_provider
  FROM auth.identities i
  JOIN auth.users u ON i.user_id = u.id
  WHERE u.email = p_email
    AND i.provider != 'email'
  LIMIT 1;

  IF v_provider IS NOT NULL THEN
    RETURN v_provider;
  END IF;

  -- Second: check raw_app_meta_data
  SELECT u.raw_app_meta_data
  INTO v_raw_app_meta
  FROM auth.users u
  WHERE u.email = p_email;

  IF v_raw_app_meta ? 'provider' THEN
    RETURN (v_raw_app_meta->>'provider')::text;
  END IF;

  -- Third: check raw_user_meta_data
  SELECT u.raw_user_meta_data
  INTO v_raw_user_meta
  FROM auth.users u
  WHERE u.email = p_email;

  IF v_raw_user_meta ? 'provider' THEN
    RETURN (v_raw_user_meta->>'provider')::text;
  END IF;

  -- Fourth: try identities with case-insensitive email match
  SELECT i.provider
  INTO v_provider
  FROM auth.identities i
  WHERE LOWER(i.identity_data->>'email') = LOWER(p_email)
    AND i.provider != 'email'
  LIMIT 1;

  RETURN v_provider;
END;
$$;

-- Drop the first version, keep v2
DROP FUNCTION IF EXISTS get_oauth_provider(text);

-- Grant execute to anon and authenticated (so it works from the client)
GRANT EXECUTE ON FUNCTION get_oauth_provider_v2(text) TO anon;
GRANT EXECUTE ON FUNCTION get_oauth_provider_v2(text) TO authenticated;
