import { useQuery } from '@tanstack/react-query';
import Spin from 'antd/es/spin';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { driveApi } from '../api/driveApi';
import { resolvePreviewKind } from '../lib/drivePreview';
import type { DriveNode } from '../model/types';
import './DriveMediaPreview.css';

/**
 * 预览失败时的提示文案。
 * docx 由服务端转换，失败原因（未配置转换服务、文件过大等）会由接口给出，优先透出；
 * 图片、视频是浏览器直接加载，拿不到接口文案，统一给通用提示。
 */
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
    // 后端签名有效期 10 分钟，这里取 8 分钟，避免复用已过期的地址
    staleTime: 8 * 60 * 1000,
    // docx 失败多是转换服务不可用或文件过大，重试无意义且转换耗时，因此不重试
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
        // docx 由服务端转成临时 PDF 后返回，因此与 pdf 同为 iframe 内嵌展示
        <iframe
          className="drive-preview-pdf"
          src={url}
          title={node?.name ?? (kind === 'pdf' ? 'PDF 预览' : '文档预览')}
        />
      )}
    </div>
  );
}
