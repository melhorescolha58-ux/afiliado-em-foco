import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/site/AuthShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — Afiliado Automático" },
      { name: "description", content: "Crie uma nova senha para sua conta." },
      { property: "og:title", content: "Redefinir senha — Afiliado Automático" },
      { property: "og:description", content: "Crie uma nova senha para sua conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((e) => {
      if (e === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session && isRecovery) setReady(true);
      else if (s.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("A senha precisa ter pelo menos 8 caracteres."); return; }
    if (password !== confirm) { toast.error("As senhas não conferem."); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) { toast.error("Não foi possível alterar a senha. Solicite um novo link."); return; }
    toast.success("Senha alterada com sucesso!");
    navigate({ to: "/painel" });
  }

  return (
    <AuthShell title="Nova senha" subtitle="Escolha uma senha forte com pelo menos 8 caracteres.">
      {!ready ? (
        <p className="text-sm text-muted-foreground">Validando o link de recuperação... Se nada acontecer, solicite um novo link na tela de login.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p1">Nova senha</Label>
            <Input id="p1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p2">Confirmar senha</Label>
            <Input id="p2" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={saving}>{saving ? "Salvando..." : "Salvar nova senha"}</Button>
        </form>
      )}
    </AuthShell>
  );
}
