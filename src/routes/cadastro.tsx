import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthShell } from "@/components/site/AuthShell";
import { SocialButtons } from "@/components/site/SocialButtons";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — Afiliado Automático" },
      { name: "description", content: "Crie sua conta e teste grátis por 14 dias a automação de ofertas para WhatsApp." },
      { property: "og:title", content: "Criar conta — Afiliado Automático" },
      { property: "og:description", content: "Comece a organizar e automatizar suas ofertas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres").max(72),
  terms: z.literal(true, { errorMap: () => ({ message: "Aceite os termos para continuar" }) }),
});
type Form = z.infer<typeof schema>;

function SignupPage() {
  const navigate = useNavigate();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(v: Form) {
    const { data, error } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: { emailRedirectTo: `${window.location.origin}/painel`, data: { full_name: v.full_name } },
    });
    if (error) return toast.error(error.message.includes("registered") ? "Este e-mail já está cadastrado." : error.message);
    if (data.session) return navigate({ to: "/painel" });
    setSentTo(v.email);
  }

  if (sentTo) {
    return (
      <AuthShell title="Confirme seu e-mail" subtitle="Falta só um passo.">
        <div className="surface-card p-6 text-center">
          <MailCheck className="mx-auto size-10 text-primary" />
          <p className="mt-4 text-sm">Enviamos um link de confirmação para <b>{sentTo}</b>. Abra o e-mail e clique no link para ativar sua conta.</p>
          <Button asChild variant="outline" className="mt-6 w-full"><Link to="/auth">Ir para o login</Link></Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Crie sua conta" subtitle="14 dias de teste no plano Básico. Sem cartão de crédito.">
      <SocialButtons onSignedIn={() => navigate({ to: "/painel" })} />
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> ou com e-mail <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Nome</Label>
          <Input id="full_name" autoComplete="name" {...register("full_name")} />
          {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <Checkbox checked={watch("terms") === true} onCheckedChange={(c) => setValue("terms", c === true ? true : (false as never), { shouldValidate: true })} className="mt-0.5" />
          <span>Li e aceito os <Link to="/termos" className="text-primary hover:underline">Termos de uso</Link> e a <Link to="/privacidade" className="text-primary hover:underline">Política de privacidade</Link>.</span>
        </label>
        {errors.terms && <p className="text-xs text-destructive">{errors.terms.message}</p>}
        <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Criando..." : "Criar conta"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta? <Link to="/auth" className="font-semibold text-primary hover:underline">Entrar</Link>
      </p>
    </AuthShell>
  );
}
