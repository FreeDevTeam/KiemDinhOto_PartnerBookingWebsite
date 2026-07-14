import React from 'react'
import addKeyLocalStorage from '../../helper/localStorage'

function LayoutPage(props) {
  const { Component, isFullScreen } = props
  const dataTheme = (JSON.parse(localStorage.getItem(addKeyLocalStorage('dataTheme'))) || {})
  return (
    <div className={isFullScreen ? "" : "app-main-wrapper"}>
      {
        dataTheme?.partnerColorButton && 
         <style>{`
          .ant-spin-dot-item {
            background-color: ${dataTheme?.partnerColorButton} !important;
          }
          .ant-input:focus, .ant-input:hover {
            border-color: #d9d9d9 !important;
          }
          .ant-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
            background-color: color-mix(in srgb, ${dataTheme?.partnerColorButton} 10%, transparent);
          }
          .ant-select-selector {
            border-color: #d9d9d9 !important;
          }
        `}</style>
      }
      <Component {...props} />
    </div>
  )
}


export default LayoutPage