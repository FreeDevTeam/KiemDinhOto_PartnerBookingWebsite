import BaseButton from './components/base/BaseButton'
import FixedBottom from './components/base/FixedBottom'
import './index.scss'
import { Checkbox } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BasePopupTerm from './components/base/BasePopupTerm'
import { useConsentContext } from '../../context/ConsentContext'
import { useGlobalContext } from '../../context/GlobalContext'
import { useAppParamsContext } from '../../context/AppParamsContext'
import InfoConsentMode1 from './conponents/ConsentMode/InfoConsentMode1'
import InfoConsentMode2 from './conponents/ConsentMode/InfoConsentMode2'
import InfoConsentMode3 from './conponents/ConsentMode/InfoConsentMode3'
import { EMPTY_MODE2_USER_PROFILE, getActiveMode2PartnerFlow, resetMode2PartnerFlow, resolveMode2PartnerData } from './mode2PartnerFlow'
// import { PATH } from '../../constants/router'



export default function HomeConsent() {
  const { consentSessionState } = useConsentContext()
  const consentMode = consentSessionState?.consentMode

  const CONSENT_MODE_1 = 1
  const CONSENT_MODE_2 = 2
  const CONSENT_MODE_3 = 3
  const renderConsentModeInfo = () => {
    if (consentMode === CONSENT_MODE_1) {
      return <InfoConsentMode1 />
    }
    if (consentMode === CONSENT_MODE_2) {
      return <InfoConsentMode2 />
    }
    if (consentMode === CONSENT_MODE_3) {
      return <InfoConsentMode3 />
    }
  }

  return <div style={{ maxWidth: 600, margin: 'auto', minHeight: '100vh' }}>{renderConsentModeInfo()}</div>
}
