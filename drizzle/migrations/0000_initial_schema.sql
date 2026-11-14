
-- ========== Roles ==========
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ========== profiles ==========
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  notify_email boolean NOT NULL DEFAULT true,
  notify_failures boolean NOT NULL DEFAULT true,
  automation_settings jsonb NOT NULL DEFAULT '{"require_review_for_ai": true, "default_interval_minutes": 15}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_account_active(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT status = 'active' FROM public.profiles WHERE id = _user_id), false)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.protect_profile_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Somente administradores podem alterar o status da conta';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER profiles_protect_status BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_status();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== plans ==========
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  max_groups integer NOT NULL DEFAULT 10,
  max_connections integer NOT NULL DEFAULT 1,
  max_automations integer NOT NULL DEFAULT 3,
  max_schedules integer NOT NULL DEFAULT 5,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_monthly numeric(10,2),
  price_yearly numeric(10,2),
  is_active boolean NOT NULL DEFAULT true,
  requires_validation boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active plans" ON public.plans FOR SELECT TO anon, authenticated
  USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage plans" ON public.plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.plans (slug, name, description, max_groups, max_connections, max_automations, max_schedules, features, sort_order, requires_validation) VALUES
 ('basico', 'Básico', 'Para quem está começando a divulgar ofertas.', 10, 1, 3, 5, '["Gerenciamento de grupos","Cadastro de produtos","Criador de mensagens","Disparo manual"]', 1, false),
 ('intermediario', 'Intermediário', 'Para quem já administra uma rede de grupos.', 50, 2, 10, 20, '["Tudo do Básico","Filas e agendamentos","Regras de automação","Assistente de IA"]', 2, false),
 ('profissional', 'Profissional', 'Para operações de divulgação diária.', 100, 3, 25, 50, '["Tudo do Intermediário","Divulgador automático","Relatórios completos"]', 3, false),
 ('avancado', 'Avançado', 'Para grandes redes de grupos de ofertas.', 500, 10, 100, 200, '["Tudo do Profissional","Mais conexões","Suporte prioritário"]', 4, false),
 ('enterprise', 'Enterprise', 'Para operações com 1.000 grupos ou mais, mediante validação técnica.', 1000, 50, 500, 1000, '["Tudo do Avançado","Limites sob medida","Acompanhamento dedicado"]', 5, true);

