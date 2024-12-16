import { PageLayout } from './../../../components/PageLayout/PageLayout'
import { SliderHome } from './../../../components/Slider/SliderHome'
import React, { useMemo, useState } from 'react'
import * as sc from './../HomeLayout.styled'
import './../index.scss'
import { useEffect } from 'react'
import NewService from './../../../services/addBookingService'
import HomePartner from './../HomePartner'
import L2FunctionButtonList from './L2FunctionButtonList'
import L2HotNew from './L2HotNew'
import {BOOKING_LIST_BTN, BTN_LIST_SERVICE, CONVENIENCE_DRIVERS_BTN, GOVERNMENT_BTN, INSPECTION_SERVICES, HOT_SERVICES} from '../../../constants/Layout2Constants'
import { useHistory, useLocation } from 'react-router-dom'
import HomeNew from '../HomeNew'
import SystemConfigurationsService from '../../../services/SystemConfigurationsService'
import { Button, Sheet, Text, Box, Page } from "zmp-ui";
import "zmp-ui/zaui.min.css";
import { getBannerBySectionCache } from '../../../helper/getBannerBySectionCache'
import HomeRecruitment from '../HomeRecruitment'
import PartnerPromotionNew from '../PartnerPromotionNew'
import useWindowDimensions from '../../../hooks/window-dimensions'
const filter = {
  limit: 5,
  filter: {
    stationStatus: 1,
    stationType:1
  }
}
const HomeLayout2 = (props) => {
  const { introduction } = props
  const history = useHistory();
  const [hotNews, setHotNews] = useState([])
  const [driverAmenities, setDriverAmenities] = useState(CONVENIENCE_DRIVERS_BTN)
  const [governmentAgency, setGovernmentAgency] = useState(GOVERNMENT_BTN)
  const [stationNewsPartnerPromotion, setStationNewsPartnerPromotion] = useState([])
  const [stationNewsPromotion, setStationNewsPromotion] = useState([])
  const [expertNews, setExpertNews] = useState([])
  const [recruitmentList, setRecruitmentList] = useState([])
  const [partnerUtilityNews, setPartnerUtilityNews] = useState([])
  const [setting, setSetting] = useState([]);
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
  const [isLoading , setIsLoading] = useState(false);
  const [listNews , setListNews ] = useState([])

  const fetchData = () => {
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
    NewService.getBannerStationsList({
      filter: {
          bannerSection:10,
      },
    }).then(res =>{
      const {data}=res
      console.log(data);
      if(data?.length > 0){
        setSetting(data);
        setIsLoading(false);
        return
      }else{
        SystemConfigurationsService.getPublicSystemConfigurations({}).then((res) => {
          setSetting(clearBannerUrls(res));
          setIsLoading(false);
        })
      }
      setIsLoading(false);
    })

  }
  const getExpertNews = async () =>{
    await NewService.userGetExpertNews(
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
      }
    })
  }
  const getRecruitmentListNew = async () =>{
    await NewService.userGetRecruitmentNews({
        "skip": 0,
        "limit": 10,
        "order": {
          "key": "ordinalNumber",
          "value": "asc"
        }
      }).then((result) => {
      if (result) {
        setRecruitmentList(result.data)
      }
    })
  }
  const getStationNewsPartnerPromotion = async () =>{
    await NewService.getPartnerPromotionNews({
        "skip": 0,
        "limit": 10,
        "order": {
          "key": "ordinalNumber",
          "value": "asc"
        }
      }).then((result) => {
      if (result) {
        setStationNewsPartnerPromotion(result.data)
      }
    })
  }
  const renderSlider = useMemo(() => {
    return <div className='banner-Layout2'><SliderHome className={'layout2'} center setting={setting} isLoading={isLoading} /></div>
  }, [setting , isLoading])
  console.log(setting);
  const renderBottomSlider = useMemo(() => {
    return <SliderHome className={'layout2 border-r'} setting={bottomBanner} isLoading={isLoading} />
  }, [])

  const getNews = () =>{
    setTimeout(() => {
      NewService.userGetHotNewList().then((result) => {
        if (result) {
          setHotNews(result.data)
        }
      })
    }, 500);
  }
  const getListNews = async () =>{
    await NewService.userGetLatestNew().then((result) => {
      if (result) {
        setListNews(result.data)
      }
    })
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
    await NewService.userGetPartnerUtilityNews(4).then((result) => {
      if (result) {
        setPartnerUtilityNews(result.data)
      }
    })
  }
  const getStationNewsPromotion = async () =>{
    await NewService.getPromotionNews({
        "skip": 0,
        "limit": 10,
        "order": {
          "key": "ordinalNumber",
          "value": "asc"
        }
      }).then((result) => {
      if (result) {
        setStationNewsPromotion(result.data)
      }
    })
  }
  useEffect(() => {
    getHomePageConfig(1)
    getHomePageConfig(2)
    setTimeout(() => {
      fetchData()
    }, 200);
    setTimeout(async() =>  {
      await getExpertNews()
      await getRecruitmentListNew()
      await getPartnerUtilityNews()
      await getStationNewsPartnerPromotion()
      await getStationNewsPromotion()
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

  useEffect(() => {
    getNews()
    getListNews()
  }, []);
  const handleReturnLink=()=>{
    if(dataBtn?.link){
      return dataBtn?.link
    }else{
      if((dataBtn?.linkNavigation).slice(0, 7).includes("http") ){
        return dataBtn?.linkNavigation
      }else{
        return `${process.env.REACT_APP_DEPLOY_URL}${dataBtn?.linkNavigation}`
      }
    }
  }
  const handleOpenSheet=(Title,link)=>{
    setSheetVisible(true);
    setDataBtn({
      label: Title,
      link: `${process.env.REACT_APP_DEPLOY_URL}${link}`
    })
  }

  return (
    <>
      <sc.Container>
        <PageLayout>{renderSlider}</PageLayout>
        <div className="more mt-3">
        <div className='layout2-body' style={{ maxWidth: 600, margin: 'auto' }}>
            <div className='booking-layout2'>
              <L2FunctionButtonList setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} list={BOOKING_LIST_BTN} title={'Đặt lịch'}></L2FunctionButtonList>
            </div>
            <L2FunctionButtonList setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} list={INSPECTION_SERVICES} title={'Dịch vụ đăng kiểm'}></L2FunctionButtonList>
            <div className='layout2-bg mb-4'>
              {hotNews?.length > 0 &&
                <div style={{padding:'0 10px',marginBottom:'1.5rem'}}>
                  <div className="d-flex justify-content-between align-items-center news-center" >
                    <div className='text-large title-homelayout'>Nổi bật</div>
                    <div className="d-flex mb-0 justify-content-end home-link" onClick={() => handleOpenSheet("Nổi bật",'/highlight-news')}>
                      <a href="/" onClick={(e) => e.preventDefault()}>
                        Xem tất cả
                      </a>
                    </div>
                  </div>
                  <L2HotNew setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} hotNew={hotNews} />
                </div>
              }
            </div>
            <L2FunctionButtonList setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} slider={HOT_SERVICES?.length > 9 || (mobile && HOT_SERVICES?.length > 7)} list={HOT_SERVICES} title={'Dịch vụ nổi bật'}></L2FunctionButtonList>
            {stationNewsPartnerPromotion?.length > 0 && (
              <div className="home-container mb-5 ">
                <div className="d-flex justify-content-between align-items-center news-center" >
                  <div className='text-large title-homelayout' style={{padding:'0 10px'}}>Ưu đãi từ đối tác</div>
                  <div className="d-flex mb-0 justify-content-end home-link" onClick={() => handleOpenSheet("Ưu đãi từ đối tác",'/station-newsPartner-promotion')}>
                    <a href="/" onClick={(e) => e.preventDefault()}>
                      Xem tất cả
                    </a>
                  </div>
                </div>
                <div className='mobile-content'>
                  <HomeNew setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} listNews={stationNewsPartnerPromotion} linkDirectDetail = {"station-news-Partner-promotion-post"} showEye={false}/>
                </div>
              </div>
            )}
            <L2FunctionButtonList setSheetVisible={setSheetVisible} slider={true} setDataBtn={setDataBtn} list={BTN_LIST_SERVICE} title={'Điểm dịch vụ đề xuất'}></L2FunctionButtonList>
            <div className='layout2-bg mb-4'>
              {listNews?.length > 0 && (
                <div className="home-container mb-1 mt-1">
                  <div className="d-flex justify-content-between align-items-center news-center" >
                    <div className='text-large title-homelayout' style={{padding:'0 10px'}}>Tin tức</div>
                    <div className="d-flex mb-0 justify-content-end home-link" onClick={() => handleOpenSheet("Tin tức",'/new')}>
                      <a href="/" onClick={(e) => e.preventDefault()}>
                        Xem tất cả
                      </a>
                    </div>
                  </div>
                  <div className='mobile-content'>
                    <HomeNew setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} listNews={listNews} />
                  </div>
                </div>
              )}
            </div>
            <L2FunctionButtonList setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} slider={CONVENIENCE_DRIVERS_BTN?.length > 9 || (mobile && CONVENIENCE_DRIVERS_BTN?.length > 7)} list={CONVENIENCE_DRIVERS_BTN} title={'Tiện ích cho tài xế'}></L2FunctionButtonList>
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
            <L2FunctionButtonList setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} list={GOVERNMENT_BTN} className='government-btn' title={'Cơ quan chính phủ'}></L2FunctionButtonList>
            <div className='mb-5'>
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
            </div>
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
              <div className='layout2-bg'>
                {recruitmentList?.length > 0 && (
                  <div className="home-container mb-1 mt-1">
                    <div className="d-flex justify-content-between align-items-center news-center" >
                      <div className='text-large title-homelayout' style={{padding:'0 10px'}}>Tuyển dụng</div>
                      <div className="d-flex mb-0 justify-content-end home-link" onClick={() => handleOpenSheet("Tuyển dụng",'/recruitment-news')}>
                        <a href="/" onClick={(e) => e.preventDefault()}>
                          Xem tất cả
                        </a>
                      </div>
                    </div>
                    <div className='mobile-content'>
                      <HomeRecruitment setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} listNews={recruitmentList.slice(0,2)} />
                    </div>
                  </div>
                )}
              </div>
              {expertNews?.length > 0 &&
                <div className="home-container mb-5">
                  <div className="d-flex justify-content-between align-items-center news-center" >
                    <div className='text-large title-homelayout' style={{padding:'0 10px'}}>Chuyên gia chia sẻ</div>
                    <div className="d-flex mb-0 justify-content-end home-link" onClick={() => handleOpenSheet("Chuyên gia chia sẻ",'/expert-news')}>
                      <a href="/" onClick={(e) => e.preventDefault()}>
                        Xem tất cả
                      </a>
                    </div>
                  </div>
                  <div className='mobile-content'>
                    <HomeNew setSheetVisible={setSheetVisible} setDataBtn={setDataBtn} listNews={expertNews} />
                  </div>
                </div>
              }
            </div>
            {bottomBanner?.length > 1 && <PageLayout>{renderBottomSlider}</PageLayout>}
            {bottomBanner?.length == 1 && <div className={'layout2'}><img style={{borderRadius:'8px'}} src={bottomBanner[0]?.bannerImageUrl}></img></div>}
          </div>
        </div>
      </sc.Container>
      <div>
        <Sheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          autoHeight
          className='sheet-zalo'
          mask={true}
          swipeToClose
        >
          <Box p={4} className="custom-bottom-sheet" flex flexDirection="column">
            <Box my={4}>
              <Text.Title>{(dataBtn?.label)?.replaceAll('<br>','') || dataBtn?.title}</Text.Title>
            </Box>
            <Box className="bottom-sheet-body" style={{ overflowY: "auto"}}>
              <iframe
                src={handleReturnLink()}
                width={"100%"}
                style={{ minHeight: "70vh" }}
                frameborder="0"
              ></iframe>
            </Box>
          </Box>
        </Sheet>
      </div>

    </>
  )
}
export default HomeLayout2