import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ReactComponent as IconClose } from '../../../assets/icons/close.svg';
import './index.scss';

export default function BaseBottomSheetPopup({ open = false, onClose = () => {}, title = '', children, className = '' }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className={`BaseBottomSheetPopup ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby="BaseBottomSheetPopup_title">
      <button type="button" className="BaseBottomSheetPopup_overlay" aria-label="Đóng hộp thoại" onClick={onClose}></button>

      <div className="BaseBottomSheetPopup_sheet">
        <div className="BaseBottomSheetPopup_header">
          <div className="BaseBottomSheetPopup_title" id="BaseBottomSheetPopup_title">
            {title}
          </div>

          <button type="button" className="BaseBottomSheetPopup_close" aria-label="Đóng hộp thoại" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="BaseBottomSheetPopup_body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
