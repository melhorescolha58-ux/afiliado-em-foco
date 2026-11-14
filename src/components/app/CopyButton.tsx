import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

export function CopyButton({ text, label = "Copiar", ...props }: { text: string; label?: string } & ButtonProps) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      {...props}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast.success("Copiado!");
          setTimeout(() => setDone(false), 1500);
        } catch {
          toast.error("Não foi possível copiar.");
        }
      }}
    >
      {done ? <Check /> : <Copy />} {label}
    </Button>
  );
}
