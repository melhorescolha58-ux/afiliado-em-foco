import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-border bg-sidebar lg:block">
        <div className="absolute inset-0 bg-hero" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div>
            <p className="font-display text-4xl font-extrabold leading-tight">
              “Montei a fila da semana em 10 minutos.<br /><span className="text-gradient">O resto é com o horário.”</span>
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Organize, programe e acompanhe a divulgação das suas ofertas.</p>
          </div>
          <p className="text-xs text-muted-foreground">Seus dados ficam isolados e protegidos.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
