import React from 'react'
import EmptyImage from '../../../../assets/img/tax-empty-result.png'
import './index.scss'

const TaxEmptyResult = ({
  message = 'Không tìm thấy thông tin. Vui lòng kiểm tra lại',
}) => {
  return (
    <div className="tax-empty-result">
      <img
        className="tax-empty-result__image"
        src={EmptyImage}
        alt="Không tìm thấy thông tin"
      />

      <div className="tax-empty-result__message">
        {message}
      </div>
    </div>
  )
}

export default TaxEmptyResult