import React, {  useState } from 'react'
import { useSelector } from 'react-redux'
import HomeNew from '../HomeNew'
import './index.scss'
import NewService from 'services/StationsNewsServiceFunctions'
import AreaByIP from 'services/getAreaByIP'
import SystemConfigurationsService from 'services/SystemConfigurationsService'
import { useEffect } from 'react'
import { UpdateClickCount } from '../updateClickCount'

const filter = {
  limit: 5,
  filter: {
    stationStatus: 1,
    stationType:1
  }
}
const L2NewsListLayout = (props) => {
  const {listNews} = props
  const { introduction, history } = props
  const auth = useSelector((state) => state.authReducer)
  const [hotNews, setHotNews] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const [stations, setStations] = useState({
    data: []
  })

  const [isLoading , setIsLoading] = useState(false);

  const getStation = () => {
    setTimeout(() => {
      setIsVisible(true)
      NewService.getStationsList(filter).then((result) => {
        setIsVisible(false)
        if (result) {
          setStations({
            ...result
          })
        }
        return result
      })
    }, 1000);
  }
const getAreaByIP = () => {
  AreaByIP.getAreaByIP().then((result) => {
    const { statusCode,data } = result
    if (statusCode == 200) {
      if(data.stationArea){
        filter.filter.stationArea = data.stationArea
        getStation(filter)
      }
    }
    return result
  })
}

  useEffect(() => {
    getStation();
    UpdateClickCount()
    getAreaByIP()
  }, [])


  const fetchData = () => {
    setIsLoading(true);
    const clearBannerUrls = (banners) => {
      for (let i = 1; i <= 5; i++) {
        const key = 'bannerUrl${i}';
        const value = 'banner${i}';
        if (banners[key] === value) {
          banners[key] = "";
        }
      }
      return banners;
    };
    setIsLoading(false);
  }

  const getNews = () =>{
    NewService.userGetHotNewList().then((result) => {
      if (result) {
        setHotNews(result.data)
      }
    })
  }

  useEffect(() => {
    fetchData()
    getNews()
  }, []);

  return (
    <>
      <div>
        {listNews?.length > 0 && (
          <div style={{padding:'0 10px', marginBottom:'2rem'}}>
            <div className="d-flex justify-content-between align-items-center news-center" >
              <div className='text-large title-homelayout' style={{padding:'10px 0'}}>Tin tức</div>
              <div className="d-flex mb-0 justify-content-end home-link" onClick={() => history.push('/new')}>
                <a href="/" onClick={(e) => e.preventDefault()}>
                  Xem tất cả
                </a>
              </div>
            </div>
            <HomeNew listNews={listNews} />
          </div>
        )}
      </div>
    </>
  )
}
export default L2NewsListLayout