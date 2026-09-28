import { useQuery } from '@tanstack/react-query';
import Spin from 'antd/es/spin';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { driveApi } from '../api/driveApi';
import { resolvePreviewKind } from '../lib/drivePreview';
import type { DriveNode } from '../model/types';
import './DriveMediaPreview.css';

function previewErrorText(error: unknown, isDocument: boolean): string {
  if (!isDocument) return '媒体预览加载失败，请稍后重试';
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message;
    }
  }
  return '文档预览失败，可下载后查看';
}

export interface DriveMediaPreviewProps {
  node: DriveNode | null;
}

/**
 * 图片 / 视频 / PDF / Word 文档在线预览面板。
 * docx 由服务端临时转换为 PDF 后内嵌展示，原文件不受影响。
 * 调用方在切换 node 时请传入 key（如 key={node.id}），以便重置失败态。
 */
export function DriveMediaPreview({ node }: DriveMediaPreviewProps) {
  const [mediaFailed, setMediaFailed] = useState(false);
  const fileId = node?.fileId ?? null;
  const kind = resolvePreviewKind(node?.contentType, node?.name);
  const isDocument = kind === 'docx';

  const query = useQuery({
    queryKey: ['drive-image-preview-url', fileId],
    enabled: Boolean(fileId) && Boolean(kind),
    staleTime: 8 * 60 * 1000,
    retry: isDocument ? false : undefined,
    queryFn: () => driveApi.createPreviewUrl(fileId!),
  });

  if (!kind) {
    return <span className="drive-preview-hint">该格式暂不支持在线预览，可下载后查看</span>;
  }

  const url = query.data?.url;
  const failed = query.isError || mediaFailed;

  return (
    <div className="drive-preview-body">
      {query.isLoading && (
        <div className="drive-preview-loading">
          <Spin />
          {isDocument && <span className="drive-preview-hint">正在转换文档，请稍候…</span>}
        </div>
      )}
      {!query.isLoading && failed && (
        <span className="drive-preview-error">{previewErrorText(query.error, isDocument)}</span>
      )}
      {!query.isLoading && !failed && url && kind === 'image' && (
        <img
          className="drive-preview-image"
          src={url}
          alt={node?.name ?? '图片预览'}
          onError={() => setMediaFailed(true)}
        />
      )}
      {!query.isLoading && !failed && url && kind === 'video' && (
        <video
          className="drive-preview-video"
          src={url}
          controls
          onError={() => setMediaFailed(true)}
        />
      )}
      {!query.isLoading && !failed && url && (kind === 'pdf' || kind === 'docx') && (
        <iframe
          className="drive-preview-pdf"
          src={url}
          title={node?.name ?? (kind === 'pdf' ? 'PDF 预览' : '文档预览')}
        />
      )}
    </div>
  );
}
