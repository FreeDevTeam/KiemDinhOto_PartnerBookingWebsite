import './App.css';
import React, { useEffect, useLayoutEffect } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { Spin } from 'antd'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import "./assets/scss/index.scss"
import './bootstrap.min.css'
import './common.scss'
import './inputCommon.scss'
import './selectCommon.scss'
import './tableCommon.scss'
import './modalCommon.scss'
import './buttonCommon.scss'
import './main.scss'
import './dropDownCommon.scss'
import { IS_ZALO_MINI_APP } from './constants/global';
import Layout from './components/Layout';
import Logo from './assets/MAINLOGO.png'
import { PATH } from './constants/router';
import { GlobalProvider } from './context/GlobalContext';
import { fillterRoutes } from './router';
import { setMetaData } from "./actions";
import { useDispatch } from 'react-redux'
import BookingService from './services/addBookingService';
import SystemConfigurationsService from './services/SystemConfigurationsService';
import { getQueryParams } from './page/BookingPartner/bookingPartnerForm';
import addKeyLocalStorage from './helper/localStorage';
export const baseName = IS_ZALO_MINI_APP ? `/zapps/${process.env.REACT_APP_ZMP_APP_ID}` : '/'
function App() {
  // Kiểm tra xem có APIKey trong URL không cho tính năng tự động đặt lịch
  const urlParams = new URLSearchParams(window.location.search);
  const apiKey = urlParams.get('apikey') || process.env.REACT_APP_BOOKING_API_KEY || undefined;
  if(apiKey) {
    localStorage.setItem('apiKey', apiKey)
  }

  const dispatch = useDispatch()
  const themeApp = process.env.REACT_APP_THEME_NAME
  const setThemeApp = () => {
    document.querySelector('body').setAttribute('data-theme', themeApp)
  }
  useEffect(() => {
    setThemeApp()
  }, [])
  function fetchListMetaData() {
    BookingService.getMetaData({}).then(result => {
      const { statusCode,data } = result
      if(statusCode == 200)
      dispatch(setMetaData(data))
    })
  }
  
  const handleCheckApiKey = ()=>{
    const API_KEY = process.env.REACT_APP_BOOKING_API_KEY
    if(!API_KEY){
      // const domain = 'dangkiem1406D.ttdk.com.vn' // dùng cho trường hợp localhost
      const domain = window.location.origin.split('//')[1] // dùng cho trường hợp dev
      SystemConfigurationsService.getApiKeyByDomain({domain}).then(result => {
        if(result){
          const enableApiKey = result[0]?.apiKeyEnable
          enableApiKey && result[0]?.apiKey && localStorage.setItem('API_KEY', result[0]?.apiKey)
        }
      })
    }
  }
  
  const getStationConfigByApiKeyAndSetTheme = async () => {
    const apiKeyLocal = (JSON.parse(localStorage.getItem(addKeyLocalStorage('dataTheme'))) || {})?.apiKey
    const params = getQueryParams()
    const apiKey = params?.apikey || process.env.REACT_APP_BOOKING_API_KEY
    if (apiKeyLocal !== apiKey || !apiKey) {
      localStorage.removeItem(addKeyLocalStorage('dataTheme'))
    }
    const theme = {}
    apiKey && await SystemConfigurationsService.getStationConfigByApiKey({ apiKey: apiKey })
      .then(async(result) => {
        const stationMiniAppLink = JSON.parse(result?.[0]?.stationMiniAppLink || '{}')
        theme.partnerColorButton = stationMiniAppLink?.partnerColorButton
        theme.partnerBackground = stationMiniAppLink?.partnerBackground?.[0]?.url
        theme.partnerColorGradient = stationMiniAppLink?.partnerColorGradient
        theme.stationsLogo = result?.[0]?.stationsLogo
      })
      theme.apiKey = apiKey
      localStorage.setItem(addKeyLocalStorage('dataTheme'), JSON.stringify(theme))
      theme?.partnerColorButton && document.documentElement.style.setProperty('--title-color',  theme?.partnerColorButton);
      theme?.partnerColorGradient && document.documentElement.style.setProperty('--linear-gradient-active',  theme?.partnerColorGradient);
    }

  useLayoutEffect(() => {
    fetchListMetaData()
    handleCheckApiKey()
    getStationConfigByApiKeyAndSetTheme()
    const loadingScreen = document.querySelector('.splash-screen-loading');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
  }, []);
  return (
    <GlobalProvider>
      <Router export basename={baseName}>
        <Switch>
          {Object.keys(fillterRoutes).map((key) => {
            return (
              <Route
                key={Math.random()}
                exact
                path={fillterRoutes[key].path}
                component={(props) => (
                  <React.Suspense
                    fallback={
                      <div className="loading" style={{ background: 'white' }}>
                        <Spin />
                      </div>
                    }>
                    <Layout {...props} Component={fillterRoutes[key].component} hideMobileMenu={fillterRoutes[key].hideMobileMenu} />
                  </React.Suspense>
                )}
              />
            )
          })}
          <Redirect to={PATH.HOME} />
        </Switch>
      </Router>
    </GlobalProvider>
  );
}

export default App;
