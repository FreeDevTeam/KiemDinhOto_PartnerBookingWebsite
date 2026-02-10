import { PageLayout } from '../../../components/PageLayout/PageLayout'
import { SliderHome } from '../../../components/Slider/SliderHome'
import { useMemo, useState } from 'react'
import * as sc from '../HomeLayout.styled'
import './../index.scss'
import './index.scss'
import { useEffect } from 'react'
import NewService, { fetchMetadataWithCache } from '../../../services/addBookingService'
import L2FunctionButtonList from './L2FunctionButtonList'
import L2MainButton from './L2MainButton'
import { useLocation, useHistory } from 'react-router-dom'
import 'zmp-ui/zaui.min.css'
import { getBannerBySectionCache } from '../../../helper/getBannerBySectionCache'
import MainLogo from '../../../components/MainLogo'
import { Spin } from 'antd'
import { getHomePageConfigCache } from '../../../helper/getHomePageConfigCache'
import HomeNew from '../HomeNew'
import { PATH } from '../../../constants/router'
import { PARAM_URL_IFRAME } from '../../../constants/params'
import { encodeLink } from '../../../helper/common'
import useWindowDimensions from '../../../hooks/window-dimensions'
import Header from '../../../components/Header'
import usePartnerBridge from '../../../sdk/usePartnerBridge'

const HomeLayout3 = (props) => {
  const location = useLocation()
  const history = useHistory()
  const [userToken, setUserToken] = useState(location?.state?.token || localStorage.getItem('userToken') || '')
  const [isLoadingAPI, setIsLoadingAPI] = useState(true)

  const [sheetVisible, setSheetVisible] = useState(false)
  const [dataBtn, setDataBtn] = useState({
    label: 'Zalo',
    link: '/'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [hideNewsFromZaloMiniApp, setHideNewsFromZaloMiniApp] = useState(true)
  const LAST_UPDATE_NEWS = {}
  const { height, width } = useWindowDimensions()
  const mobile = width < 580
  const storageTopBanner = localStorage.getItem('BANNER_2001')
  const storageBottomBanner = localStorage.getItem('BANNER_2002')
  const [topBanner, setTopBanner] = useState(storageTopBanner ? JSON.parse(storageTopBanner)?.data : [])
  const [bottomBanner, setBottomBanner] = useState(storageBottomBanner ? JSON.parse(storageBottomBanner)?.data : [])
  const storageHomePageConfigVehicleInspection = localStorage.getItem('HOME_PAGE_CONFIG_4')
  const storageHomePageConfigViolation = localStorage.getItem('HOME_PAGE_CONFIG_5')
  const storageHomePageConfigHomeMainServices = localStorage.getItem('HOME_PAGE_CONFIG_7')
  const storageHomePageConfigRecommendedServices = localStorage.getItem('HOME_PAGE_CONFIG_6')
  const [vehicleInspectionList, setVehicleInspectionList] = useState(storageHomePageConfigVehicleInspection ? (JSON.parse(storageHomePageConfigVehicleInspection))?.data : [])
  const [violationList, setViolationList] = useState(storageHomePageConfigViolation ? (JSON.parse(storageHomePageConfigViolation))?.data : [])
  const [homeMainServicesList, setHomeMainServicesList] = useState(storageHomePageConfigHomeMainServices ? (JSON.parse(storageHomePageConfigHomeMainServices))?.data : [])
  const [recommendedServicesList, setRecommendedServicesList] = useState(storageHomePageConfigRecommendedServices ? (JSON.parse(storageHomePageConfigRecommendedServices))?.data : [])

  const [listNews, setListNews] = useState([])

  const { init: initBridge, exit: exitBridge, isSupported: isPartnerBridgeSupported } = usePartnerBridge()

  const handleExit = async () => {
    try {
      await exitBridge()
    } catch (e) {
      console.error(e);
    }
  };

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
        case 6:
          setRecommendedServicesList(result || [])
          break
        case 7:
          setHomeMainServicesList(result || [])
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
    getHomePageConfig(6)
    getHomePageConfig(7)
  }
  const fetchBanner = async () => {
    getBannerBySectionCache('2001').then((data) => {
      setTopBanner(data || [])
    })
    getBannerBySectionCache('2002').then((data) => {
      setBottomBanner(data || [])
    })
  }

  const getListNews = async () => {
    const shouldFetch = true
    shouldFetch ? await NewService.userGetLatestNew().then((result) => {
      if (result) {
        setListNews(result.data || [])
      }
    }) : setListNews(JSON.parse(localStorage.getItem('LAST_GENERAL_NEWS_DATA')))
  }

  const handleFetchData = async () => {
    setIsLoadingAPI(true)
    await Promise.all([fetchHomePageConfig(), fetchBanner(), getMetaData(), getListNews()])
    setIsLoadingAPI(false)
  }

  if (isLoadingAPI) {
    return (
      <div className="loading">
        <div className="text-center">
          <MainLogo height={60} width={60}></MainLogo>
          <Spin style={{ width: '100%' }} className="mt-3" />
        </div>
      </div>
    )
  }

  return (
    <>
      {process.env.REACT_APP_HOME_MINIAPP_HEADER_TITLE && 
        <Header title={process.env.REACT_APP_HOME_MINIAPP_HEADER_TITLE} onBack={() => {handleExit()}} />
      }
      <sc.Container>
        <PageLayout>{renderSlider}</PageLayout>
        <div className="more mt-3">
          <div className="layout2-body" style={{ maxWidth: 600, margin: 'auto' }}>
            {homeMainServicesList?.length > 0 && (
              <L2MainButton setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} list={homeMainServicesList} title={'Dịch vụ chính trang chủ'} />
            )}
            <div>
              <div className="booking-layout2 mb-4">
                {recommendedServicesList?.length > 0 && (
                  <L2FunctionButtonList
                    setSheetVisible={setSheetVisible}
                    setDataBtn={setDataBtn}
                    slider={mobile ? recommendedServicesList?.length > 3 : recommendedServicesList?.length > 4}
                    list={recommendedServicesList}
                    title={'Điểm dịch vụ đề xuất'}></L2FunctionButtonList>
                )}
              </div>
            </div>
              <div className='layout2-bg mb-4'>
                {listNews?.length > 0 && (
                  <div className="home-container mb-1 mt-1">
                    <div className="d-flex justify-content-between align-items-center news-center" >
                      <div className='text-large title-homelayout' style={{padding:'0 10px'}}>Tin tức</div>
                      <div className="d-flex mb-0 justify-content-end home-link" onClick={() => {
                        const link = `${process.env.REACT_APP_DEPLOY_URL}/new`
                        history.push(`${PATH.IFRAME_VIEW}?${PARAM_URL_IFRAME}=${encodeLink(link)}`)
                      }}>
                        <a href="/" onClick={(e) => e.preventDefault()}>
                          Xem tất cả
                        </a>
                      </div>
                    </div>
                    <div className='mobile-content'>
                      <HomeNew listNews={listNews} />
                    </div>
                  </div>
                )}
              </div>
            {bottomBanner?.length > 0 && <PageLayout>{renderBottomSlider}</PageLayout>}
            {/* {bottomBanner?.length == 1 && (
              <div className={'layout2'}>
                <img style={{ borderRadius: '8px' }} src={bottomBanner[0]?.bannerImageUrl}></img>
              </div>
            )} */}
          </div>
        </div>
      </sc.Container>
    </>
  )
}
export default HomeLayout3
