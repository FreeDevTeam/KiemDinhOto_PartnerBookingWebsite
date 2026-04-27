import addKeyLocalStorage from '../../helper/localStorage'

export default function MainLogo({
    ...rest
}) {
    const localLogo = (JSON.parse(localStorage.getItem(addKeyLocalStorage('dataTheme'))) || {})?.stationsLogo
    return (
        localLogo
        ? <img src={localLogo} alt='' {...rest}/>
        : <img src={"/logo.png"} alt='' {...rest}/>
    )

}