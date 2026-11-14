import { WEEKDAYS } from "@/lib/queue-schedule";
import { cn } from "@/lib/utils";

export function WeekdayPicker({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {WEEKDAYS.map((d) => {
        const on = value.includes(d.id);
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => onChange(on ? value.filter((x) => x !== d.id) : [...value, d.id].sort())}
            className={cn("h-9 w-12 rounded-lg border text-sm font-medium transition-colors", on ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-muted")}
          >
            {d.short}
          </button>
        );
      })}
    </div>
  );
}
