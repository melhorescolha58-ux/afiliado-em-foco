import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({ meta: [{ title: "Painel — Afiliado Automático" }, { name: "description", content: "Painel no painel do Afiliado Automático." }, { property: "og:title", content: "Painel — Afiliado Automático" }, { property: "og:description", content: "Painel no painel do Afiliado Automático." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
