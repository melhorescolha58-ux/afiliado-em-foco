import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/funcionalidades", label: "Funcionalidades" },
  { to: "/planos", label: "Planos" },
  { to: "/faq", label: "Perguntas frequentes" },
  { to: "/contato", label: "Contato" },
] as const;

function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  return signedIn;
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signedIn = useSignedIn();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  pathname === n.to && "text-foreground",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {signedIn ? (
              <Button asChild variant="hero">
                <Link to="/painel">Abrir painel</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button asChild variant="hero">
                  <Link to="/cadastro">Criar conta grátis</Link>
                </Button>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Abrir menu">
            {open ? <X /> : <Menu />}
          </Button>
        </div>
        {open && (
          <div className="border-t border-border px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                  {n.label}
                </Link>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {signedIn ? (
                  <Button asChild variant="hero" className="col-span-2">
                    <Link to="/painel">Abrir painel</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline"><Link to="/auth">Entrar</Link></Button>
                    <Button asChild variant="hero"><Link to="/cadastro">Criar conta</Link></Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-sidebar">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Centralize grupos, produtos, links de afiliado e mensagens. Automatize a divulgação de ofertas com segurança e controle.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Produto</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/funcionalidades" className="hover:text-foreground">Funcionalidades</Link></li>
              <li><Link to="/planos" className="hover:text-foreground">Planos</Link></li>
              <li><Link to="/faq" className="hover:text-foreground">Perguntas frequentes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Empresa</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contato" className="hover:text-foreground">Contato e suporte</Link></li>
              <li><Link to="/termos" className="hover:text-foreground">Termos de uso</Link></li>
              <li><Link to="/privacidade" className="hover:text-foreground">Política de privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Afiliado Automático. Não somos afiliados ao WhatsApp, Meta ou aos marketplaces citados.
        </div>
      </footer>
    </div>
  );
}
