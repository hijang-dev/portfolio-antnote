import { describe, expect, it } from 'vitest';
import {
  isEmptyRichText,
  normalizeOptionalRichText,
  sanitizeRichText,
} from './sanitize-rich-text.js';

describe('sanitizeRichText', () => {
  it('strips tags outside the editor allow-list', () => {
    const result = sanitizeRichText(
      '<p>안전한 내용</p><script>alert(1)</script><img src=x onerror=alert(1)>',
    );

    expect(result).toBe('<p>안전한 내용</p>');
  });

  it('keeps allow-listed formatting', () => {
    const result = sanitizeRichText(
      '<p><strong>굵게</strong> <em>기울임</em></p><ul><li>항목</li></ul>',
    );

    expect(result).toBe(
      '<p><strong>굵게</strong> <em>기울임</em></p><ul><li>항목</li></ul>',
    );
  });

  it('drops javascript: URLs from links', () => {
    const result = sanitizeRichText('<a href="javascript:alert(1)">click</a>');

    expect(result).not.toContain('javascript:');
  });
});

describe('isEmptyRichText', () => {
  it('treats an empty Tiptap paragraph as empty', () => {
    expect(isEmptyRichText('<p></p>')).toBe(true);
  });

  it('treats a script-only payload as empty once sanitized', () => {
    expect(isEmptyRichText('<script>alert(1)</script>')).toBe(true);
  });

  it('treats real content as non-empty', () => {
    expect(isEmptyRichText('<p>실적 개선 기대</p>')).toBe(false);
  });
});

describe('normalizeOptionalRichText', () => {
  it('treats an empty Tiptap paragraph as null', () => {
    expect(normalizeOptionalRichText('<p></p>')).toBeNull();
  });

  it('treats undefined as null', () => {
    expect(normalizeOptionalRichText(undefined)).toBeNull();
  });

  it('keeps real content', () => {
    expect(normalizeOptionalRichText('<p>복기 내용</p>')).toBe(
      '<p>복기 내용</p>',
    );
  });
});