-- ========== subscriptions ==========
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial','active','past_due','canceled')),
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly')),
  current_period_end timestamptz,
  custom_max_groups integer,
  payment_provider text,
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== Owned tables ==========
CREATE TABLE public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  provider text NOT NULL DEFAULT 'whatsapp_business_api',
  phone_number text,
  status text NOT NULL DEFAULT 'pending_validation' CHECK (status IN ('pending_validation','connected','disconnected','error')),
  last_error text,
  last_checked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.group_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT 'green',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  connection_id uuid REFERENCES public.connections(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.group_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  external_id text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  send_available boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX groups_user_idx ON public.groups(user_id);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  store text NOT NULL DEFAULT 'outra',
  original_price numeric(12,2),
  promo_price numeric(12,2),
  coupon text,
  promo_code text,
  original_url text,
  affiliate_url text,
  category text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_user_idx ON public.products(user_id);

CREATE TABLE public.affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  store text NOT NULL,
  original_url text NOT NULL,
  affiliate_url text NOT NULL,
  affiliate_tag text,
  method text NOT NULL DEFAULT 'manual' CHECK (method IN ('manual','official_api')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','finished')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  body text NOT NULL,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','template','ai')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.queues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','paused','canceled','finished')),
  start_at timestamptz NOT NULL DEFAULT now(),
  interval_minutes integer NOT NULL DEFAULT 15 CHECK (interval_minutes BETWEEN 1 AND 1440),
  window_start time NOT NULL DEFAULT '08:00',
  window_end time NOT NULL DEFAULT '22:00',
  days_of_week smallint[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.queue_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  queue_id uuid NOT NULL REFERENCES public.queues(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (queue_id, group_id)
);

CREATE TABLE public.queue_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  queue_id uuid NOT NULL REFERENCES public.queues(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  message_body text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  position integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('waiting','scheduled','processing','sent','failed','canceled')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX queue_items_sched_idx ON public.queue_items(status, scheduled_at);

CREATE TABLE public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'auto_publisher',
  is_active boolean NOT NULL DEFAULT false,
  product_ids uuid[] NOT NULL DEFAULT '{}',
  group_ids uuid[] NOT NULL DEFAULT '{}',
  start_time time NOT NULL DEFAULT '08:00',
  end_time time NOT NULL DEFAULT '22:00',
  interval_minutes integer NOT NULL DEFAULT 15 CHECK (interval_minutes BETWEEN 1 AND 1440),
  days_of_week smallint[] NOT NULL DEFAULT '{1,2,3,4,5}',
  max_per_period integer NOT NULL DEFAULT 20,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  trigger_type text NOT NULL,
  condition_type text NOT NULL DEFAULT 'always',
  condition_value text,
  action_type text NOT NULL,
  action_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.automation_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rule_id uuid REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'success',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.send_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  queue_id uuid REFERENCES public.queues(id) ON DELETE SET NULL,
  product_name text,
  group_name text,
  origin text NOT NULL DEFAULT 'manual',
  message_body text NOT NULL,
  status text NOT NULL DEFAULT 'demo' CHECK (status IN ('requested','demo','sent','failed')),
  is_demo boolean NOT NULL DEFAULT true,
  external_id text,
  error_detail text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX send_logs_user_idx ON public.send_logs(user_id, created_at DESC);

CREATE TABLE public.usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  metric text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  period_start date NOT NULL DEFAULT date_trunc('month', now())::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Grants, RLS, policies and updated_at triggers for every owned table
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['connections','group_categories','groups','products','affiliate_links','campaigns','message_templates','messages','queues','queue_groups','queue_items','schedules','automation_rules','automation_executions','send_logs','usage_records','notifications']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Owner full access" ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id AND public.is_account_active(auth.uid())) WITH CHECK (auth.uid() = user_id AND public.is_account_active(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Admins read all" ON public.%I FOR SELECT TO authenticated USING (public.has_role(auth.uid(), ''admin''))', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t || '_updated_at', t);
  END LOOP;
END $$;

-- ========== admin_logs ==========
CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_logs TO authenticated;
GRANT ALL ON public.admin_logs TO service_role;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read logs" ON public.admin_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write logs" ON public.admin_logs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

-- ========== Plan limit: groups ==========
CREATE OR REPLACE FUNCTION public.user_group_limit(_user_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(s.custom_max_groups, p.max_groups, 10)
  FROM public.subscriptions s JOIN public.plans p ON p.id = s.plan_id
  WHERE s.user_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.enforce_group_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE lim integer; cnt integer;
BEGIN
  lim := COALESCE(public.user_group_limit(NEW.user_id), 10);
  SELECT count(*) INTO cnt FROM public.groups WHERE user_id = NEW.user_id;
  IF cnt >= lim THEN
    RAISE EXCEPTION 'Limite de % grupos do seu plano atingido', lim;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER groups_enforce_limit BEFORE INSERT ON public.groups FOR EACH ROW EXECUTE FUNCTION public.enforce_group_limit();

-- ========== New user bootstrap ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE basic_plan uuid;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.email);

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;

  SELECT id INTO basic_plan FROM public.plans WHERE slug = 'basico';
  IF basic_plan IS NOT NULL THEN
    INSERT INTO public.subscriptions (user_id, plan_id, status, current_period_end)
    VALUES (NEW.id, basic_plan, 'trial', now() + interval '14 days');
  END IF;

  INSERT INTO public.group_categories (user_id, name, color) VALUES
    (NEW.id, 'Ofertas gerais', 'green'),
    (NEW.id, 'Eletrônicos', 'blue'),
    (NEW.id, 'Casa e decoração', 'amber'),
    (NEW.id, 'Moda', 'pink'),
    (NEW.id, 'Beleza', 'violet');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
