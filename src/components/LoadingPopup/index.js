
import React from 'react'
import "./index.scss"

const LoadingPopup = ({type = "full", className, noText}) => { // full và content : toàn màn hình và trong thành phần hiện có, mặc định full
  return (
    <div className={`loadingPopup ${"loadingPopup-" + type} ${className}`}>
      <img src={"/logo.png"} alt="" />
      <span className='title-very-small'>{!noText ? "Đang tải dữ liệu..." : ""}</span>
    </div>
  )
}

export default LoadingPopup