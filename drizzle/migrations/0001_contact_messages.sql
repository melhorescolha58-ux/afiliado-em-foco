CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 255),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 2 AND 160),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 4000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','answered')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send contact" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (status = 'new');
CREATE POLICY "Admins read contact" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update contact" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER contact_messages_updated_at BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();