import addKeyLocalStorage from '../../helper/localStorage'
import { ReactComponent as LogoTTDK } from './../../assets/icons/Logo.svg'

export default function MainLogo({
    ...rest
}) {
    const localLogo = (JSON.parse(localStorage.getItem(addKeyLocalStorage('dataTheme'))) || {})?.stationsLogo
    
    if (process.env.REACT_APP_THEME_NAME === 'IHANOI' && !localLogo) {
        return <img src='/logo.png' alt='' {...rest}/>
    }
    
    return (
        localLogo
        ? <img src={localLogo} alt='' {...rest}/>
        : <LogoTTDK {...rest} />
    )

}