CREATE TABLE public.connection_credentials (
  connection_id uuid PRIMARY KEY REFERENCES public.connections(id) ON DELETE CASCADE,
  encrypted_payload text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.connection_credentials TO service_role;
ALTER TABLE public.connection_credentials ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.connections ALTER COLUMN provider SET DEFAULT 'zapi';

REVOKE INSERT, UPDATE ON public.connections FROM authenticated;
GRANT INSERT (user_id, name, phone_number) ON public.connections TO authenticated;
GRANT UPDATE (name, phone_number) ON public.connections TO authenticated;

CREATE OR REPLACE FUNCTION public.save_zapi_connection_credentials(
  p_user_id uuid,
  p_connection_id uuid,
  p_instance_id text,
  p_encrypted text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.connections
    WHERE id = p_connection_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Connection not found';
  END IF;
  IF length(trim(p_instance_id)) < 2 OR length(p_encrypted) < 16 THEN
    RAISE EXCEPTION 'Invalid Z-API credentials';
  END IF;

  UPDATE public.connections
  SET provider = 'zapi',
      status = 'disconnected',
      last_error = NULL,
      last_checked_at = NULL,
      metadata = jsonb_set(
        jsonb_set(metadata, '{instance_id}', to_jsonb(trim(p_instance_id)), true),
        '{has_credentials}', 'true'::jsonb, true
      )
  WHERE id = p_connection_id AND user_id = p_user_id;

  INSERT INTO public.connection_credentials(connection_id, encrypted_payload)
  VALUES (p_connection_id, p_encrypted)
  ON CONFLICT(connection_id) DO UPDATE
  SET encrypted_payload = EXCLUDED.encrypted_payload, updated_at = now();
END;
$$;
REVOKE ALL ON FUNCTION public.save_zapi_connection_credentials(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_zapi_connection_credentials(uuid, uuid, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.import_zapi_groups(
  p_user_id uuid,
  p_connection_id uuid,
  p_groups jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  item jsonb;
  group_name text;
  external_id text;
  lim integer;
  total_count integer;
  imported_count integer := 0;
  updated_count integer := 0;
  skipped_count integer := 0;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.connections
    WHERE id = p_connection_id AND user_id = p_user_id AND provider = 'zapi'
  ) THEN
    RAISE EXCEPTION 'Connection not found';
  END IF;
  IF jsonb_typeof(p_groups) <> 'array' THEN
    RAISE EXCEPTION 'Groups must be an array';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_connection_id::text));
  lim := COALESCE(public.user_group_limit(p_user_id), 10);
  SELECT count(*) INTO total_count FROM public.groups WHERE user_id = p_user_id;

  FOR item IN SELECT value FROM jsonb_array_elements(p_groups)
  LOOP
    group_name := left(trim(COALESCE(item->>'name', '')), 120);
    external_id := left(trim(COALESCE(item->>'phone', '')), 160);
    IF group_name = '' OR external_id = '' OR COALESCE((item->>'isGroup')::boolean, false) = false THEN
      CONTINUE;
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.groups
      WHERE user_id = p_user_id AND connection_id = p_connection_id AND external_id = external_id
    ) THEN
      UPDATE public.groups
      SET name = group_name, send_available = true
      WHERE user_id = p_user_id AND connection_id = p_connection_id AND external_id = external_id;
      updated_count := updated_count + 1;
    ELSIF total_count >= lim THEN
      skipped_count := skipped_count + 1;
    ELSE
      INSERT INTO public.groups(user_id, connection_id, name, external_id, is_active, send_available)
      VALUES (p_user_id, p_connection_id, group_name, external_id, true, true);
      total_count := total_count + 1;
      imported_count := imported_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'imported', imported_count,
    'updated', updated_count,
    'skipped', skipped_count,
    'total', total_count,
    'limit', lim
  );
END;
$$;
REVOKE ALL ON FUNCTION public.import_zapi_groups(uuid, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.import_zapi_groups(uuid, uuid, jsonb) TO service_role;