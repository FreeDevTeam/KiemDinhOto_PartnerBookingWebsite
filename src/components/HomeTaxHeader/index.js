import React from 'react'
import './index.scss'

const HomeTaxHeader = ({
  title = process.env.REACT_APP_HOME_HEADER_TITLE || 'TaxCDS',
  className = ''
}) => {
  return (
    <div className={`home-tax-header ${className}`}>
      <div className="home-tax-header__status" />

      <div className="home-tax-header__content">
        <div className="home-tax-header__title">{title}</div>
      </div>
    </div>
  )
}

export default HomeTaxHeader