/** Renders a WhatsApp-style bubble preview, including *bold* and _italic_ markup. */
export function WhatsPreview({ text, title = "Prévia" }: { text: string; title?: string }) {
  const html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*(.+?)\*/g, "<b>$1</b>")
    .replace(/_(.+?)_/g, "<i>$1</i>")
    .replace(/~(.+?)~/g, "<s>$1</s>")
    .replace(/(https?:\/\/\S+)/g, '<span class="text-primary underline break-all">$1</span>');
  return (
    <div className="rounded-2xl border border-border bg-sidebar p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="ml-auto max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-accent p-3 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }} />
    </div>
  );
}
