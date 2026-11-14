import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
import { NAV_SECTIONS } from "./nav";

function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: account } = useAccount();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-4">
        <Logo to="/painel" className="group-data-[collapsible=icon]:[&>span:last-child]:hidden" />
      </SidebarHeader>
      <SidebarContent>
        {NAV_SECTIONS.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = item.to === "/painel" ? pathname === "/painel" : pathname.startsWith(item.to);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {account?.isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin")} tooltip="Administração">
                    <Link to="/admin"><ShieldCheck /><span>Administração</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:hidden">
        <Link to="/painel/plano" className="rounded-lg bg-sidebar-accent p-3 text-xs">
          <p className="text-muted-foreground">Plano atual</p>
          <p className="mt-0.5 font-semibold text-sidebar-accent-foreground">{account?.subscription?.plan?.name ?? "—"}</p>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

function UserMenu() {
  const { data: account } = useAccount();
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  const name = account?.profile?.full_name || account?.email || "Minha conta";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground"><UserRound className="size-4" /></span>
          <span className="hidden max-w-40 truncate text-sm sm:inline">{name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{account?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/painel/configuracoes">Configurações</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/painel/plano">Meu plano</Link></DropdownMenuItem>
        {account?.isAdmin && <DropdownMenuItem asChild><Link to="/admin">Administração</Link></DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-destructive"><LogOut className="size-4" /> Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { data: account, isLoading } = useAccount();
  const suspended = account?.profile?.status === "suspended";
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            {account?.subscription?.status === "trial" && <Badge variant="info" className="hidden sm:inline-flex">Período de teste</Badge>}
          </div>
          <UserMenu />
        </header>
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8">
          {isLoading ? null : suspended ? (
            <div className="surface-card mx-auto max-w-lg p-8 text-center">
              <h1 className="text-2xl font-bold">Conta suspensa</h1>
              <p className="mt-2 text-muted-foreground">Sua conta está suspensa no momento. Entre em contato com o suporte para mais informações.</p>
              <Button asChild variant="outline" className="mt-6"><Link to="/contato">Falar com o suporte</Link></Button>
            </div>
          ) : (
            children
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
