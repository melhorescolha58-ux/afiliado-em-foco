import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({ meta: [{ title: "Painel — Afiliado Automático" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
