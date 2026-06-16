import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ReactComponent as SupportIcon } from '../../../assets/icons/support.svg';
import { ReactComponent as IconPhoneCircleBrand } from '../../../assets/icons/phone_circle_brand.svg';
import { ReactComponent as IconPhoneCallStroke } from '../../../assets/icons/phone_call_stroke.svg';
import BaseBottomSheetPopup from '../BaseBottomSheetPopup';
import { parseFromLocalStorage } from '../../../helper/localStorage';
import './index.scss';

const ALLOWED_PARTNERS_FOR_SUPPORT = [
  process.env.REACT_APP_MINIAPP_F88,
  // process.env.REACT_APP_MINIAPP_VNPAY, // Mở ra nếu sau này cần bật trên VNPAY
];

const checkIsShowSupportButton = () => {
  return ALLOWED_PARTNERS_FOR_SUPPORT.some(partnerKey => {
    if (!partnerKey) return false;
    const val = parseFromLocalStorage(partnerKey);
    return val === 1 || val === true;
  });
};

const CustomerSupportButton = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  const [rightPos, setRightPos] = useState('20px');
  
  const isShowSupportButton = checkIsShowSupportButton();

  useEffect(() => {
    setMounted(true);

    const updatePosition = () => {
      const container = document.querySelector('.layout2-body');
      if (container) {
        const rect = container.getBoundingClientRect();
        const distanceToRightEdgeOfScreen = window.innerWidth - rect.right;
        // Đặt nút cách lề phải của container 20px
        const calculatedRight = distanceToRightEdgeOfScreen > 0 ? distanceToRightEdgeOfScreen + 20 : 20;
        setRightPos(`${calculatedRight}px`);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  if (!mounted || !isShowSupportButton) return null;

  return (
    <>
      {/* Chỉ hiển thị icon nếu popup ĐANG ĐÓNG */}
      {!isOpenPopup && ReactDOM.createPortal(
        <div className="floating-support-wrapper">
          <div 
            className="floating-support-button"
            style={{ right: rightPos }}
            onClick={() => setIsOpenPopup(true)}
          >
            <IconPhoneCircleBrand />
          </div>
        </div>,
        document.body
      )}

      {/* Popup hỗ trợ khách hàng */}
      <BaseBottomSheetPopup 
        open={isOpenPopup} 
        onClose={() => setIsOpenPopup(false)}
        title="Trung tâm hỗ trợ"
      >
        <div className="CustomerSupportPopup_body">
          <div className="CustomerSupportPopup_contact">
            <div className="CustomerSupportPopup_contact_icon">
              <IconPhoneCircleBrand />
            </div>
            <div className="CustomerSupportPopup_contact_content">
              <div className="CustomerSupportPopup_contact_text">
                Gọi tổng đài TAMOVE (8:30 - 17:30 từ Thứ 2 đến Thứ 6) để nhận hỗ trợ nhanh về chính sách dịch vụ và các vấn đề tra cứu giao thông.
              </div>
            </div>
          </div>

          <a className="CustomerSupportPopup_action" href="tel:02433886798">
            <IconPhoneCallStroke className="CustomerSupportPopup_action_icon" />
            <span>Gọi tổng đài 024 3388 6798</span>
          </a>
        </div>
      </BaseBottomSheetPopup>
    </>
  );
};

export default CustomerSupportButton;
