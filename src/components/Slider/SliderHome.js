import React, { useState, useMemo, useRef } from 'react'
import Slider from 'react-slick'
import './SliderHome.scss'
import BasicPlaceholder from './../BasicComponent/BasicPlaceholder'
import PopupSheetIframe from '../Popup/PopupSheetIframe'
import addKeyLocalStorage, { saveClickToLocalStorage } from '../../helper/localStorage'
import LogService from '../../services/logService'
import { useHistory } from 'react-router-dom'
import { PATH } from '../../constants/router'
import { PARAM_URL_IFRAME } from '../../constants/params'
import { encodeLink } from '../../helper/common'
import { NAVIGATION_TYPE } from '../../constants/global'

export const handleDirect = (link, type, history) => {
  if (type === NAVIGATION_TYPE.DIRECT) {
    window.location.href = link
  } else if (type === NAVIGATION_TYPE.EXTERNAL) {
    window.open(link, '_blank')
  } else {
    if (!(link?.startsWith("https://") || link?.startsWith("http://"))) {
      history.push(link)
    } else{
      history.push(`${PATH.IFRAME_VIEW}?${PARAM_URL_IFRAME}=${encodeLink(link)}`)
    }
  }
}

const CLICK_STORAGE_KEY = 'recordClickData'
export const SliderHome = (props) => {
  const { setting, isLoading, className, tramId, hideNewsFromZaloMiniApp } = props
  const [popupUrl, setPopupUrl] = useState(null)
  const [sheetVisible, setSheetVisible] = useState(false)
  const intervalRef = useRef(localStorage.getItem(addKeyLocalStorage(CLICK_STORAGE_KEY)))
  const history = useHistory()
  const settingSilde = {
    dots: true,
    infinite: false,
    speed: 500,
		className: props?.center ? "center":'',
    centerMode: props?.center ? true: false,
    centerPadding: props?.center ? "16px" : '',
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay:true,
    autoplaySpeed:5000,
		appendDots: dots => (
      <div style={{ bottom: '16px' }}>
				<ul style={{ margin: "0px", paddingLeft: "10px" }} className='d-flex justify-content-start align-items-end'> {dots} </ul>
      </div>
    ),
		customPaging: i => (
      <div style={{ height: 20 }}>
        <div className="slick-dot"></div>
      </div>
    )
	};

  const handleClickBanner = (item, index) => {
    if (item?.bannerUrl) {
      const link = item?.bannerUrl
      
      // setPopupUrl(item.bannerUrl)
      // setSheetVisible(true)
      if (item?.targetId) {
        saveClickToLocalStorage({ localStorageKey: CLICK_STORAGE_KEY, targetId: item?.targetId })
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            submitClickData()
          }, 30 * 1000) // 30s
        }
      }

      if (link) {
        handleDirect(item?.bannerUrl, item?.bannerNavigationType  , history)
      }
    }
  }

    const submitClickData = async () => {
    const clickData = JSON.parse(localStorage.getItem(addKeyLocalStorage(CLICK_STORAGE_KEY))) || []
    if (!clickData || Object.keys(clickData)?.length === 0) return
    const clicks = Object.entries(clickData).map(([key, value]) => ({
      ...value
    }));
    
    const payload = {
      listClick: clicks.map((click) => ({
        targetId: click.targetId,
        totalClick: click.count
      }))
    }

    try {
      const { issSuccess } = await LogService.recordClick(payload)
      if (issSuccess) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        localStorage.removeItem(addKeyLocalStorage(CLICK_STORAGE_KEY))
      }
    } catch (err) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const renderSlider = useMemo(() => {

		if(isLoading) {
			return <div className="slider-container sliderHome" style={{aspectRatio:'358/134'}}>
				<BasicPlaceholder
				></BasicPlaceholder>
        </div>
    }
    return (
      <div className={`slider-container sliderHome ${className}`}>
        <Slider {...settingSilde}>
          {setting &&
            setting.map((item, index) => {
              const imgSrc = item.bannerImageUrl || process.env.PUBLIC_URL + '/default-banner.jpg'

              return hideNewsFromZaloMiniApp ? (
                <div className="slide" onClick={() => handleClickBanner(item, index)} key={index}>
                  <img src={imgSrc} alt={`Slide ${index + 1}`} />
                </div>
              ) : (
                <div
                  className="slide"
                  key={index}
                  onClick={() => handleClickBanner(item, index)}
                  style={{ cursor: item?.bannerUrl ? 'pointer' : 'default' }}>
                  <img src={imgSrc} alt={`Slide ${index + 1}`} />
                </div>
              )
            })}
        </Slider>
      </div>
    )
  }, [setting, isLoading])

  return (
    <div>
      {renderSlider}
      <PopupSheetIframe visible={sheetVisible} onClose={() => setSheetVisible(false)} iframeUrl={popupUrl} />
    </div>
  )
}
