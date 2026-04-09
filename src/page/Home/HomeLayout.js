import { useAppParamsContext } from '../../context/AppParamsContext'
import { ConsentContextProvider, useConsentContext } from '../../context/ConsentContext'
import MainLogo from '../../components/MainLogo'
import HomeConsent from '../HomeConsent'
import HomeLayout2 from './HomeLayout2'

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

  return (
    <ConsentContextProvider initialConsentMode={homeMiniappConsentMode}>
      <HomeLayoutContent />
    </ConsentContextProvider>
  )
}
