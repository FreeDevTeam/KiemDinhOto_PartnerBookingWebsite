
import React from 'react'
import "./index.scss"
import MainLogo from '../MainLogo'
import addKeyLocalStorage from '../../helper/localStorage'

const LoadingPopup = ({type = "full", className, noText}) => { // full và content : toàn màn hình và trong thành phần hiện có, mặc định full
  const dataTheme = JSON.parse(localStorage.getItem(addKeyLocalStorage('dataTheme'))) || {}
  const logo = dataTheme?.stationsLogo
  
  return (
    <div className={`loadingPopup ${"loadingPopup-" + type} ${className}`}>
      {logo ? (
        <img src={logo} alt="Logo" style={{ height: '60px', width: '90px', objectFit: 'contain' }} />
      ) : (
        <MainLogo height={60} width={60}></MainLogo>
      )}
      <span className='title-very-small'>{!noText ? "Đang tải dữ liệu..." : ""}</span>
    </div>
  )
}

export default LoadingPopup