export type PreviewKind = 'image' | 'video' | 'pdf' | 'docx';

const DOCX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function resolvePreviewKind(
  contentType?: string | null,
  fileName?: string | null
): PreviewKind | null {
  if (contentType?.startsWith('image/')) return 'image';
  if (contentType?.startsWith('video/')) return 'video';
  if (contentType === 'application/pdf') return 'pdf';
  if (contentType === DOCX_CONTENT_TYPE) return 'docx';
  if (!contentType && fileName?.toLowerCase().endsWith('.docx')) return 'docx';
  return null;
}
