import sanitizeHtml from 'sanitize-html';

/**
 * Allow-list matches exactly what the frontend's Tiptap editor
 * (StarterKit with codeBlock/horizontalRule disabled) can produce.
 * The API never trusts the client to only ever send editor-generated
 * HTML — a request can bypass the editor entirely — so this is the
 * real enforcement point, not the editor's schema.
 */
const ALLOWED_TAGS = [
  'p',
  'strong',
  'em',
  's',
  'u',
  'code',
  'a',
  'ul',
  'ol',
  'li',
  'blockquote',
  'br',
  'h1',
  'h2',
  'h3',
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'target', 'rel'],
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
  });
}

/**
 * Tiptap reports an editor with no real content as "<p></p>" rather
 * than an empty string, and it's what an "empty" rich-text field looks
 * like after sanitizing too (sanitizing can only remove tags, never
 * collapse this down further).
 */
function isEmptySanitized(sanitized: string): boolean {
  const trimmed = sanitized.trim();
  return trimmed.length === 0 || trimmed === '<p></p>';
}

/**
 * Normalizes "no real content" to null so "review not written yet" can
 * be queried as a plain IS NULL instead of a fragile string match.
 */
export function normalizeOptionalRichText(html?: string): string | null {
  const sanitized = sanitizeRichText(html ?? '');
  return isEmptySanitized(sanitized) ? null : sanitized;
}

/**
 * For required rich-text fields (e.g. rationale) — a plain @Length(1, n)
 * validator would still pass an editor left empty, since "<p></p>" is a
 * non-zero-length string. Callers check this after sanitizing to reject
 * that case with a real error instead of silently persisting it.
 */
export function isEmptyRichText(html: string): boolean {
  return isEmptySanitized(sanitizeRichText(html));
}
