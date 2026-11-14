import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, to = "/" }: { className?: string; to?: "/" | "/painel" }) {
  return (
    <Link to={to} className={cn("flex items-center gap-2.5 font-display text-lg font-bold tracking-tight", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
        <Zap className="size-4" strokeWidth={2.75} />
      </span>
      <span>
        Afiliado<span className="text-primary">Automático</span>
      </span>
    </Link>
  );
}
