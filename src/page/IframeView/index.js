import React, { useEffect, useState } from 'react'
import './index.scss'
import { useHistory, useLocation } from 'react-router-dom'
import { MESSAGE_BACK_TO_HOME_MINI_APP, PARAM_IFRAME_URL } from '../../constants/params'
import { decodeLink } from '../../helper/common'
import TaxPageHeader from '../TaxCDS/components/TaxPageHeader'
import { getBannerBySectionCache } from '../../helper/getBannerBySectionCache'

export default function IframeView() {
  const history = useHistory()
  const location = useLocation()
  const searchparam = location.search
  const params = new URLSearchParams(searchparam)
  const url = params.get(PARAM_IFRAME_URL)
  const urlIframeDecode = url ? decodeLink(url) : null
  const iframeTitle =
  sessionStorage.getItem('IFRAME_HEADER_TITLE') ||
  process.env.REACT_APP_HOME_HEADER_TITLE ||
  'TaxCDS'
  const isShowIframeTaxHeader = process.env.REACT_APP_SHOW_HOME_TAX_HEADER === 'true'

  const [banner, setBanner] = useState(null)
  const isShowIframeTaxBanner = process.env.REACT_APP_SHOW_IFRAME_TAX_BANNER === 'true'
  const iframeBannerSection = process.env.REACT_APP_IFRAME_TAX_BANNER_SECTION || '2001'

  useEffect(() => {
  if (!isShowIframeTaxBanner) return

  getBannerBySectionCache(iframeBannerSection).then((data) => {
    const firstBanner = Array.isArray(data) ? data[0] : null
    setBanner(firstBanner || null)
  })
}, [isShowIframeTaxBanner, iframeBannerSection])
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
      {isShowIframeTaxHeader && (
        <div className="IframeView_header">
          <TaxPageHeader
            title={iframeTitle}
            onBack={() => {
              history.goBack()
            }}
          />
        </div>
      )}
      {isShowIframeTaxBanner && banner?.bannerImageUrl && (
        <div className="IframeView_banner">
          <button
            type="button"
            className="IframeView_bannerButton"
            onClick={() => {
              if (banner?.bannerUrl) {
                window.location.href = banner.bannerUrl
              }
            }}
          >
            <img src={banner.bannerImageUrl} alt={banner.bannerName || 'Banner'} />
          </button>
        </div>
      )}
      <div className="IframeView_body">
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
          allowFullScreen
        />
      </div>
    </div>
)
}
