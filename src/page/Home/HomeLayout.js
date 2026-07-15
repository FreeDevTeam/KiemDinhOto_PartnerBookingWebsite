import { useAppParamsContext } from '../../context/AppParamsContext'
import { ConsentContextProvider, useConsentContext } from '../../context/ConsentContext'
import MainLogo from '../../components/MainLogo'
import HomeConsent from '../HomeConsent'
import HomeLayout2 from './HomeLayout2'
import { LocalStorageManager } from '../../helper/localStorage'
import { getPartnerConfig } from '../../constants/partnerConfig'

function HomeLayoutContent() {
  const { isConsentHydrated, shouldShowConsent } = useConsentContext()

  if (!isConsentHydrated) {
    return (
      <div className="loading">
        <div className="text-center">
          <MainLogo height={60} width={60}></MainLogo>
        </div>
      </div>
    )
  }

  if (shouldShowConsent) {
    return <HomeConsent />
  }

  return <HomeLayout2 />
}

export default function HomeLayout() {
  const { homeMiniappConsentMode } = useAppParamsContext()

  const partnerName = LocalStorageManager.getItem('partnerName')
  const partnerConfig = partnerName ? getPartnerConfig(partnerName) : null

  let resolvedConsentMode
  if (partnerConfig && partnerConfig.requireConsent) {
    resolvedConsentMode = partnerConfig.consentMode
  } else if (!partnerConfig && homeMiniappConsentMode) {
    resolvedConsentMode = undefined // user bình thường, bỏ qua consent
  } else {
    resolvedConsentMode = undefined
  }

  return (
    <ConsentContextProvider initialConsentMode={resolvedConsentMode}>
      <HomeLayoutContent />
    </ConsentContextProvider>
  )
}

