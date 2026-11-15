import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRows } from "@/lib/db";

export function GroupPicker({ value, onChange, allowedGroupIds }: { value: string[]; onChange: (ids: string[]) => void; allowedGroupIds?: Set<string> }) {
  const { data: groups = [] } = useRows("groups", { order: "name", ascending: true });
  const { data: categories = [] } = useRows("group_categories", { order: "name", ascending: true });
  const [q, setQ] = useState("");
  const active = groups.filter((g) => g.is_active && (!allowedGroupIds || allowedGroupIds.has(g.id)));
  const list = useMemo(() => active.filter((g) => g.name.toLowerCase().includes(q.toLowerCase())), [active, q]);
  const sel = new Set(value);

  function toggleCategory(catId: string) {
    const ids = active.filter((g) => g.category_id === catId).map((g) => g.id);
    const all = ids.every((id) => sel.has(id));
    const next = new Set(sel);
    ids.forEach((id) => (all ? next.delete(id) : next.add(id)));
    onChange([...next]);
  }

  if (!groups.length) return <p className="text-sm text-muted-foreground">Você ainda não cadastrou grupos.</p>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <Button type="button" size="sm" variant={value.length === active.length && active.length > 0 ? "soft" : "outline"} onClick={() => onChange(value.length === active.length ? [] : active.map((g) => g.id))}>
          Todos ({active.length})
        </Button>
        {categories.map((c) => {
          const n = active.filter((g) => g.category_id === c.id).length;
          if (!n) return null;
          const all = active.filter((g) => g.category_id === c.id).every((g) => sel.has(g.id));
          return (
            <Button key={c.id} type="button" size="sm" variant={all ? "soft" : "outline"} onClick={() => toggleCategory(c.id)}>
              {c.name} ({n})
            </Button>
          );
        })}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar grupo" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
        {list.map((g) => (
          <label key={g.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            <Checkbox checked={sel.has(g.id)} onCheckedChange={() => { const n = new Set(sel); if (n.has(g.id)) n.delete(g.id); else n.add(g.id); onChange([...n]); }} />
            <span className="flex-1 truncate">{g.name}</span>
            {categories.find((c) => c.id === g.category_id) && <Badge variant="muted">{categories.find((c) => c.id === g.category_id)!.name}</Badge>}
          </label>
        ))}
        {!list.length && <p className="p-2 text-sm text-muted-foreground">Nenhum grupo ativo encontrado.</p>}
      </div>
      <p className="text-xs text-muted-foreground"><b className="text-foreground">{value.length}</b> grupo(s) selecionado(s)</p>
    </div>
  );
}
