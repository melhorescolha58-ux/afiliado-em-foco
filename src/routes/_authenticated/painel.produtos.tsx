import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, ShoppingBag, Pencil, Trash2, MessageSquareText, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, EmptyState, LoadingRows, ConfirmButton, FieldError, StatusBadge } from "@/components/app/ui";
import { useRows, useSaveRow, useDeleteRows } from "@/lib/db";
import type { Tables } from "@/integrations/supabase/types";
import { STORES, detectStore, storeLabel } from "@/lib/stores";
import { formatBRL, formatDate } from "@/lib/format";
import { discountPercent } from "@/lib/message-builder";

export const Route = createFileRoute("/_authenticated/painel/produtos")({
  head: () => ({ meta: [{ title: "Produtos e ofertas — Afiliado Automático" }] }),
  component: ProductsPage,
});

const url = z.string().trim().max(2000).refine((v) => !v || /^https?:\/\//i.test(v), "Use um link começando com http(s)://").optional();
const price = z.string().trim().refine((v) => !v || (!isNaN(Number(v.replace(",", "."))) && Number(v.replace(",", ".")) >= 0), "Preço inválido").optional();
const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(200),
  description: z.string().trim().max(2000).optional(),
  image_url: url, original_url: url, affiliate_url: url,
  store: z.string(),
  original_price: price, promo_price: price,
  coupon: z.string().trim().max(60).optional(),
  promo_code: z.string().trim().max(60).optional(),
  category: z.string().trim().max(80).optional(),
  active: z.boolean(),
});
type Form = z.infer<typeof schema>;
const toNum = (v?: string) => (v ? Number(v.replace(",", ".")) : null);

