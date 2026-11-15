CREATE TABLE public.marketplaces (
 id text PRIMARY KEY, name text NOT NULL, description text NOT NULL DEFAULT '', category text NOT NULL DEFAULT 'marketplace' CHECK (category IN ('marketplace','network','partner')), logo_url text, domains text[] NOT NULL DEFAULT '{}', fields jsonb NOT NULL DEFAULT '[]', tutorial_text text NOT NULL DEFAULT '', tutorial_url text, tutorial_video_url text, documentation_url text, is_available boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.marketplaces TO authenticated;
GRANT ALL ON public.marketplaces TO service_role;
ALTER TABLE public.marketplaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read marketplace catalogue" ON public.marketplaces FOR SELECT TO authenticated USING (public.is_account_active(auth.uid()));
CREATE POLICY "Admins create marketplaces" ON public.marketplaces FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND public.is_account_active(auth.uid()));
CREATE POLICY "Admins update marketplaces" ON public.marketplaces FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') AND public.is_account_active(auth.uid())) WITH CHECK (public.has_role(auth.uid(),'admin') AND public.is_account_active(auth.uid()));
CREATE TRIGGER marketplaces_updated BEFORE UPDATE ON public.marketplaces FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TABLE public.marketplace_configs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, marketplace_id text NOT NULL REFERENCES public.marketplaces(id), config jsonb NOT NULL DEFAULT '{}', is_active boolean NOT NULL DEFAULT false, validation_status text NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending','validated','error')), validation_error text, has_secret boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,marketplace_id)
);
GRANT SELECT ON public.marketplace_configs TO authenticated;
GRANT ALL ON public.marketplace_configs TO service_role;
ALTER TABLE public.marketplace_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own marketplace settings" ON public.marketplace_configs FOR SELECT TO authenticated USING (user_id=auth.uid() AND public.is_account_active(auth.uid()));
CREATE TRIGGER marketplace_configs_updated BEFORE UPDATE ON public.marketplace_configs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TABLE public.marketplace_credentials (
 config_id uuid PRIMARY KEY REFERENCES public.marketplace_configs(id) ON DELETE CASCADE, encrypted_payload text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.marketplace_credentials TO service_role;
ALTER TABLE public.marketplace_credentials ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.save_marketplace_configuration(p_user_id uuid,p_marketplace_id text,p_config jsonb,p_active boolean,p_encrypted text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE cid uuid;
BEGIN
 IF NOT public.is_account_active(p_user_id) THEN RAISE EXCEPTION 'Account unavailable'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.marketplaces WHERE id=p_marketplace_id AND is_available) THEN RAISE EXCEPTION 'Marketplace unavailable'; END IF;
 INSERT INTO public.marketplace_configs(user_id,marketplace_id,config,is_active,has_secret) VALUES(p_user_id,p_marketplace_id,p_config,p_active,p_encrypted IS NOT NULL)
 ON CONFLICT(user_id,marketplace_id) DO UPDATE SET config=EXCLUDED.config,is_active=EXCLUDED.is_active,validation_status='pending',validation_error=NULL,has_secret=marketplace_configs.has_secret OR p_encrypted IS NOT NULL RETURNING id INTO cid;
 IF p_encrypted IS NOT NULL THEN INSERT INTO public.marketplace_credentials(config_id,encrypted_payload) VALUES(cid,p_encrypted) ON CONFLICT(config_id) DO UPDATE SET encrypted_payload=EXCLUDED.encrypted_payload,updated_at=now(); END IF;
END $$;
REVOKE ALL ON FUNCTION public.save_marketplace_configuration(uuid,text,jsonb,boolean,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_marketplace_configuration(uuid,text,jsonb,boolean,text) TO service_role;
ALTER TABLE public.campaigns ADD COLUMN marketplace_ids text[] NOT NULL DEFAULT '{}';