import type { LucideIcon } from "lucide-react";
import { FlaskConical, Construction } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, badge }: { title: string; description?: string; actions?: ReactNode; badge?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          {badge}
        </div>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, hint, tone = "primary" }: { label: string; value: ReactNode; icon: LucideIcon; hint?: string; tone?: "primary" | "lime" | "warning" | "danger" | "info" }) {
  const toneCls = {
    primary: "bg-primary/12 text-primary",
    lime: "bg-lime/12 text-lime",
    warning: "bg-warning/12 text-warning",
    danger: "bg-destructive/12 text-destructive",
    info: "bg-info/12 text-info",
  }[tone];
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={cn("grid size-9 place-items-center rounded-lg", toneCls)}><Icon className="size-4" /></span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-accent"><Icon className="size-6 text-lime" /></span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-demo/30 bg-demo/10 p-4 text-sm">
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-demo" />
      <div className="text-foreground/90">{children}</div>
    </div>
  );
}

export function DevNotice({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
      <Construction className="mt-0.5 size-4 shrink-0 text-warning" />
      <div className="text-foreground/90">{children}</div>
    </div>
  );
}

export const DemoBadge = () => <Badge variant="demo">Modo demonstração</Badge>;
export const DevBadge = () => <Badge variant="warning">Em desenvolvimento</Badge>;

const STATUS: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "demo" | "muted" | "lime" }> = {
  // queue items / send logs
  waiting: { label: "Aguardando", variant: "muted" },
  scheduled: { label: "Agendado", variant: "info" },
  processing: { label: "Em processamento", variant: "warning" },
  sent: { label: "Enviado", variant: "success" },
  failed: { label: "Falhou", variant: "danger" },
  canceled: { label: "Cancelado", variant: "muted" },
  requested: { label: "Solicitado", variant: "info" },
  demo: { label: "Simulado (demo)", variant: "demo" },
  // queues / campaigns
  draft: { label: "Rascunho", variant: "muted" },
  active: { label: "Ativo", variant: "success" },
  paused: { label: "Pausado", variant: "warning" },
  finished: { label: "Concluído", variant: "lime" },
  inactive: { label: "Inativo", variant: "muted" },
  // connections
  pending_validation: { label: "Aguardando validação", variant: "warning" },
  connected: { label: "Conectado", variant: "success" },
  disconnected: { label: "Desconectado", variant: "muted" },
  error: { label: "Com erro", variant: "danger" },
  // subscriptions / accounts
  trial: { label: "Teste", variant: "info" },
  past_due: { label: "Pagamento pendente", variant: "warning" },
  suspended: { label: "Suspensa", variant: "danger" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, variant: "muted" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function ConfirmButton({ trigger, title, description, confirmLabel = "Confirmar", onConfirm, destructive = true }: {
  trigger: ReactNode; title: string; description: string; confirmLabel?: string; onConfirm: () => void; destructive?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={cn(destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

export function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-destructive">{msg}</p> : null;
}
