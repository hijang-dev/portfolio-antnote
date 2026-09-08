/**
 * Renders HTML that already went through the backend's sanitize-html
 * allow-list (src/common/sanitize/ on the API side) — dangerouslySetInnerHTML
 * is safe here specifically because the server, not the client, is the
 * enforcement point for what tags/attributes can appear.
 */
export function RichTextView({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
