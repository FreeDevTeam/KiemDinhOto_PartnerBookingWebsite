import React, { useEffect, useMemo, useState } from 'react'
import addKeyLocalStorage from '../../helper/localStorage'

export default function MainLogo({
    ...rest
}) {
    const logoFromQuery = (() => {
        try {
            const params = new URLSearchParams(window.location.search)
            const raw = params.get('logo')
            return raw ? raw.trim().replace(/\.png$/i, '') : ''
        } catch (error) {
            return ''
        }
    })()

    if (logoFromQuery) {
        localStorage.setItem('miniappLogo', logoFromQuery)
    }

    const customLogoName = logoFromQuery || localStorage.getItem('miniappLogo') || ''
    const customLogoCandidates = useMemo(() => {
        if (!customLogoName) return []
        return [
            `/${customLogoName}.png`,
            `/${customLogoName}/logo.png`,
            `/${customLogoName}/MAINLOGO.png`
        ]
    }, [customLogoName])

    const localLogo = (JSON.parse(localStorage.getItem(addKeyLocalStorage('dataTheme'))) || {})?.stationsLogo
    const [customLogoIndex, setCustomLogoIndex] = useState(0)

    useEffect(() => {
        setCustomLogoIndex(0)
    }, [customLogoName])

    const customLogoSrc = customLogoCandidates[customLogoIndex] || ''

    const handleLogoError = (event) => {
        if (customLogoSrc && customLogoIndex < customLogoCandidates.length - 1) {
            setCustomLogoIndex((prev) => prev + 1)
            return
        }
        event.currentTarget.onerror = null
        event.currentTarget.src = '/logo.png'
    }

    return (
        customLogoSrc
        ? <img src={customLogoSrc} alt='' onError={handleLogoError} {...rest}/>
        : localLogo
        ? <img src={localLogo} alt='' onError={handleLogoError} {...rest}/>
        : <img src={"/logo.png"} alt='' {...rest}/>
    )

}