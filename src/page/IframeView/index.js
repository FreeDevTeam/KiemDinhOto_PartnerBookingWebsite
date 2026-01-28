import React, { useEffect } from 'react'
import './index.scss'
import { useHistory, useLocation } from 'react-router-dom'
import { MESSAGE_BACK_TO_HOME_MINI_APP, PARAM_URL_IFRAME } from '../../constants/params'
import { decodeLink } from '../../helper/common'

export default function IframeView() {
  const history = useHistory()
  const location = useLocation()
  const searchparam = location.search
  const params = new URLSearchParams(searchparam)
  const url = params.get(PARAM_URL_IFRAME)
  const urlIframeDecode = url ? decodeLink(url) : null
  useEffect(() => {
    if (!urlIframeDecode) return history.replace('/')

    let iframeOrigin

    try {
      iframeOrigin = new URL(urlIframeDecode).origin
    } catch {
      console.warn('Invalid iframe URL:', urlIframeDecode)
      return history.replace('/')
    }

    const listener = (event) => {
      if (event.origin !== iframeOrigin) return

      const data = event?.data

      if (data === MESSAGE_BACK_TO_HOME_MINI_APP || data?.action === MESSAGE_BACK_TO_HOME_MINI_APP || data?.key === MESSAGE_BACK_TO_HOME_MINI_APP) {
        history.replace('/')
      }
    }

    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [urlIframeDecode, history])

  return (
    <div className="IframeView">
      <iframe
        key={urlIframeDecode}
        src={urlIframeDecode}
        width="100%"
        height="100%"
        title="iframeView"
        sandbox="
          allow-same-origin
          allow-scripts
          allow-forms
          allow-modals
          allow-popups
          allow-popups-to-escape-sandbox
          allow-top-navigation
          allow-top-navigation-by-user-activation
          allow-downloads
          allow-downloads-without-user-activation
          allow-pointer-lock
          allow-presentation
        "
        allow="
          accelerometer;
          ambient-light-sensor;
          autoplay;
          battery;
          camera;
          clipboard-read;
          clipboard-write;
          display-capture;
          document-domain;
          encrypted-media;
          fullscreen;
          gamepad;
          geolocation;
          gyroscope;
          hid;
          identity-credentials-get;
          idle-detection;
          local-fonts;
          magnetometer;
          microphone;
          midi;
          payment;
          picture-in-picture;
          publickey-credentials-get;
          screen-wake-lock;
          serial;
          usb;
          web-share;
          xr-spatial-tracking
        "
        allowfullscreen
      />
    </div>
  )
}
