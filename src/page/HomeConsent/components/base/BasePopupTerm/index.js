import './index.scss'
export default function BasePopupTerm({ children, isOpen, onClose = () => {}, title = '', textButton = '', onConfirm = () => {} }) {
  return (
    isOpen && (
      <div className="BasePopupTerm">
        <div className="BasePopupTerm_blur" onClick={onClose}></div>
        <div className="BasePopupTerm_slide">
          {/* <div className="BasePopupTerm_slide_line"></div> */}
          <div className="BasePopupTerm_slide_title">{title}</div>
          <div className="BasePopupTerm_slide_content">{children}</div>
          {textButton && (
            <div className="BasePopupTerm_slide_button" onClick={onClose}>
              Đóng
            </div>
          )}
        </div>
      </div>
    )
  )
}
