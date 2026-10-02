export type PreviewKind = 'image' | 'video' | 'pdf' | 'docx';

const DOCX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/**
 * 根据 MIME 类型（必要时回退文件名后缀）判断可用的预览方式。
 *
 * 优先使用 contentType；上传链路允许 contentType 为空，此时用扩展名兜底识别 docx。
 * 返回 null 表示该格式不在预览支持范围内，调用方应提示下载查看。
 * 本函数是「能否预览」的唯一判定来源，入口门禁与预览面板共用，避免两处规则漂移。
 */
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