export function ProductDialog({ open, onOpenChange, product }: { open: boolean; onOpenChange: (o: boolean) => void; product: Tables<"products"> | null }) {
  const save = useSaveRow("products", [], product ? "Produto atualizado" : "Produto cadastrado");
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    values: {
      name: product?.name ?? "", description: product?.description ?? "", image_url: product?.image_url ?? "",
      original_url: product?.original_url ?? "", affiliate_url: product?.affiliate_url ?? "", store: product?.store ?? "outra",
      original_price: product?.original_price?.toString() ?? "", promo_price: product?.promo_price?.toString() ?? "",
      coupon: product?.coupon ?? "", promo_code: product?.promo_code ?? "", category: product?.category ?? "", active: (product?.status ?? "active") === "active",
    },
  });
  async function onSubmit(v: Form) {
    await save.mutateAsync({
      ...(product ? { id: product.id } : {}),
      name: v.name, description: v.description || null, image_url: v.image_url || null,
      original_url: v.original_url || null, affiliate_url: v.affiliate_url || null, store: v.store,
      original_price: toNum(v.original_price), promo_price: toNum(v.promo_price),
      coupon: v.coupon || null, promo_code: v.promo_code || null, category: v.category || null,
      status: v.active ? "active" : "inactive",
    });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{product ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="space-y-1.5 sm:col-span-2"><Label>Nome do produto</Label><Input {...register("name")} /><FieldError msg={errors.name?.message} /></div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Link original do produto</Label>
            <Input {...register("original_url", { onChange: (e) => { const s = detectStore(e.target.value); if (s !== "outra") setValue("store", s); } })} placeholder="https://..." />
            <FieldError msg={errors.original_url?.message} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Seu link de afiliado</Label>
            <Input {...register("affiliate_url")} placeholder="Cole o link gerado no painel do programa de afiliados" />
            <FieldError msg={errors.affiliate_url?.message} />
          </div>
          <div className="space-y-1.5">
            <Label>Loja</Label>
            <Select value={watch("store")} onValueChange={(v) => setValue("store", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STORES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Categoria</Label><Input {...register("category")} placeholder="Eletrônicos" /></div>
          <div className="space-y-1.5"><Label>Preço original (R$)</Label><Input inputMode="decimal" {...register("original_price")} placeholder="199,90" /><FieldError msg={errors.original_price?.message} /></div>
          <div className="space-y-1.5"><Label>Preço promocional (R$)</Label><Input inputMode="decimal" {...register("promo_price")} placeholder="129,90" /><FieldError msg={errors.promo_price?.message} /></div>
          <div className="space-y-1.5"><Label>Cupom de desconto</Label><Input {...register("coupon")} placeholder="DESCONTO10" /></div>
          <div className="space-y-1.5"><Label>Código promocional</Label><Input {...register("promo_code")} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Link da imagem</Label><Input {...register("image_url")} placeholder="https://..." /><FieldError msg={errors.image_url?.message} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Descrição</Label><Textarea rows={3} {...register("description")} /></div>
          <label className="flex items-center gap-3 text-sm sm:col-span-2"><Switch checked={watch("active")} onCheckedChange={(c) => setValue("active", c)} /> Oferta ativa (inativas não podem ser enviadas)</label>
          <DialogFooter className="sm:col-span-2"><Button type="submit" variant="hero" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar produto"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProductsPage() {
  const { data: products, isLoading } = useRows("products");
  const del = useDeleteRows("products");
  const [search, setSearch] = useState("");
  const [store, setStore] = useState("all");
  const [editing, setEditing] = useState<Tables<"products"> | null>(null);
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => (products ?? []).filter((p) => (store === "all" || p.store === store) && p.name.toLowerCase().includes(search.toLowerCase())), [products, store, search]);

  return (
    <>
      <PageHeader title="Produtos e ofertas" description="Cadastre uma vez e reutilize em mensagens, disparos, filas e campanhas." actions={<Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Novo produto</Button>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Pesquisar produtos" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={store} onValueChange={setStore}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todas as lojas</SelectItem>{STORES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {isLoading ? <LoadingRows /> : !products?.length ? (
        <EmptyState icon={ShoppingBag} title="Nenhum produto cadastrado" text="Cadastre produtos com preços, cupom e seu link de afiliado." action={<Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Cadastrar produto</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const pct = discountPercent(p.original_price, p.promo_price);
            return (
              <div key={p.id} className="surface-card flex flex-col overflow-hidden">
                <div className="relative aspect-[16/9] bg-muted">
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="size-full object-cover" loading="lazy" /> : <div className="grid size-full place-items-center text-muted-foreground"><ImageOff /></div>}
                  {pct && <Badge variant="lime" className="absolute left-3 top-3">-{pct}%</Badge>}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">{storeLabel(p.store)} {p.category && <>· {p.category}</>} <span className="ml-auto"><StatusBadge status={p.status} /></span></div>
                  <h3 className="mt-2 line-clamp-2 font-semibold">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-xl font-extrabold text-lime">{formatBRL(p.promo_price ?? p.original_price)}</span>
                    {p.promo_price && p.original_price && <s className="text-sm text-muted-foreground">{formatBRL(p.original_price)}</s>}
                  </div>
                  {p.coupon && <p className="mt-1 text-xs">🎟️ <b>{p.coupon}</b></p>}
                  {!p.affiliate_url && <p className="mt-2 text-xs text-warning">Sem link de afiliado</p>}
                  <p className="mt-auto pt-3 text-xs text-muted-foreground">Cadastrado em {formatDate(p.created_at)}</p>
                  <div className="mt-3 flex gap-1 border-t border-border pt-3">
                    <Button asChild variant="soft" size="sm" className="flex-1"><Link to="/painel/mensagens" search={{ produto: p.id }}><MessageSquareText /> Mensagem</Link></Button>
                    <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => { setEditing(p); setOpen(true); }}><Pencil /></Button>
                    <ConfirmButton trigger={<Button variant="ghost" size="icon" aria-label="Excluir"><Trash2 /></Button>} title="Excluir produto?" description={`"${p.name}" será removido.`} confirmLabel="Excluir" onConfirm={() => del.mutate([p.id])} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ProductDialog open={open} onOpenChange={setOpen} product={editing} />
    </>
  );
}
