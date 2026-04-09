import { useAppParamsContext } from '../../context/AppParamsContext'
import HomeConsent from '../HomeConsent'
import HomeLayout2 from './HomeLayout2'

export default function HomeLayout() {
  const { homeMiniappConsentMode } = useAppParamsContext()
  console.log(homeMiniappConsentMode);
  
  return (
    <div>
      <HomeConsent />
      <HomeLayout2 />
    </div>
  )
}
