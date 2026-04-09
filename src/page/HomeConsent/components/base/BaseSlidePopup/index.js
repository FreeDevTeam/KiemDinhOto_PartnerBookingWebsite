import BaseButton from '../BaseButton'
import './index.scss'
export default function BaseSlidePopup({ children, isOpen, onClose = () => {}, title = '', textButton = '', onConfirm = () => {} }) {
  return (
    isOpen && (
      <div className="BaseSlidePopup">
        <div className="BaseSlidePopup_blur" onClick={onClose}></div>
        <div className="BaseSlidePopup_slide">
          <div className="BaseSlidePopup_slide_line"></div>
          <div className="BaseSlidePopup_slide_title">{title}</div>
          <div className="BaseSlidePopup_slide_content">{children}</div>
          {textButton && (
            <div className="BaseSlidePopup_slide_button">
              <BaseButton onClick={onConfirm}>{textButton}</BaseButton>
            </div>
          )}
        </div>
      </div>
    )
  )
}
