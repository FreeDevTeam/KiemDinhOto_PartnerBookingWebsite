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
import { ReactComponent as LogoTTDK } from './assets/icons/Logo.svg'
import Logo from './assets/MAINLOGO.png'
import { PATH } from './constants/router';
import { GlobalProvider } from './context/GlobalContext';
import { fillterRoutes } from './router';
import { setMetaData } from "./actions";
import { useDispatch } from 'react-redux'
import BookingService from './services/addBookingService';
export const baseName = IS_ZALO_MINI_APP ? `/zapps/${process.env.REACT_APP_ZMP_APP_ID}` : '/'
function App() {
  // Kiểm tra xem có APIKey trong URL không cho tính năng tự động đặt lịch
  const urlParams = new URLSearchParams(window.location.search);
  const apiKey = urlParams.get('apikey') || undefined;
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
  useLayoutEffect(() => {
    fetchListMetaData()
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
