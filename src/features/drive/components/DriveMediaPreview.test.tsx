import { describe, expect, it } from 'vitest';
import { resolvePreviewKind } from '../lib/drivePreview';

const DOCX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

describe('resolvePreviewKind', () => {
  it('resolves image, video and PDF content types', () => {
    expect(resolvePreviewKind('image/png', 'photo.png')).toBe('image');
    expect(resolvePreviewKind('video/mp4', 'clip.mp4')).toBe('video');
    expect(resolvePreviewKind('application/pdf', 'report.pdf')).toBe('pdf');
  });

  it('resolves docx by content type or file extension', () => {
    expect(resolvePreviewKind(DOCX_CONTENT_TYPE, 'invoice.docx')).toBe('docx');
    expect(resolvePreviewKind(null, 'invoice.docx')).toBe('docx');
    expect(resolvePreviewKind(undefined, 'INVOICE.DOCX')).toBe('docx');
  });

  it('returns null for unsupported formats', () => {
    expect(resolvePreviewKind(null, null)).toBeNull();
    expect(resolvePreviewKind('', 'sheet.xlsx')).toBeNull();
    expect(resolvePreviewKind('application/vnd.ms-excel', 'legacy.xls')).toBeNull();
  });
});
