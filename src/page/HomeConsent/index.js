import './index.scss'
import { useConsentContext } from '../../context/ConsentContext'
import InfoConsentMode1 from './consentMode/InfoConsentMode1'
import InfoConsentMode2 from './consentMode/InfoConsentMode2'
import InfoConsentMode3 from './consentMode/InfoConsentMode3'

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
