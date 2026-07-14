import { PATH } from './constants/router';
import React, { createContext, useState } from 'react';
import HomeLayout from './page/Home/HomeLayout';
const BookingPartner = React.lazy(() => import('./page/BookingPartner/index'))
const CheckVihcle = React.lazy(() => import('./page/CheckVihcle/index'))
const BookingInsurancePartner = React.lazy(() => import('./page/BookingInsurancePartner/index'))
const BookingInsuranceSaladin = React.lazy(() => import('./page/BookingInsuranceSaladin/index'))
const BookingPartnerIframe = React.lazy(() => import('./page/Booking/index'))
const BookingHistory = React.lazy(() => import('./page/BookingHistory/index'))
const HomeLayout2 = React.lazy(() => import('./page/Home/HomeLayout'))
const HomeLayout3 = React.lazy(() => import('./page/Home/HomeLayout3/index'))
const HomePageLogin = React.lazy(() => import('./page/Login/index'))
const ResetPassword = React.lazy(() => import('./page/ResetPassword'))
const MyBookingHistory = React.lazy(() => import('./page/MyBookingHistory/index'))
const BookingDetail = React.lazy(() => import('./page/BookingDetail/index'))
const PartnerGuide = React.lazy(() => import('./page/Guide/partnerGuide'))
const PersonalGuide = React.lazy(() => import('./page/Guide/personalGuide'))
const UpdateBookingDetail = React.lazy(() => import('./page/BookingDetail/UpdateBookingDetail'))
const IframeView = React.lazy(() => import('./page/IframeView'))
const ReferStation = React.lazy(() => import('./page/ReferStation/index'))

const BookingType=process.env.REACT_APP_BHTNDS
const DEFAULT_HOME_LAYOUT=process.env.REACT_APP_DEFAULT_HOME_LAYOUT

const handleCheckPage=()=>{
    switch (BookingType) {
        case '0':
            return (BookingPartner)
        case '1':
            return (BookingInsurancePartner)
        case '2':
            return (BookingInsuranceSaladin)
        default:
            return (BookingPartner)
    }
}

const handleCheckLayout=()=>{
    switch (DEFAULT_HOME_LAYOUT) {
        case '2':
            return (HomeLayout2)
        case '3':
            return (HomeLayout3)
        default:
            return (HomeLayout)
    }
}

export const ROUTERS = {
    //page on ZALO app
    homePage: {
        path: PATH.HOME,
        component: handleCheckLayout(),
        isZaloApp: 1
    },
    referStationZalo: {
        path: PATH.REFER_STATION,
        component: ReferStation,
        isZaloApp: 1
    },
    referStationBaoDuongZalo: {
        path: PATH.REFER_STATION_BAODUONG,
        component: ReferStation,
        isZaloApp: 1
    },
    referStationCuuHoZalo: {
        path: PATH.REFER_STATION_CUUHO,
        component: ReferStation,
        isZaloApp: 1
    },
    homeLogin: {
        path: PATH.LOGIN,
        component: HomePageLogin,
        isZaloApp: 1
    },
    bookingDetail: {
        path: PATH.BOOKING_DETAIL,
        component: BookingDetail,
        isZaloApp: 1
    },
    checkVihcleZalo: {
        path: PATH.CHECK_VIHCLE,
        component:CheckVihcle,
        isZaloApp: 1,
    },
    booking: {
        path: PATH.BOOKING,
        component:handleCheckPage(),
        isZaloApp: 1,
    },
    myBookingHistory: {
        path: PATH.MY_BOOKING_HYSTORY,
        component: MyBookingHistory,
        isZaloApp: 1,
    },
    resetPassword: {
        path: PATH.RESET_PASSWORD,
        component: ResetPassword,
        isZaloApp: 1
    },
    updateBookingOnMiniApp: {
        path: PATH.BOOKING_UPDATE,
        component: UpdateBookingDetail,
        isZaloApp: 1,
    },
    // page on web
    homePageWeb: {
        path: PATH.HOME,
        component: handleCheckLayout(),
        isZaloApp: 0,
    },
    referStation: {
        path: PATH.REFER_STATION,
        component: ReferStation,
        isZaloApp: 0,
    },
    referStationBaoDuongZalo: {
        path: PATH.REFER_STATION_BAODUONG,
        component: ReferStation,
        isZaloApp: 0
    },
    referStationCuuHoZalo: {
        path: PATH.REFER_STATION_CUUHO,
        component: ReferStation,
        isZaloApp: 0
    },
    checkVihcle: {
        path: PATH.CHECK_VIHCLE,
        component:CheckVihcle,
        isZaloApp: 0,
    },
    bookingHome: {
        path: PATH.BOOKING,
        component:handleCheckPage(),
        isZaloApp: 0,
    },
    bookingHistory: {
        path: PATH.BOOKING_HYSTORY,
        component: BookingHistory,
        isZaloApp: 0
    },
    myBookingHistoryWeb: {
        path: PATH.MY_BOOKING_HYSTORY,
        component: MyBookingHistory,
        isZaloApp: 0,
    },
    partnerGuide: {
        path: PATH.PARTNER_GUIDE,
        component:PartnerGuide,
        isZaloApp: 0,
    },
    personalGuide: {
        path: PATH.PERSONAL_GUIDE,
        component:PersonalGuide,
        isZaloApp: 0,
    },
    bookingDetailNoId: {
        path: PATH.BOOKING_DETAIL_NO_ID,
        component: BookingDetail,
        isZaloApp: 0
    },
    bookingDetailWeb: {
        path: PATH.BOOKING_DETAIL,
        component: BookingDetail,
        isZaloApp: 0
    },
    updateBookingOnWeb: {
        path: PATH.BOOKING_UPDATE,
        component: UpdateBookingDetail,
        isZaloApp: 0,
    },
    iframeView: {
        path: PATH.IFRAME_VIEW,
        component: IframeView,
        isZaloApp: 1,
        isFullScreen: true,
    },
    iframeViewWeb: {
        path: PATH.IFRAME_VIEW,
        component: IframeView,
        isZaloApp: 0,
        isFullScreen: true,
    },
    // bookingPartnerIframe: {
    //     path: PATH.BOOKING_PARTNER_IFRAME,
    //     component: BookingPartnerIframe,
    //     isZaloApp: false
    // },
};
const isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE * 1
export const fillterRoutes = Object.entries(ROUTERS)
    .filter(([key, route]) => route.isZaloApp === isZaloApp)
    .reduce((obj, [key, route]) => {
        obj[key] = route;
        return obj;
    }, {});

