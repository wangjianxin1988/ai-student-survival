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
BEGIN
  -- auth.users is accessible via SECURITY DEFINER with service role
  SELECT (u.raw_app_meta_data->>'provider')::text
  INTO v_provider
  FROM auth.users u
  WHERE u.email = p_email
    AND u.raw_app_meta_data ? 'provider'
  LIMIT 1;

  RETURN v_provider;
END;
$$;

-- Drop the first version, keep v2
DROP FUNCTION IF EXISTS get_oauth_provider(text);

-- Grant execute to anon and authenticated (so it works from the client)
GRANT EXECUTE ON FUNCTION get_oauth_provider_v2(text) TO anon;
GRANT EXECUTE ON FUNCTION get_oauth_provider_v2(text) TO authenticated;
