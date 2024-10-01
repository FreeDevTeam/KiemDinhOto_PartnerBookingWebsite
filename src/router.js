import { PATH } from './constants/router';
import React, { createContext, useState } from 'react';
const BookingPartner = React.lazy(() => import('./page/BookingPartner/index'))
const CheckVihcle = React.lazy(() => import('./page/CheckVihcle/index'))
const BookingInsurancePartner = React.lazy(() => import('./page/BookingInsurancePartner/index'))
const BookingInsuranceSaladin = React.lazy(() => import('./page/BookingInsuranceSaladin/index'))
const BookingPartnerIframe = React.lazy(() => import('./page/Booking/index'))
const BookingHistory = React.lazy(() => import('./page/BookingHistory/index'))
const HomePage = React.lazy(() => import('./page/Home/index'))
const ResetPassword = React.lazy(() => import('./page/ResetPassword'))
const MyBookingHistory = React.lazy(() => import('./page/MyBookingHistory/index'))
const BookingDetail = React.lazy(() => import('./page/BookingDetail/index'))

const BookingType=process.env.REACT_APP_BHTNDS

const handleCheckPage=()=>{
    console.log(BookingType);
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

export const ROUTERS = {
    //page on ZALO app
    homePage: {
        path: PATH.HOME,
        component: HomePage,
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
    // page on web
    checkVihcle: {
        path: PATH.HOME,
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

