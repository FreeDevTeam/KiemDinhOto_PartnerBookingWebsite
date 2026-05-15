import React from 'react'
import { useHistory } from 'react-router-dom'
import BackIcon from '../../../../assets/img/tax-back-icon.png'
import './index.scss'

const TaxPageHeader = ({
  title = 'Tra cứu mã số thuế',
  onBack,
  className = '',
}) => {
  const history = useHistory()

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }

    history.goBack()
  }

  return (
    <div className={`tax-page-header ${className}`}>
      <div className="tax-page-header__status" />

      <div className="tax-page-header__content">
        <button
          type="button"
          className="tax-page-header__back"
          onClick={handleBack}
          aria-label="Quay lại"
        >
          <img src={BackIcon} alt="" />
        </button>

        <div className="tax-page-header__title">{title}</div>
      </div>
    </div>
  )
}

export default TaxPageHeader