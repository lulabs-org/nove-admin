import Modal from 'antd/es/modal';
import { DriveMediaPreview } from './DriveMediaPreview';
import { resolvePreviewKind } from '../lib/drivePreview';
import type { DriveNode } from '../model/types';
import './DriveMediaPreviewModal.css';

export interface DriveMediaPreviewModalProps {
  node: DriveNode | null;
  onClose: () => void;
}

export function DriveMediaPreviewModal({ node, onClose }: DriveMediaPreviewModalProps) {
  const kind = resolvePreviewKind(node?.contentType, node?.name);
  const width = kind === 'video' ? 880 : kind === 'pdf' || kind === 'docx' ? 960 : 760;

  return (
    <Modal
      open={Boolean(node)}
      title={node?.name}
      footer={null}
      width={width}
      onCancel={onClose}
      className="drive-preview-modal"
      centered
      destroyOnHidden
    >
      <DriveMediaPreview key={node?.id ?? 'empty'} node={node} />
    </Modal>
  );
}
