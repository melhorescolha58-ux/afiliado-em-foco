import type { ReactNode } from "react";
import { PublicLayout } from "./PublicLayout";
import { PageHero } from "./PageHero";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <PublicLayout>
      <PageHero eyebrow="Documento legal" title={title} subtitle={`Última atualização: ${updated}`} />
      <article className="mx-auto max-w-3xl space-y-6 px-5 py-16 text-muted-foreground [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc">
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          Texto-base para revisão jurídica antes do lançamento comercial.
        </div>
        {children}
      </article>
    </PublicLayout>
  );
}
