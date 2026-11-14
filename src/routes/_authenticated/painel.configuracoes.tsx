import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/app/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
import { errorMessage } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Afiliado Automático" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data: account } = useAccount();
  const [p, setP] = useState({ full_name: "", timezone: "America/Sao_Paulo", notify_email: true, notify_failures: true, review_ai: true });
  const [pw, setPw] = useState({ current: "", next: "" });

  useEffect(() => {
    const pr = account?.profile;
    if (pr) setP({ full_name: pr.full_name ?? "", timezone: pr.timezone, notify_email: pr.notify_email, notify_failures: pr.notify_failures, review_ai: (pr.automation_settings as { require_review_for_ai?: boolean })?.require_review_for_ai ?? true });
  }, [account]);

  async function saveProfile() {
    if (!account) return;
    const { error } = await supabase.from("profiles").update({
      full_name: p.full_name.trim().slice(0, 120), timezone: p.timezone, notify_email: p.notify_email, notify_failures: p.notify_failures,
      automation_settings: { ...((account.profile?.automation_settings as object) ?? {}), require_review_for_ai: p.review_ai },
    }).eq("id", account.userId);
    if (error) return toast.error(errorMessage(error));
    toast.success("Configurações salvas");
    qc.invalidateQueries({ queryKey: ["account"] });
  }
  async function changePassword() {
    if (pw.next.length < 8) return toast.error("A nova senha precisa ter pelo menos 8 caracteres.");
    const { error } = await supabase.auth.updateUser({ password: pw.next, current_password: pw.current } as never);
    if (error) return toast.error(errorMessage(error));
    toast.success("Senha alterada");
    setPw({ current: "", next: "" });
  }

  return (
    <>
      <PageHeader title="Configurações" description="Seus dados, preferências e segurança da conta." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card space-y-4 p-6">
          <h2 className="font-bold">Dados da conta</h2>
          <div className="space-y-1.5"><Label>Nome</Label><Input value={p.full_name} onChange={(e) => setP({ ...p, full_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>E-mail</Label><Input value={account?.email ?? ""} disabled /></div>
          <div className="space-y-1.5"><Label>Fuso horário</Label><Input value={p.timezone} onChange={(e) => setP({ ...p, timezone: e.target.value })} /></div>
          <h2 className="pt-2 font-bold">Notificações e automação</h2>
          <label className="flex items-center gap-3 text-sm"><Switch checked={p.notify_email} onCheckedChange={(c) => setP({ ...p, notify_email: c })} /> Receber novidades por e-mail</label>
          <label className="flex items-center gap-3 text-sm"><Switch checked={p.notify_failures} onCheckedChange={(c) => setP({ ...p, notify_failures: c })} /> Avisar quando um envio falhar</label>
          <label className="flex items-center gap-3 text-sm"><Switch checked={p.review_ai} onCheckedChange={(c) => setP({ ...p, review_ai: c })} /> Exigir minha revisão antes de usar textos da IA</label>
          <Button variant="hero" onClick={saveProfile}>Salvar</Button>
        </div>
        <div className="surface-card h-fit space-y-4 p-6">
          <h2 className="font-bold">Alterar senha</h2>
          <div className="space-y-1.5"><Label>Senha atual</Label><Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Nova senha</Label><Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
          <Button variant="outline" onClick={changePassword}>Alterar senha</Button>
        </div>
      </div>
    </>
  );
}
