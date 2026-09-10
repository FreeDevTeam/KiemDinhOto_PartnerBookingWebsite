import React from 'react';
import { Modal, Button } from 'antd';
import { ReactComponent as SuccessIcon } from '../../../assets/icons/BIDV/iconSuccessNoti.svg';
import { ReactComponent as ErrorIcon } from '../../../assets/icons/BIDV/iconErrorNoti.svg';
import { ReactComponent as InfoIcon } from '../../../assets/icons/BIDV/iconInfoNoti.svg';
import './index.scss';

const BasicAlertPopup = ({
  visible,
  onClose,
  type = 'info', // 'success', 'error', 'info'
  title,
  content,
  buttonText = 'Xác nhận',
  onConfirm,
  extraContent,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'info':
      default:
        return null;
    }
  };

  const iconElement = getIcon();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      title={null}
      visible={visible}
      footer={null}
      closable={false}
      maskClosable={false}
      keyboard={false}
      centered
      className="basic-alert-popup"
      width={400}
    >
      <div className="basic-alert-container">
        {iconElement && (
          <div className="basic-alert-icon">
            {iconElement}
          </div>
        )}
        {title && <div className="basic-alert-title">{title}</div>}
        <div className="basic-alert-content">
          {typeof content === 'string' ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            content
          )}
        </div>
        
        {extraContent && (
          <div className="basic-alert-extra">
            {extraContent}
          </div>
        )}

        <Button 
          className="login__button df basic-alert-button" 
          type="primary" 
          size="large" 
          onClick={handleConfirm}
          block
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
};

export default BasicAlertPopup;
