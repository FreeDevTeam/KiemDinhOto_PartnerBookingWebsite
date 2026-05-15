import React from 'react'
import { HOME_CONFIG_CATEGORY } from '../../../../constants/Layout2Constants'
import TaxHomeConfigSection from '../TaxHomeConfigSection'

const TaxSupportSection = () => {
  return (
    <TaxHomeConfigSection
      title="Đơn vị hỗ trợ"
      category={HOME_CONFIG_CATEGORY.SUPPORT_PARTNER}
    />
  )
}

export default TaxSupportSection