import React from 'react';
import { PATH } from './constants/router';
const BookingPartner = React.lazy(() => import('./page/BookingPartner/index'))
const MyBookingHistory = React.lazy(() => import('./page/MyBookingHistory/index'))
const BookingDetail = React.lazy(() => import('./page/BookingDetail/index'))
const UpdateBookingDetail = React.lazy(() => import('./page/BookingDetail/UpdateBookingDetail'))
const LoginSuccess = React.lazy(() => import('./page/LoginSuccess/index'))

export const ROUTERS = {
    // Trang chủ là trang đặt lịch
    booking: {
        path: PATH.HOME,
        component: BookingPartner
    },
    bookingHistory: {
        path: PATH.BOOKING_HISTORY,
        component: MyBookingHistory
    },
    bookingDetail: {
        path: PATH.BOOKING_DETAIL,
        component: BookingDetail
    },
    bookingDetailNoId: {
        path: PATH.BOOKING_DETAIL_NO_ID,
        component: BookingDetail
    },
    bookingUpdate: {
        path: PATH.BOOKING_UPDATE,
        component: UpdateBookingDetail
    },
    loginSuccess: {
        path: PATH.LOGIN_SUCCESS,
        component: LoginSuccess
    }
};
