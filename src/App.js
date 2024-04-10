import './App.css';
import React, { useEffect, useLayoutEffect } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { Spin } from 'antd'
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
const BookingPartner = React.lazy(() => import('./page/BookingPartner/index'))
const BookingPartnerIframe = React.lazy(() => import('./page/Booking/index'))
const BookingHistory = React.lazy(() => import('./page/BookingHistory/index'))
const HomePage = React.lazy(() => import('./page/Home/index'))
const ResetPassword = React.lazy(() => import('./page/ResetPassword'))
const MyBookingHistory = React.lazy(() => import('./page/MyBookingHistory/index'))

export const routes = {
  homePage: {
    path: PATH.HOME,
    component: HomePage
  },
  home: {
    path: PATH.BOOKING,
    component: BookingPartner
  },
  bookingPartnerIframe: {
    path: PATH.BOOKING_PARTNER_IFRAME,
    component: BookingPartnerIframe
  },
  resetPassword: {
    path: PATH.RESET_PASSWORD,
    component: ResetPassword
  },
  myBooking: {
    path: PATH.MY_BOOKING_HYSTORY,
    component: MyBookingHistory
  },
  bookingHistory: {
    path: PATH.BOOKING_HYSTORY,
    component: BookingHistory
  },
}

export const baseName = IS_ZALO_MINI_APP ? `/zapps/${process.env.REACT_APP_ZMP_APP_ID}` : '/'

function App() {
  const themeApp = process.env.REACT_APP_THEME_NAME
  const setThemeApp = () => {
    document.querySelector('body').setAttribute('data-theme', themeApp)
  }
  useEffect(() => {
    setThemeApp()
  }, [])
  useLayoutEffect(() => {
    const loadingScreen = document.querySelector('.splash-screen-loading');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
  }, []);
  return (
    <GlobalProvider>
      <Router export basename={baseName}>
        <Switch>
          {Object.keys(routes).map((key) => {
            return (
              <Route
                key={Math.random()}
                exact
                path={routes[key].path}
                component={(props) => (
                  <React.Suspense
                    fallback={
                      <div className="loading" style={{ background: 'white' }}>
                        <Spin />
                      </div>
                    }>
                    <Layout {...props} Component={routes[key].component} hideMobileMenu={routes[key].hideMobileMenu} />
                  </React.Suspense>
                )}
              />
            )
          })}
        </Switch>
      </Router>
    </GlobalProvider>
  );
}

export default App;
