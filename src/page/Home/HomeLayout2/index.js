import { PageLayout } from './../../../components/PageLayout/PageLayout'
import { SliderHome } from './../../../components/Slider/SliderHome'
import React, { useMemo, useState } from 'react'
import * as sc from './../HomeLayout.styled'
import './../index.scss'
import { useEffect } from 'react'
import NewService, { fetchMetadataWithCache } from './../../../services/addBookingService'
import HomePartner from './../HomePartner'
import L2FunctionButtonList from './L2FunctionButtonList'
import L2HotNew from './L2HotNew'
import L2MainButton from './L2MainButton'
import {
  BOOKING_LIST_BTN,
  BTN_LIST_SERVICE,
  CONVENIENCE_DRIVERS_BTN,
  GOVERNMENT_BTN,
  INSPECTION_SERVICES,
  HOT_SERVICES,
  SECTION
} from '../../../constants/Layout2Constants'
import { useHistory, useLocation } from 'react-router-dom'
import HomeNew from '../HomeNew'
import SystemConfigurationsService from '../../../services/SystemConfigurationsService'
import { Button, Modal, Box } from "zmp-ui";
import "zmp-ui/zaui.min.css";
import { getBannerBySectionCache } from '../../../helper/getBannerBySectionCache'
import HomeRecruitment from '../HomeRecruitment'
import PartnerPromotionNew from '../PartnerPromotionNew'
import useWindowDimensions from '../../../hooks/window-dimensions'
import BookingService from './../../../services/addBookingService'
import { PATH } from '../../../constants/router'
import { useGlobalContext } from '../../../context/GlobalContext'
import PopupSheetIframe from '../../../components/Popup/PopupSheetIframe'
import { ClickableTextPhone } from '../../../components/BasicComponent/ClickableTextPhone'
import { Spin } from 'antd'

