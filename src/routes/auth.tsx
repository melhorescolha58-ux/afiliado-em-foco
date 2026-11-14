import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/site/AuthShell";
import { SocialButtons } from "@/components/site/SocialButtons";
import { supabase } from "@/integrations/supabase/client";
import { safeRedirect } from "@/lib/safe-redirect";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar — Afiliado Automático" },
      { name: "description", content: "Acesse seu painel do Afiliado Automático." },
      { property: "og:title", content: "Entrar — Afiliado Automático" },
      { property: "og:description", content: "Acesse seu painel de automação de ofertas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const target = safeRedirect(redirect);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const goIn = () => navigate({ to: target as "/painel", replace: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) goIn();
    });
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" && s) goIn();
    });
    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(v: z.infer<typeof schema>) {
    const { error } = await supabase.auth.signInWithPassword(v);
    if (error) {
      toast.error(error.message.includes("Email not confirmed") ? "Confirme seu e-mail antes de entrar." : "E-mail ou senha incorretos.");
      return;
    }
    goIn();
  }

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    if (!z.string().email().safeParse(forgotEmail).success) return toast.error("Informe um e-mail válido.");
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: `${window.location.origin}/reset-password` });
    setSending(false);
    if (error) return toast.error("Não foi possível enviar o e-mail. Tente novamente.");
    toast.success("Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.");
    setMode("login");
  }

  if (mode === "forgot") {
    return (
      <AuthShell title="Esqueci minha senha" subtitle="Enviaremos um link para você criar uma nova senha.">
        <form onSubmit={sendReset} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="femail">E-mail</Label>
            <Input id="femail" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={sending}>{sending ? "Enviando..." : "Enviar link"}</Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setMode("login")}>Voltar para o login</Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Bem-vindo de volta" subtitle="Entre para gerenciar seus grupos e ofertas.">
      <SocialButtons onSignedIn={goIn} />
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> ou com e-mail <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <button type="button" className="text-xs text-primary hover:underline" onClick={() => setMode("forgot")}>Esqueci a senha</button>
          </div>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Entrando..." : "Entrar"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem conta? <Link to="/cadastro" className="font-semibold text-primary hover:underline">Criar conta grátis</Link>
      </p>
    </AuthShell>
  );
}
