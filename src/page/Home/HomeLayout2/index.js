import { PageLayout } from './../../../components/PageLayout/PageLayout'
import { SliderHome } from './../../../components/Slider/SliderHome'
import { useMemo, useState } from 'react'
import * as sc from './../HomeLayout.styled'
import './../index.scss'
import { useEffect } from 'react'
import NewService, { fetchMetadataWithCache } from './../../../services/addBookingService'
import L2FunctionButtonList from './L2FunctionButtonList'
import { useLocation } from 'react-router-dom'
import 'zmp-ui/zaui.min.css'
import { getBannerBySectionCache } from '../../../helper/getBannerBySectionCache'
import PopupSheetIframe from '../../../components/Popup/PopupSheetIframe'
import MainLogo from '../../../components/MainLogo'
import { Spin } from 'antd'
import { getHomePageConfigCache } from '../../../helper/getHomePageConfigCache'
import Header from '../../../components/Header'
import usePartnerBridge from '../../../sdk/usePartnerBridge'

const HomeLayout2 = (props) => {
  const location = useLocation()
  const [userToken, setUserToken] = useState(location?.state?.token || localStorage.getItem('userToken') || '')
  const [isLoadingAPI, setIsLoadingAPI] = useState(true)
  const { init: initBridge, exit: exitBridge, isSupported: isPartnerBridgeSupported } = usePartnerBridge()

  const [sheetVisible, setSheetVisible] = useState(false)
  const [dataBtn, setDataBtn] = useState({
    label: 'Zalo',
    link: '/'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [hideNewsFromZaloMiniApp, setHideNewsFromZaloMiniApp] = useState(true)
  const LAST_UPDATE_NEWS = {}
  const storageTopBanner = localStorage.getItem('BANNER_2001')
  const storageBottomBanner = localStorage.getItem('BANNER_2002')
  const [topBanner, setTopBanner] = useState(storageTopBanner ? JSON.parse(storageTopBanner)?.data : [])
  const [bottomBanner, setBottomBanner] = useState(storageBottomBanner ? JSON.parse(storageBottomBanner)?.data : [])
  const storageHomePageConfigVehicleInspection = localStorage.getItem('HOME_PAGE_CONFIG_4')
  const storageHomePageConfigViolation = localStorage.getItem('HOME_PAGE_CONFIG_5')
  const storageHomePageConfigStationService = localStorage.getItem('HOME_PAGE_CONFIG_6')
  const [vehicleInspectionList, setVehicleInspectionList] = useState(
    storageHomePageConfigVehicleInspection ? JSON.parse(storageHomePageConfigVehicleInspection)?.data : []
  )
  const [violationList, setViolationList] = useState(storageHomePageConfigViolation ? JSON.parse(storageHomePageConfigViolation)?.data : [])
  const [stationServiceList, setStationServiceList] = useState(
    storageHomePageConfigStationService ? JSON.parse(storageHomePageConfigStationService)?.data : []
  )

  const pushCacheDataIntoObj = (typeOfNews, lastId, obj) => {
    const id = JSON.parse(localStorage.getItem(`LAST_${typeOfNews}_NEWS_ID`)) || undefined
    const shouldFetch = id === undefined ? false : !id.includes(lastId)

    id?.push(lastId)

    obj[`${typeOfNews}_NEWS`] = {
      id: id?.filter((element, index) => id.indexOf(element) === index),
      shouldFetch
    }

    localStorage.setItem(`LAST_UPDATE_NEWS`, JSON.stringify(obj))

    return obj
  }

  const getMetaData = async () => {
    await fetchMetadataWithCache().then((result) => {
      const { statusCode, data } = result
      if (statusCode == 200) {
        const { LAST_UPDATE_DATA } = data
        const {
          lastNews_1: generalNewsId,
          lastNews_2: highlightNewsId,
          lastNews_3: promotionNewsId,
          lastNews_4: recruitmentNewsId,
          lastNews_5: expertNewsId,
          lastNews_6: partnerPromotionNewsId,
          lastNews_7: partnerUtilityNewsId
        } = LAST_UPDATE_DATA

        setHideNewsFromZaloMiniApp(data?.HIDE_NEWS_FROM_ZALO_MINIAPP ? true : false)

        pushCacheDataIntoObj('GENERAL', generalNewsId, LAST_UPDATE_NEWS)
        pushCacheDataIntoObj('HIGHLIGHTS', highlightNewsId, LAST_UPDATE_NEWS)
        pushCacheDataIntoObj('PROMOTION', promotionNewsId, LAST_UPDATE_NEWS)
        pushCacheDataIntoObj('RECRUITMENT', recruitmentNewsId, LAST_UPDATE_NEWS)
        pushCacheDataIntoObj('EXPERT', expertNewsId, LAST_UPDATE_NEWS)
        pushCacheDataIntoObj('PARTNER_UTILITY', partnerUtilityNewsId, LAST_UPDATE_NEWS)
        pushCacheDataIntoObj('PARTNER_PROMOTION', partnerPromotionNewsId, LAST_UPDATE_NEWS)
      } else {
        setHideNewsFromZaloMiniApp(false)
      }
    })
  }

  const renderSlider = useMemo(() => {
    return (
      <div className={`banner-Layout2 ${topBanner?.length === 0 ? 'banner-Layout2-empty' : ''}`}>
        <SliderHome
          hideNewsFromZaloMiniApp={hideNewsFromZaloMiniApp}
          className={'layout2'}
          setting={topBanner}
          isLoading={isLoading}
          setSheetVisible={setSheetVisible}
          setDataBtn={setDataBtn}
        />
      </div>
    )
  }, [topBanner, isLoading])

  const renderBottomSlider = useMemo(() => {
    return (
      <SliderHome hideNewsFromZaloMiniApp={hideNewsFromZaloMiniApp} className={'layout2 border-r'} setting={bottomBanner} isLoading={isLoading} />
    )
  }, [bottomBanner, isLoading])

  const getHomePageConfig = async (params) => {
    getHomePageConfigCache(params).then((result) => {
      switch (params) {
        case 4:
          setVehicleInspectionList(result || [])
          break
        case 5:
          setViolationList(result || [])
          break
        case 6:
          setStationServiceList(result || [])
          break
        default:
          break
      }
    })
  }
  useEffect(() => {
    // if(!userToken){
    //   history.push(PATH.LOGIN)
    // }
    handleFetchData()
  }, [])
  const fetchHomePageConfig = async (params) => {
    getHomePageConfig(4)
    getHomePageConfig(5)
    setTimeout(() => {
      getHomePageConfig(6)
    }, 100)
  }
  const fetchBanner = async () => {
    getBannerBySectionCache('2001').then((data) => {
      setTopBanner(data || [])
    })
    setTimeout(() => {
      getBannerBySectionCache('2002').then((data) => {
        setBottomBanner(data || [])
      })
    }, 100)
  }

  const handleFetchData = async () => {
    setIsLoadingAPI(true)
    await Promise.all([fetchHomePageConfig(), fetchBanner(), getMetaData()])
    setIsLoadingAPI(false)
  }

  useEffect(() => {
    if (!isPartnerBridgeSupported) return
    initBridge()
  }, [initBridge, isPartnerBridgeSupported])
  const handleExit = async () => {
    try {
      await exitBridge()
      // Thường sẽ không chạy tới đây nếu host đóng webview ngay.
    } catch (e) {
      console.error(e);
    }
  };

  const handleReturnLink = () => {
    if (dataBtn?.link) {
      if (dataBtn.token) {
        return dataBtn?.link + `&token=${userToken}`
      } else {
        return dataBtn?.link
      }
    } else {
      if ((dataBtn?.linkNavigation).slice(0, 7).includes('http')) {
        return dataBtn?.linkNavigation
      } else {
        return `${process.env.REACT_APP_DEPLOY_URL}${dataBtn?.linkNavigation}`
      }
    }
  }

  if (isLoadingAPI) {
    return (
      <div className="loading">
        <div className="text-center">
          <MainLogo height={60} width={60}></MainLogo>
        </div>
      </div>
    )
  }

  return (
    <div>
      {process.env.REACT_APP_HOME_MINIAPP_HEADER_TITLE && 
        <Header title={process.env.REACT_APP_HOME_MINIAPP_HEADER_TITLE} onBack={() => {handleExit()}} />
      }

      <PageLayout>{renderSlider}</PageLayout>
      <div className="more mt-3">
        <div className="layout2-body" style={{ maxWidth: 600, margin: 'auto' }}>
          <div>
            <div className="booking-layout2 mb-4">
              {vehicleInspectionList?.length > 0 && (
                <L2FunctionButtonList
                  setSheetVisible={setSheetVisible}
                  setDataBtn={setDataBtn}
                  list={vehicleInspectionList}
                  title={'Đăng kiểm xe cơ giới'}></L2FunctionButtonList>
              )}
              {violationList?.length > 0 && (
                <L2FunctionButtonList
                  setSheetVisible={setSheetVisible}
                  setDataBtn={setDataBtn}
                  list={violationList}
                  title={'Phạt nguội giao thông'}></L2FunctionButtonList>
              )}
              {stationServiceList?.length > 0 && (
                <L2FunctionButtonList
                  setSheetVisible={setSheetVisible}
                  setDataBtn={setDataBtn}
                  list={stationServiceList}
                  title={'Điểm dịch vụ'}></L2FunctionButtonList>
              )}
            </div>
          </div>
          {bottomBanner?.length > 0 && <PageLayout>{renderBottomSlider}</PageLayout>}
          {/* {bottomBanner?.length == 1 && (
              <div className={'layout2'}>
                <img style={{ borderRadius: '8px' }} src={bottomBanner[0]?.bannerImageUrl}></img>
              </div>
            )} */}
        </div>
      </div>
    </div>
  )
}
export default HomeLayout2