const HomeLayout2 = (props) => {
  const { introduction } = props
  const { handleZaloAuthorize,globalState } = useGlobalContext();
  const history = useHistory();
  const location = useLocation()
  const [hotNews, setHotNews] = useState([])
  const [userToken, setUserToken] = useState(location?.state?.token || localStorage.getItem('userToken') || '')
  const [driverAmenities, setDriverAmenities] = useState(CONVENIENCE_DRIVERS_BTN)
  const [governmentAgency, setGovernmentAgency] = useState(GOVERNMENT_BTN)
  const [stationNewsPartnerPromotion, setStationNewsPartnerPromotion] = useState([])
  const [stationNewsPromotion, setStationNewsPromotion] = useState([])
  const [expertNews, setExpertNews] = useState([])
  const [recruitmentList, setRecruitmentList] = useState([])
  const [partnerUtilityNews, setPartnerUtilityNews] = useState([])
  const [setting, setSetting] = useState([]);
  const [firtLoadding, setFirtLoadding] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAPI, setIsLoadingAPI] = useState(true);
  const [bottomBanner, setBottomBanner] = useState([]);
  const { height, width } = useWindowDimensions()
  const mobile= width < 580
  const [paramsFilter, setParamsFilter] = useState({
    filter: {
      configCategory:1
    },
    skip: 0,
    limit: 20
  });
  const [sheetVisible, setSheetVisible] = useState(false);
  const [dataBtn, setDataBtn] = useState({
    label: "Zalo",
    link: "/"
  });
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false)
  const [listNews , setListNews ] = useState([]) 
  const [hideNewsFromZaloMiniApp , setHideNewsFromZaloMiniApp ] = useState(true) 
  const [isZaloShowStationList, setIsZaloShowStationList] = useState(false)
  const LAST_UPDATE_NEWS = {}
  const lastUpdateNews = JSON.parse(localStorage.getItem('LAST_UPDATE_NEWS'))
  const [stationConfigs, setStationConfigs] = useState(undefined)

  const pushCacheDataIntoObj = (typeOfNews, lastId, obj) => {
    const id = JSON.parse(localStorage.getItem(`LAST_${typeOfNews}_NEWS_ID`)) || undefined
    const shouldFetch = id === undefined
      ? false
      : !id.includes(lastId);

    id?.push(lastId)

    obj[`${typeOfNews}_NEWS`] = {
      id: id?.filter((element, index) => id.indexOf(element) === index),
      shouldFetch
    }

    localStorage.setItem(`LAST_UPDATE_NEWS`, JSON.stringify(obj))

    return obj
  }
  const setLocalStorage = (typeOfNews, id, data) => {
    localStorage.setItem(`LAST_${typeOfNews}_NEWS_ID`, JSON.stringify(id))
    localStorage.setItem(`LAST_${typeOfNews}_NEWS_DATA`, JSON.stringify(data))
  }
  const pushStationNewsIdIntoArr = (dataArray) => {
    const result = []

    dataArray?.forEach((el) => {
      result.push(el.stationNewsId)
    })

    return result
  }
  const getMetaData = async () => {
    await fetchMetadataWithCache().then((result) => {
      const { statusCode,data } = result
      if(statusCode==200){
        const { LAST_UPDATE_DATA } = data
        const { lastNews_1: generalNewsId, 
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
      }else{
        setHideNewsFromZaloMiniApp(false)
      }
    })
  }
  const fetchData = async () => {
    setIsLoading(true);
    const clearBannerUrls = (banners) => {
      let arr=[]
      for (let i = 1; i <= 5; i++) {
        let data={
          systemPromoBannersId:i,
          bannerImageUrl:banners['bannerUrl'+[i]],
          bannerUrl:banners['linkBanner'+[i]]
        }
        arr.push(data)
      }
      return arr;
    };

    try {
      const [systemBanner, centerBanner] = await Promise.all([
        NewService.getBannerStationsList({
          filter: {
            bannerSection: 10
          },
          skip: 0,
          limit: 20,
          order: {
            key: 'createdAt',
            value: 'desc'
          }
        }),
        NewService.getBannerCenterList({
          filter: {
            bannerSection: 10
          },
          skip: 0,
          limit: 20,
          order: {
            key: 'createdAt',
            value: 'desc'
          }
        })
      ])

      if (centerBanner?.data?.length || systemBanner?.data?.length) {
        systemBanner?.data?.length && setSetting(systemBanner?.data)
        setIsLoading(false)
        return
      }else{
        SystemConfigurationsService.getPublicSystemConfigurations({}).then((res) => {
          setSetting(clearBannerUrls(res));
          setIsLoading(false);
        })
      }
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }
  const getExpertNews = async () =>{
    const shouldFetch = lastUpdateNews === null ? true : lastUpdateNews['EXPERT_NEWS']?.shouldFetch

    shouldFetch ? await NewService.userGetExpertNews(
    {
      "skip": 0,
      "limit": 10,
      "order": {
        "key": "ordinalNumber",
        "value": "asc"
          }
    }
    ).then((result) => {
          if (result) {
            setExpertNews(result.data)
            setLocalStorage('EXPERT', pushStationNewsIdIntoArr(result.data), result.data)
          }
    }) : setExpertNews(JSON.parse(localStorage.getItem('LAST_EXPERT_NEWS_DATA')))
  }
  const getRecruitmentListNew = async () =>{
    const shouldFetch = lastUpdateNews === null ? true : lastUpdateNews['RECRUITMENT_NEWS'].shouldFetch

    shouldFetch ? await NewService.userGetRecruitmentNews({
        "skip": 0,
        "limit": 10,
        "order": {
          "key": "ordinalNumber",
          "value": "asc"
          }
        }).then((result) => {
          if (result) {
            setRecruitmentList(result.data)
            setLocalStorage('RECRUITMENT', pushStationNewsIdIntoArr(result.data), result.data)
          }
    }) : setRecruitmentList(JSON.parse(localStorage.getItem('LAST_RECRUITMENT_NEWS_DATA')))
  }
  const getStationNewsPartnerPromotion = async () => {
    const shouldFetch = lastUpdateNews === null ? true : lastUpdateNews['PARTNER_PROMOTION_NEWS'].shouldFetch

    shouldFetch ? await NewService.getPartnerPromotionNews({
        "skip": 0,
        "limit": 10,
        "order": {
          "key": "ordinalNumber",
          "value": "asc"
          }
        }).then((result) => {
          if (result) {
            setStationNewsPartnerPromotion(result.data)
            setLocalStorage('PARTNER_PROMOTION', pushStationNewsIdIntoArr(result.data), result.data)
          }
    }) : setStationNewsPartnerPromotion(JSON.parse(localStorage.getItem('LAST_PARTNER_PROMOTION_NEWS_DATA')))
  }
  const renderSlider = useMemo(() => {
    return (
      <div className="banner-Layout2">
        <SliderHome
          hideNewsFromZaloMiniApp={hideNewsFromZaloMiniApp}
          className={'layout2'}
          center
          setting={setting}
          isLoading={isLoading}
          setSheetVisible={setSheetVisible}
          setDataBtn={setDataBtn}
        />
      </div>
    )
  }, [setting, isLoading])

  const renderBottomSlider = useMemo(() => {
    return <SliderHome hideNewsFromZaloMiniApp={hideNewsFromZaloMiniApp} className={'layout2 border-r'} setting={bottomBanner} isLoading={isLoading} />
  }, [])

  const getNews = async () => {
    const shouldFetch = lastUpdateNews === null ? true : lastUpdateNews['HIGHLIGHTS_NEWS'].shouldFetch

    shouldFetch ? await NewService.userGetHotNewList().then((result) => {
          if (result) {
            setHotNews(result.data)
            setLocalStorage('HIGHLIGHTS', pushStationNewsIdIntoArr(result.data), result.data)
          }
      }) : setHotNews(JSON.parse(localStorage.getItem('LAST_HIGHLIGHTS_NEWS_DATA')))
  }
  const getListNews = async () => {
    const shouldFetch = lastUpdateNews === null ? true : lastUpdateNews['GENERAL_NEWS'].shouldFetch

    shouldFetch ? await NewService.userGetLatestNew().then((result) => {
          if (result) {
            setListNews(result.data)
            setLocalStorage('GENERAL', pushStationNewsIdIntoArr(result.data), result.data)
          }
    }) : setListNews(JSON.parse(localStorage.getItem('LAST_GENERAL_NEWS_DATA')))
  }
  const getHomePageConfig = async (params) => {
    NewService.getList({
      filter: {
        configCategory:params
      },
      skip: 0,
      limit: 20,
    }).then((result) => {
      const { statusCode, data, message } = result;
      if (data?.data?.length >0) {
        setParamsFilter({
          filter: {
            configCategory:params
          },
          skip: 0,
          limit: 20,
        });
        switch (params) {
          case 1:
            setDriverAmenities(data?.data);
            break;
          case 2:
            setGovernmentAgency(data?.data);
            break;
        }
      } else {
        switch (params) {
          case 1:
            setDriverAmenities(CONVENIENCE_DRIVERS_BTN);
            break;
          case 2:
            setGovernmentAgency(GOVERNMENT_BTN);
            break;
        }
      }
    })
  }
  const getPartnerUtilityNews = async () =>{
    const shouldFetch = lastUpdateNews === null ? true : lastUpdateNews['PARTNER_UTILITY_NEWS'].shouldFetch

    shouldFetch ? await NewService.userGetPartnerUtilityNews(4).then((result) => {
          if (result) {
            setPartnerUtilityNews(result.data)
            setLocalStorage('PARTNER_UTILITY', pushStationNewsIdIntoArr(result.data), result.data)
          }
    }) : setPartnerUtilityNews(JSON.parse(localStorage.getItem('LAST_PARTNER_UTILITY_NEWS')))
  }
  const getStationNewsPromotion = async () =>{
    const shouldFetch = lastUpdateNews === null ? true : lastUpdateNews['PROMOTION_NEWS'].shouldFetch

    shouldFetch ? await NewService.getPromotionNews({
        "skip": 0,
        "limit": 10,
        "order": {
          "key": "ordinalNumber",
          "value": "asc"
          }
        }).then((result) => {
          if (result) {
            setStationNewsPromotion(result.data)
            setLocalStorage('PROMOTION', pushStationNewsIdIntoArr(result.data), result.data)
          }
    }) : setStationNewsPromotion(JSON.parse(localStorage.getItem('LAST_PROMOTION_NEWS_DATA')))
  }

  const getZaloDisplayStationListSetting = async () => {
    SystemConfigurationsService.getZaloDisplayStationList().then((res) => {
      if(res) {
        setIsZaloShowStationList(true)
      }
      else{
        setIsZaloShowStationList(false)
      }
    })
  }

  const fetchStationButtonConfig = async () => {
    try {
      const stationButtonConfig = await SystemConfigurationsService.getStationButtonConfig()
      if (stationButtonConfig) {
        const data = groupAndSortToArray(stationButtonConfig.data)
        setStationConfigs(data)
      }
    } catch (error) {
      setStationConfigs(null)
    } finally {
      setIsLoadingAPI(false)
    }
  }

  function groupAndSortToArray(data) {
    if (!data?.length) return null

    const modifies = data.map((item) => ({
      ...item,
      unOpen: !/^https?:\/\//.test(item.linkNavigation)
    }))

    const grouped = modifies.reduce((acc, item) => {
      const category = item.configCategory ?? 'default'
      if (!acc[category]) acc[category] = []
      acc[category].push(item)
      return acc
    }, {})

    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => a.displayPosition - b.displayPosition)
    })

    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === 'default') return -1
      if (b === 'default') return 1
      return Number(a) - Number(b)
    })

    const result = sortedKeys.map((key) => ({
      [key]: grouped[key]
    }))

    return result
  }

  useEffect(() => {
    getZaloDisplayStationListSetting()
    getHomePageConfig(1)
    getHomePageConfig(2)
    fetchStationButtonConfig()
    setTimeout(() => {
      fetchData()
      setFirtLoadding(false)
    }, 300);

    // if(!userToken){
    //   history.push(PATH.LOGIN)
    // }
    setTimeout(async() =>  {
      await getMetaData()
      await getExpertNews()
      await getRecruitmentListNew()
      await getPartnerUtilityNews()
      await getStationNewsPartnerPromotion()
      await getStationNewsPromotion()
      await getListNews()
      await getNews()
      await getBannerBySectionCache(12).then(data =>{
        if(data?.length > 0){
          setBottomBanner(data)
          return
        }else{
          setBottomBanner([]);
        }
      })
    }, 500);
  }, [])

  const handleReturnLink=()=>{
    if(dataBtn?.link){
      if(dataBtn.token){
        return dataBtn?.link + `&token=${userToken}`
      }else{
        return dataBtn?.link
      }
    }else{
      if((dataBtn?.linkNavigation).slice(0, 7).includes("http") ){
        return dataBtn?.linkNavigation
      }else{
        return `${process.env.REACT_APP_DEPLOY_URL}${dataBtn?.linkNavigation}`
      }
    }
  }
  const handleSupportClick = () => {
    setIsSupportModalVisible(true);
  }

  const handleOpenSheet=(Title,link)=>{
    setSheetVisible(true);
    setDataBtn({
      label: Title,
      link: `${process.env.REACT_APP_DEPLOY_URL}${link}`
    })
  }

  if (isLoadingAPI) {
    return (
      <div className="loading">
        <div className="text-center">
          <Spin style={{ width: '100%' }} className="mt-3" />
        </div>
      </div>
    )
  }

  return (
    <>
      <sc.Container>
        <PageLayout>{renderSlider}</PageLayout>
        <div className="more mt-3">
          <div className="layout2-body" style={{ maxWidth: 600, margin: 'auto' }}>
            <L2MainButton onSupportClick={handleSupportClick} setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} />
            {!stationConfigs?.length ? (
              
              <div>
                <div className="booking-layout2 mb-4">
                  {/* <L2FunctionButtonList
                    setSheetVisible={setSheetVisible}
                    setDataBtn={setDataBtn}
                    list={BOOKING_LIST_BTN}
                    title={'Đặt lịch'}></L2FunctionButtonList> */}

                  {/* <L2FunctionButtonList
                    setSheetVisible={setSheetVisible}
                    setDataBtn={setDataBtn}
                    list={INSPECTION_SERVICES}
                    title={'Dịch vụ đăng kiểm'}></L2FunctionButtonList> */}
                  {!hideNewsFromZaloMiniApp && (
                    <div className="layout2-bg mb-4">
                      {hotNews?.length > 0 && (
                        <div style={{ padding: '0 10px', marginBottom: '1.5rem' }}>
                          <div className="d-flex justify-content-between align-items-center news-center">
                            <div className="text-large title-homelayout">Nổi bật</div>
                            <div className="d-flex mb-0 justify-content-end home-link" onClick={() => handleOpenSheet('Nổi bật', '/highlight-news')}>
                              <a href="/" onClick={(e) => e.preventDefault()}>
                                Xem tất cả
                              </a>
                            </div>
                          </div>
                          <L2HotNew setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} hotNew={hotNews} />
                        </div>
                      )}
                    </div>
                  )}
                  {/* <L2FunctionButtonList
                    setSheetVisible={setSheetVisible}
                    setDataBtn={setDataBtn}
                    slider={HOT_SERVICES?.length > 9 || (mobile && HOT_SERVICES?.length > 7)}
                    list={HOT_SERVICES}
                    title={'Dịch vụ nổi bật'}></L2FunctionButtonList> */}
                  {!hideNewsFromZaloMiniApp && stationNewsPartnerPromotion?.length > 0 && (
                    <div className="home-container mb-5 ">
                      <div className="d-flex justify-content-between align-items-center news-center">
                        <div className="text-large title-homelayout" style={{ padding: '0 10px' }}>
                          Ưu đãi từ đối tác
                        </div>
                        <div
                          className="d-flex mb-0 justify-content-end home-link"
                          onClick={() => handleOpenSheet('Ưu đãi từ đối tác', '/station-newsPartner-promotion')}>
                          <a href="/" onClick={(e) => e.preventDefault()}>
                            Xem tất cả
                          </a>
                        </div>
                      </div>
                      <div className="mobile-content">
                        <HomeNew
                          setSheetVisible={setSheetVisible}
                          setDataBtn={setDataBtn}
                          listNews={stationNewsPartnerPromotion}
                          linkDirectDetail={'station-news-Partner-promotion-post'}
                          showEye={false}
                        />
                      </div>
                    </div>
                  )}
                  {isZaloShowStationList && ( //Nếu không phải là zalo mini app thì mới hiện lên
                    <L2FunctionButtonList
                      setSheetVisible={setSheetVisible}
                      slider={true}
                      setDataBtn={setDataBtn}
                      list={BTN_LIST_SERVICE}
                      title={'Điểm dịch vụ đề xuất'}></L2FunctionButtonList>
                  )}
                  <div className="layout2-bg mb-4">
                    {listNews?.length > 0 && (
                      <div className="home-container mb-1 mt-1">
                        <div className="d-flex justify-content-between align-items-center news-center">
                          <div className="text-large title-homelayout" style={{ padding: '0 10px' }}>
                            Tin tức
                          </div>
                          <div className="d-flex mb-0 justify-content-end home-link" onClick={() => handleOpenSheet('Tin tức', '/new')}>
                            <a href="/" onClick={(e) => e.preventDefault()}>
                              Xem tất cả
                            </a>
                          </div>
                        </div>
                        <div className="mobile-content">
                          <HomeNew setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} listNews={listNews} />
                        </div>
                      </div>
                    )}
                  </div>
                  {!hideNewsFromZaloMiniApp && (
                    <L2FunctionButtonList
                      setSheetVisible={setSheetVisible}
                      setDataBtn={setDataBtn}
                      slider={CONVENIENCE_DRIVERS_BTN?.length > 9 || (mobile && CONVENIENCE_DRIVERS_BTN?.length > 7)}
                      list={CONVENIENCE_DRIVERS_BTN}
                      title={'Tiện ích cho tài xế'}></L2FunctionButtonList>
                  )}
                  {/* <div className=''>
              {partnerUtilityNews?.length > 0 &&
                <div className="home-container mb-5">
                  <div className="d-flex justify-content-between align-items-center news-center" >
                  <div className='text-large title-homelayout' style={{padding:'0 10px'}}>Tiện ích từ đối tác</div>
                    <div className="d-flex mb-0 justify-content-end home-link" onClick={() => handleOpenSheet('Tiện ích từ đối tác','/partner-news')}>
                      <a href="/" onClick={(e) => e.preventDefault()}>
                        Xem tất cả
                      </a>
                    </div>
                  </div>
                  <div className='mobile-content'>
                    <PartnerPromotionNew setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} listNews={partnerUtilityNews?.slice(0,4)} />
                  </div>
                </div>
              }
            </div> */}
                  {/* <L2FunctionButtonList
                    setSheetVisible={setSheetVisible}
                    setDataBtn={setDataBtn}
                    list={GOVERNMENT_BTN}
                    className="government-btn"
                    title={'Cơ quan chính phủ'}></L2FunctionButtonList> */}
                </div>
                {/* <div className='mb-5'>
              <div className="home-container sation-slider">
                <div className="d-flex justify-content-between align-items-center news-center" >
                  <div className='text-large title-homelayout' style={{padding:'0 10px'}}>Đối tác</div>
                  <div >
                  </div>
                </div>
                <div className='mobile-content'>
                  <HomePartner setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} />
                </div>
              </div>
            </div> */}
                <div>
                  {/* {stationNewsPromotion?.length > 0 && (
                <div className="home-container mb-5">
                  <div className="d-flex justify-content-between align-items-center news-center" >
                    <div className='text-large title-homelayout' style={{padding:'0 10px'}}>Ưu đãi</div>
                    <div className="d-flex mb-0 justify-content-end home-link" onClick={() => handleOpenSheet("Ưu đãi",'/station-news-promotion')}>
                      <a href="/" onClick={(e) => e.preventDefault()}>
                        Xem tất cả
                      </a>
                    </div>
                  </div>
                  <div className='mobile-content'>
                    <HomeNew setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} listNews={stationNewsPromotion} linkDirectDetail = {"station-news-promotion-post"} showEye={false}/>
                  </div>
                </div>
              )} */}
                  {!hideNewsFromZaloMiniApp && (
                    <>
                      <div className="layout2-bg">
                        {recruitmentList?.length > 0 && (
                          <div className="home-container mb-1 mt-1">
                            <div className="d-flex justify-content-between align-items-center news-center">
                              <div className="text-large title-homelayout" style={{ padding: '0 10px' }}>
                                Tuyển dụng
                              </div>
                              <div
                                className="d-flex mb-0 justify-content-end home-link"
                                onClick={() => handleOpenSheet('Tuyển dụng', '/recruitment-news')}>
                                <a href="/" onClick={(e) => e.preventDefault()}>
                                  Xem tất cả
                                </a>
                              </div>
                            </div>
                            <div className="mobile-content">
                              <HomeRecruitment setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} listNews={recruitmentList.slice(0, 2)} />
                            </div>
                          </div>
                        )}
                      </div>
                      {expertNews?.length > 0 && (
                        <div className="home-container mb-5">
                          <div className="d-flex justify-content-between align-items-center news-center">
                            <div className="text-large title-homelayout" style={{ padding: '0 10px' }}>
                              Chuyên gia chia sẻ
                            </div>
                            <div
                              className="d-flex mb-0 justify-content-end home-link"
                              onClick={() => handleOpenSheet('Chuyên gia chia sẻ', '/expert-news')}>
                              <a href="/" onClick={(e) => e.preventDefault()}>
                                Xem tất cả
                              </a>
                            </div>
                          </div>
                          <div className="mobile-content">
                            <HomeNew setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} listNews={expertNews} />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {stationConfigs
                  .map((stationConfig) => {
                    const [[key, items]] = Object.entries(stationConfig)
                    switch (key) {
                      case 'default':
                        return (
                          <L2FunctionButtonList
                            setSheetVisible={setSheetVisible}
                            setDataBtn={setDataBtn}
                            list={items}
                            title={SECTION['default']}
                            isDefaultSection={true}></L2FunctionButtonList>
                        )
                      case '0':
                        return (
                          <L2FunctionButtonList
                            setSheetVisible={setSheetVisible}
                            setDataBtn={setDataBtn}
                            list={items}
                            title={SECTION['0']}></L2FunctionButtonList>
                        )
                      case '1':
                        return (
                          <L2FunctionButtonList
                            setSheetVisible={setSheetVisible}
                            setDataBtn={setDataBtn}
                            list={items}
                            title={SECTION['1']}></L2FunctionButtonList>
                        )
                      case '2':
                        return (
                          <L2FunctionButtonList
                            setSheetVisible={setSheetVisible}
                            setDataBtn={setDataBtn}
                            list={items}
                            title={SECTION['2']}></L2FunctionButtonList>
                        )
                      case '3':
                        return (
                          <L2FunctionButtonList
                            setSheetVisible={setSheetVisible}
                            setDataBtn={setDataBtn}
                            list={items}
                            title={SECTION['3']}></L2FunctionButtonList>
                        )
                      default:
                        break
                    }
                  })
                  .map((sc, index) => {
                    if (index === 0) {
                      return <div className="booking-layout2 mb-4">{sc}</div>
                    }
                    return sc
                  })}
              </div>
            )}
            {bottomBanner?.length > 1 && <PageLayout>{renderBottomSlider}</PageLayout>}
            {bottomBanner?.length == 1 && (
              <div className={'layout2'}>
                <img style={{ borderRadius: '8px' }} src={bottomBanner[0]?.bannerImageUrl}></img>
              </div>
            )}
          </div>
        </div>
      </sc.Container>
      <div>
        <PopupSheetIframe
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          title={dataBtn?.label?.replaceAll('<br>', '') || dataBtn?.title}
          iframeUrl={handleReturnLink()}
        />
      </div>
      <div className="hidden-pop">
        <PopupSheetIframe
          visible={firtLoadding}
          onClose={() => setFirtLoadding(false)}
          title={dataBtn?.label?.replaceAll('<br>', '') || dataBtn?.title}
          iframeUrl={`${process.env.REACT_APP_DEPLOY_URL}/stations?type=3&name=Bảo%20dưỡng%20ô%20tô&isEmbeddedView=true`}
          styleCss={{ style: { minHeight: '10vh' } }}
        />
      </div>

      {/* Modal hỗ trợ CSKH */}
      <Modal
        visible={isSupportModalVisible}
        onClose={() => setIsSupportModalVisible(false)}
        title="Hỗ trợ khách hàng"
      >
        <Box className="bottom-sheet-body" style={{ textAlign: 'center', padding: '20px 0' }}>
          <ClickableTextPhone phoneNum="0366458835" children={<span>Số điện thoại hỗ trợ: <strong>0366 458 835</strong></span>} />
        </Box>
      </Modal>

    </>
  )
}
export default HomeLayout2
