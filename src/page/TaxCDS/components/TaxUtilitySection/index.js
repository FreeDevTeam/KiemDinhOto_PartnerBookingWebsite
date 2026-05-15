import React from 'react'
import { HOME_CONFIG_CATEGORY } from '../../../../constants/Layout2Constants'
import TaxHomeConfigSection from '../TaxHomeConfigSection'

const TaxUtilitySection = () => {
  return (
    <TaxHomeConfigSection
      title="Tiện ích"
      category={HOME_CONFIG_CATEGORY.UTILITIES}
    />
  )
}

export default TaxUtilitySection