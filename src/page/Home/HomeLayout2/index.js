import { PageLayout } from './../../../components/PageLayout/PageLayout'
import { SliderHome } from './../../../components/Slider/SliderHome'
import { useMemo, useState } from 'react'
import './../index.scss'
import { useEffect } from 'react'
import { fetchMetadataWithCache } from './../../../services/addBookingService'
import L2FunctionButtonList from './L2FunctionButtonList'
import L2PartnerSection from './L2PartnerSection'
import MainButton from '../../../components/MainButton'
import { useLocation } from 'react-router-dom'
import 'zmp-ui/zaui.min.css'
import { getBannerBySectionCache } from '../../../helper/getBannerBySectionCache'
import MainLogo from '../../../components/MainLogo'
import { getHomePageConfigCache } from '../../../helper/getHomePageConfigCache'
import Header from '../../../components/Header'
import usePartnerBridge from '../../../sdk/usePartnerBridge'
import { HOME_CONFIG_CATEGORY, HOME_CONFIG_CATEGORY_TEXT } from '../../../constants/Layout2Constants'
import usePreconnectExternalLinks from '../../../hooks/usePreconnectExternalLinks'

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

  const storageHomePageConfig = localStorage.getItem('HOME_PAGE_CONFIG_ALL')
  const [homepageConfig, setHomepageConfig] = useState(storageHomePageConfig ? JSON.parse(storageHomePageConfig)?.data : []? JSON.parse(storageHomePageConfig)?.data : [])

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
  }, [topBanner, hideNewsFromZaloMiniApp, isLoading])

  const renderBottomSlider = useMemo(() => {
    return (
      <SliderHome hideNewsFromZaloMiniApp={hideNewsFromZaloMiniApp} className={'layout2 border-r'} setting={bottomBanner} isLoading={isLoading} />
    )
  }, [bottomBanner, hideNewsFromZaloMiniApp, isLoading])

  const getHomePageConfig = async (params) => {
    getHomePageConfigCache(params).then((result) => {
      setHomepageConfig(result || [])
    })
  }
  useEffect(() => {
    // if(!userToken){
    //   history.push(PATH.LOGIN)
    // }
    handleFetchData()
  }, [])
  
  const fetchHomePageConfig = async () => {
    getHomePageConfig("ALL")
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

  // DNS Prefetch & Preconnect: warm up connections cho các domain external
  // Mục đích là để xử lý gọi link nhanh hơn khi người dùng click vào button, tránh bị chậm quá mức 
  usePreconnectExternalLinks(homepageConfig)
  // -----------------------------------------------------------------------

  const dataHomePageConfig = useMemo(() => {
  const keyToRender = [
    HOME_CONFIG_CATEGORY.HOME_MAIN_SERVICES,
    HOME_CONFIG_CATEGORY.VEHICLE_INSPECTION,
    HOME_CONFIG_CATEGORY.TRAFFIC_VIOLATION,
    HOME_CONFIG_CATEGORY.VEHICLE_INSPECTION_SERVICES,
    HOME_CONFIG_CATEGORY.FEATURED_SERVICES,
    HOME_CONFIG_CATEGORY.STATION_SERVICES,
    HOME_CONFIG_CATEGORY.TAX_INFO_LOOKUP,
    HOME_CONFIG_CATEGORY.SUPPORT_PARTNER,
    HOME_CONFIG_CATEGORY.PARTNER,
    HOME_CONFIG_CATEGORY.UTILITIES,
    HOME_CONFIG_CATEGORY.DRIVER_UTILITIES,
    HOME_CONFIG_CATEGORY.GOVERNMENT_AGENCIES,
  ];

  const list = homepageConfig || [];

  return keyToRender.map((category) => ({
    configCategory: category,
    title: HOME_CONFIG_CATEGORY_TEXT[category],
    icons: list.filter((item) => item.configCategory === category),
  }));
}, [homepageConfig]);

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
              {
                dataHomePageConfig.map((item, index) => {
                  if (item.icons && item.icons.length > 0) {
                    if (item.configCategory === HOME_CONFIG_CATEGORY.HOME_MAIN_SERVICES) {
                      return (
                        <div key={index} className="mb-4">
                          <MainButton
                            setSheetVisible={setSheetVisible}
                            setDataBtn={setDataBtn}
                            list={item.icons}
                            title={item.title}
                          />
                        </div>
                      )
                    } else if (item.configCategory === HOME_CONFIG_CATEGORY.PARTNER) {
                      return (
                        <div key={index} className="mb-4">
                          <div className='text-large title-homelayout' style={{marginBottom: '12px'}}>
                            {item.title}
                          </div>
                          <L2PartnerSection data={item.icons} />
                        </div>
                      )
                    } else {
                      return (
                        <L2FunctionButtonList
                          key={index}
                          setSheetVisible={setSheetVisible}
                          setDataBtn={setDataBtn}
                          list={item.icons}
                          title={item.title}
                        />
                      )
                    }
                  }
                  return null
                })
              }
            </div>
          </div>
          {bottomBanner?.length > 0 && <PageLayout>{renderBottomSlider}</PageLayout>}
        </div>
      </div>
    </div>
  )
}
export default HomeLayout2
