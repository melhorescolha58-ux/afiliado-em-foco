import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHero } from "@/components/site/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage } from "@/lib/format";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato e suporte — Afiliado Automático" },
      { name: "description", content: "Fale com a equipe do Afiliado Automático para dúvidas, suporte ou planos Enterprise." },
      { property: "og:title", content: "Contato e suporte — Afiliado Automático" },
      { property: "og:description", content: "Envie sua mensagem e responderemos por e-mail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  subject: z.string().trim().min(2, "Informe o assunto").max(160),
  message: z.string().trim().min(10, "Escreva pelo menos 10 caracteres").max(4000),
});
type Form = z.infer<typeof schema>;

function Page() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Form) {
    const { error } = await supabase.from("contact_messages").insert(values);
    if (error) { toast.error(errorMessage(error)); return; }
    reset();
    setSent(true);
  }

  return (
    <PublicLayout>
      <PageHero eyebrow="Contato" title="Fale com a gente" subtitle="Dúvidas, sugestões ou interesse no plano Enterprise? Responderemos pelo e-mail informado." />
      <section className="mx-auto grid max-w-5xl gap-8 px-5 py-16 md:grid-cols-[1fr_1.5fr]">
        <div className="space-y-4">
          <div className="surface-card p-6">
            <Mail className="size-5 text-primary" />
            <h3 className="mt-3 font-bold">Suporte por e-mail</h3>
            <p className="mt-1 text-sm text-muted-foreground">Clientes também podem abrir chamados direto pelo painel, em Suporte e tutoriais.</p>
          </div>
          <div className="surface-card p-6">
            <MessageCircle className="size-5 text-lime" />
            <h3 className="mt-3 font-bold">Enterprise</h3>
            <p className="mt-1 text-sm text-muted-foreground">Para operações com mais de 500 grupos, conte um pouco sobre seu volume no formulário.</p>
          </div>
        </div>
        <div className="surface-card p-6 md:p-8">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="size-12 text-primary" />
              <h3 className="mt-4 text-xl font-bold">Mensagem enviada!</h3>
              <p className="mt-2 text-muted-foreground">Recebemos seu contato e responderemos em breve.</p>
              <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>Enviar outra mensagem</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">Assunto</Label>
                <Input id="subject" {...register("subject")} />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea id="message" rows={6} {...register("message")} />
                {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
              </div>
              <Button type="submit" variant="hero" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Enviando..." : "Enviar mensagem"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
