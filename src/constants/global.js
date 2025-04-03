import React from 'react'
import { ReactComponent as MoMoIcon } from '../assets/Booking-icon/momo2.svg'
import { ReactComponent as BankIcon } from '../assets/Booking-icon/banking-svgrepo-com2.svg'
import ViSaIcon  from '../assets/Booking-icon/visa.png'
import  CashIcon  from '../assets/Booking-icon/cash.png'
import AtmIcon from "../assets/Booking-icon/atmCard.png";
import L2PVIIcon from "../assets/icons/PVI.png";
import L2VNIIcon from "../assets/icons/VNI.png";
import L2VBSHIcon from "../assets/icons/BSH.png";
import L2MICIcon from "../assets/icons/MIC.png";
import L2TASCOIcon from "../assets/icons/Tasco.png";

export const IS_ZALO_MINI_APP = window.APP_CONTEXT === 'zalo-mini-app'

export const SCHEDULE_STATUS_3_0 = [
  {
    label: 'Chưa xác nhận',
    value: 0,
    color: '#ADADAD'
  },
  {
    label: 'Đã xác nhận',
    value: 10,
    color: '#FF7B42'
  },
  {
    label: 'Đã hủy',
    value: 20,
    color: '#424242'
  },
  {
    label: 'Đã đóng',
    value: 30,
    color: '#34AA44'
  }
]
export const SCHEDULE_STATUS = [
  {
    label: 'Tất cả',
    color: '#C87800',
    key:'ALL'
  },
  {
    label: 'Chưa xác nhận',
    value: 0,
    color: '#C87800',
    key:'UNCONFIRMED'
  },
  {
    label: 'Đã xác nhận',
    value: 10,
    color: '#0870D9',
    key:'CONFIRMED'
  },
  {
    label: 'Đã hủy',
    value: 20,
    color: '#D7D7D7',
    key:'CANCELED'
  },
  {
    label: 'Đã hoàn thành',
    value: 30,
    color: '#34AA44',
    key:'CLOSED'
  }
]

export const CUSTOMER_RECEIPT_STATUS = {
  NEW: 'New',
  PROCESSING: 'Processing',
  PENDING: 'Pending',
  FAILED: 'Failed',
  SUCCESS: 'Success',
  CANCELED: 'Canceled'
}
export const RATIO_IMG = {
  DEFAULT:{
    value: "16/9"
  },
  PROMOTIONNEW:{
    value: "16/12"
  }
}
export const CUSTOMER_RECEIPT_STATUS_TO_TEXT = {
  NEW: 'Mới',
  PROCESSING: 'Đang xử lý',
  PENDING: 'Chờ xử lý',
  FAILED: 'Thất bại',
  SUCCESS: 'Thành công',
  CANCELED: 'Đã hủy'
}

export const VIHCLE_TYPES_STATE = {
  CAR: 0,
  OTHER_VEHICLES: 10,
  TRAILERS: 20
}
export const PLATE_COLOR=[
  {
    label: 'Trắng',
    value: 1,
  },
  {
    label: 'Xanh',
    value: 2,
  },
  {
    label: 'Vàng',
    value: 3,
  },
  // {
  //   label: 'Đỏ',
  //   value: 4,
  // },
]
export const SCHEDULE_TYPE = [
  { value : 1, label: 'Đăng kiểm xe định kỳ'},
  { value : 2, label: 'Đăng ký dán thẻ EPASS'},
  { value : 3, label: 'Nộp hồ sơ xe mới'},
  { value : 4, label: 'Thay đổi thông tin xe'},
  { value : 7, label: 'Tư vấn bảo dưỡng'},
  { value : 8, label: 'Tư vấn bảo hiểm'},
  { value : 9, label: 'Tư vấn hoán cải'},
  { value : 10, label: 'Mất giấy đăng kiểm'},
  { value : 11, label: 'Cấp lại tem đăng kiểm'},
  { value : 12, label: 'Tư vấn đăng kiểm xe'},
  { value : 13, label: 'Tư vấn xử lý phạt nguội'},
  { value : 14, label: 'Tư vấn bảo hiểm TNDS xe ô tô'},
  { value : 15, label: 'Tra cứu cảnh báo đăng kiểm'},
  { value : 16, label: 'Hỗ trợ xử lý phạt nguội'},
  { value : 17, label: 'Gia hạn định vị'},
  { value : 18, label: 'Gia hạn phù hiệu xe kinh doanh'},
  { value : 19, label: 'Gia hạn giấy tập huấn'},
  { value : 20, label: 'Gia hạn camera hành trình'},
  { value : 21, label: 'Đăng ký dán thẻ VETC'},
  { value : 22, label: 'Gia hạn BH TNDS'},
  { value : 23, label: 'Nộp hồ sơ xe mới (Ngoài giờ HC)'},
  { value : 24, label: 'Đăng kiểm xe (Ngoài giờ HC)'},
  { value : 25, label: 'Tư vấn bồi thường bảo hiểm'},
  { value : 26, label: 'Tư vấn sức khỏe lái xe'},
]
export const SCHEDULE_TITLE = {
  [SCHEDULE_TYPE.VEHICLE_INSPECTION]: {
    title: 'Đăng kiểm xe định kỳ',
    subTitle: 'Dành cho khách hàng đặt lịch để đăng kiểm các xe đã đăng kiểm trước đây'
  },
  [SCHEDULE_TYPE.NEW_VEHICLE_INSPECTION]: {
    title: 'Đăng kiểm xe mới',
    subTitle: 'Dành cho khách hàng đăng kiểm lần đầu - không mang phương tiện đến trạm đăng kiểm'
  },
}
export const VIHCLE_TYPES = [
  {
    label: 'Xe ô tô con < 9 chỗ',
    value: 1,
  },
  {
    label: 'Xe rơ mooc',
    value: 20,
  },
  {
    label: 'Xe bán tải, phương tiện khác',
    value: 10,
  }
]
export const VEHICLE_SUB_CATEGORY = {
  CAR: 1, //- Ô tô con
  PASSENGER: 11, //- Ô tô khách
  TRUCKER: 12, //- Xe tải
  GROUP: 13, // đoàn oto
  ROMOOCL: 20, //- Romooc, sơmi romooc
  CAR_SPECIALIZED: 14, // xe bán tải
  ORTHER: 10 // phương tiện khác
}
export const PAYMENT_OBJECT = {
  CASH: {
    id: 1,
    value: 'cash',
    label: 'Tiền mặt',
    enablePaymentOnline: 1,
    icon: (
      <div className="d-flex align-items-center justify-content-center">
        <img src={CashIcon} style={{ maxWidth: '83px',width:'100%', height: '100px' }} />
      </div>
    )
  },
  ATM: {
    id: 2,
    value: 'atm',
    label: 'Chuyển khoản ngân hàng',
    enablePaymentOnline: 1,
    icon: <BankIcon className="w-icon " />
  }, // atm/bank
  MOMO: {
    id: 5,
    value: 'momo',
    label: 'Ví điện tử MoMo',
    enablePaymentOnline: 1,
    icon: <MoMoIcon className="w-icon " />
  },
  CREDIT_CARD: {
    id: 4,
    value: 'creditcard', // visa
    label: 'VISA / MASTER / JCB',
    enablePaymentOnline: 1,
    icon: (
      <div  className="d-flex align-items-center justify-content-center">
        <img src={ViSaIcon} style={{ maxWidth: '83px',width:'100%', height: '100px' }} />
      </div>
    )
  },
  DOMESTIC_CARD: {
    id: 6,
    value: 'domesticcard',
    label: 'Thẻ thanh toán nội địa (ATM)',
    enablePaymentOnline: 1,
    icon: (
      <div className="d-flex align-items-center justify-content-center">
        <img src={AtmIcon}  style={{ maxWidth: '75px',width:'100%', height: '80px',marginBottom:'10px'}}/>
      </div>
    )
  },
  MOMO_BUSINESS: {
    id: 7,
    value: 'momobusiness',
    label: 'Thanh toán qua MoMo',
    enablePaymentOnline: 1,
    icon: <MoMoIcon className="w-icon " />
  }
}
export const VEHICLE_COLOR = { 1: 'WHITE', 2: 'BLUE', 3: 'YELLOW', 4: 'RED' }

export const VIHCLE_CATEGORY_OTO = [
  {
    label: 'Xe ô tô 4 chỗ',
    value: 1001,
    seat:4
  },
  {
    label: 'Xe ô tô 5 chỗ',
    value: 1002,
    seat:5
  },
  {
    label: 'Xe ô tô 6 chỗ',
    value: 1003,
    seat:6
  },
  {
    label: 'Xe ô tô 7 chỗ',
    value: 1004,
    seat:7
  },
  {
    label: 'Xe ô tô 8 chỗ',
    value: 1005,
    seat:8
  },
  {
    label: 'Xe ô tô 9 chỗ',
    value: 1006,
    seat:9
  }
]

export const VIHCLE_CATEGORY_BUS = [
  {
    label: 'Xe ô tô 10 chỗ',
    value: 1007,
    seat:10
  },
  {
    label: 'Xe ô tô 11 chỗ',
    value: 1008,
    seat:11
  },
  {
    label: 'Xe ô tô 12 chỗ',
    value: 1009,
    seat:12
  },
  {
    label: 'Xe ô tô 13 chỗ',
    value: 1010,
    seat:13
  },
  {
    label: 'Xe ô tô 14 chỗ',
    value: 1011,
    seat:14
  },
  {
    label: 'Xe ô tô 15 chỗ',
    value: 1012,
    seat:15
  },
  {
    label: 'Xe ô tô 16 chỗ',
    value: 1013,
    seat:16
  },
  {
    label: 'Xe ô tô 17 chỗ',
    value: 1014,
    seat:17
  },
  {
    label: 'Xe ô tô 18 chỗ',
    value: 1015,
    seat:18
  },
  {
    label: 'Xe ô tô 19 chỗ',
    value: 1016,
    seat:19
  },
  {
    label: 'Xe ô tô 20 chỗ',
    value: 1017,
    seat:20
  },
  {
    label: 'Xe ô tô 21 chỗ',
    value: 1018,
    seat:21
  },
  {
    label: 'Xe ô tô 22 chỗ',
    value: 1019,
    seat:22
  },
  {
    label: 'Xe ô tô 23 chỗ',
    value: 1020,
    seat:23
  },
  {
    label: 'Xe ô tô 24 chỗ',
    value: 1021,
    seat:24
  },
  {
    label: 'Xe ô tô 25 chỗ',
    value: 1022,
    seat:25
  },
  {
    label: 'Xe ô tô 29 chỗ',
    value: 1023,
    seat:29
  },
  {
    label: 'Xe ô tô 45 chỗ',
    value: 1024,
    seat:45
  },
  {
    label: 'Xe ô tô 52 chỗ',
    value: 1025,
    seat:52
  }
]

export const VIHCLE_CATEGORY_TRUCK = [
  {
    label: 'Xe tải dưới 1 tấn',
    value: 2002,
    maxWeight:999,
    minWeight:0
  },
  {
    label: 'Xe tải dưới 2 tấn',
    value: 2003,
    maxWeight:1999,
    minWeight:1000
  },
  {
    label: 'Xe tải dưới 3 tấn',
    value: 2004,
    maxWeight:2999,
    minWeight:2000
  },
  {
    label: 'Xe tải dưới 4 tấn',
    value: 2005,
    maxWeight:3999,
    minWeight:3000
  },
  {
    label: 'Xe tải dưới 5 tấn',
    value: 2006,
    maxWeight:4999,
    minWeight:4000
  },
  {
    label: 'Xe tải dưới 6 tấn',
    value: 2007,
    maxWeight:5999,
    minWeight:5000
  },
  {
    label: 'Xe tải dưới 7 tấn',
    value: 2008,
    maxWeight:6999,
    minWeight:6000
  },
  {
    label: 'Xe tải dưới 8 tấn',
    value: 2009,
    maxWeight:7999,
    minWeight:7000
  },
  {
    label: 'Xe tải dưới 9 tấn',
    value: 2010,
    maxWeight:8999,
    minWeight:8000
  },
  {
    label: 'Xe tải dưới 10 tấn',
    value: 2011,
    maxWeight:9999,
    minWeight:9000
  },
  {
    label: 'Xe tải dưới 11 tấn',
    value: 2012,
    maxWeight:10999,
    minWeight:10000
  },
  {
    label: 'Xe tải dưới 12 tấn',
    value: 2013,
    maxWeight:11999,
    minWeight:11000
  },
  {
    label: 'Xe tải dưới 13 tấn',
    value: 2014,
    maxWeight:12999,
    minWeight:12000
  },
  {
    label: 'Xe tải dưới 14 tấn',
    value: 2015,
    maxWeight:13999,
    minWeight:13000
  },
  {
    label: 'Xe tải dưới 15 tấn',
    value: 2016,
    maxWeight:14999,
    minWeight:14000
  },
  {
    label: 'Xe tải dưới 16 tấn',
    value: 2017,
    maxWeight:15999,
    minWeight:15000
  },
  {
    label: 'Xe tải dưới 17 tấn',
    value: 2018,
    maxWeight:16999,
    minWeight:16000
  },
  {
    label: 'Xe tải dưới 18 tấn',
    value: 2019,
    maxWeight:17999,
    minWeight:17000
  },
  {
    label: 'Xe tải dưới 19 tấn',
    value: 2020,
    maxWeight:18999,
    minWeight:18000
  },
  {
    label: 'Xe tải dưới 27 tấn',
    value: 2021,
    maxWeight:26999,
    minWeight:26000
  },
  {
    label: 'Xe tải dưới 40 tấn',
    value: 2022,
    maxWeight:39999,
    minWeight:27000
  },
  {
    label: 'Xe tải trên 40 tấn',
    value: 2023,
    maxWeight:99999,
    minWeight:40000
  }
]

export const VIHCLE_CATEGORY_GROUP = [
  {
    label: 'Xe đầu kéo dưới 19 tấn',
    value: 2024,
    maxWeight:18999,
    minWeight:0,
  },
  {
    label: 'Xe đầu kéo dưới 27 tấn',
    value: 2025,
    maxWeight:26999,
    minWeight:19000,
  },
  {
    label: 'Xe đầu kéo dưới 40 tấn',
    value: 2026,
    maxWeight:39999,
    minWeight:27000,
  },
  {
    label: 'Xe đầu kéo trên 40 tấn',
    value: 2027,
    maxWeight:99999,
    minWeight:40000,
  }
]

export const VIHCLE_CATEGORY_MOOC = [
  {
    label: 'Xe rơ moóc',
    value: 3000,
    maxWeight:99999,
    minWeight:0,
  }
]

export const VIHCLE_CATEGORY_PICKUP = [
  {
    label: 'Xe bán tải',
    value: 2001,
    maxWeight:3999,
    minWeight:0,
    seat:5
  }
]

export const VIHCLE_CATEGORY_SPECIALIZED = [
  {
    label: 'Xe chuyên dụng',
    value: 4000
  },
  {
    label: 'Xe 4 bánh có động cơ',
    value: 5000
  },
  {
    label: 'Xe cứu thương',
    value: 6000
  }
]

export const VIHCLE_CATEGORY_ORTHER = [
  {
    label: 'Xe ô tô 10 chỗ',
    value: 1007
  },
  {
    label: 'Xe ô tô 11 chỗ',
    value: 1008
  },
  {
    label: 'Xe ô tô 12 chỗ',
    value: 1009
  },
  {
    label: 'Xe ô tô 13 chỗ',
    value: 1010
  },
  {
    label: 'Xe ô tô 14 chỗ',
    value: 1011
  },
  {
    label: 'Xe ô tô 15 chỗ',
    value: 1012
  },
  {
    label: 'Xe ô tô 16 chỗ',
    value: 1013
  },
  {
    label: 'Xe ô tô 17 chỗ',
    value: 1014
  },
  {
    label: 'Xe ô tô 18 chỗ',
    value: 1015
  },
  {
    label: 'Xe ô tô 19 chỗ',
    value: 1016
  },
  {
    label: 'Xe ô tô 20 chỗ',
    value: 1017
  },
  {
    label: 'Xe ô tô 21 chỗ',
    value: 1018
  },
  {
    label: 'Xe ô tô 22 chỗ',
    value: 1019
  },
  {
    label: 'Xe ô tô 23 chỗ',
    value: 1020
  },
  {
    label: 'Xe ô tô 24 chỗ',
    value: 1021
  },
  {
    label: 'Xe ô tô 25 chỗ',
    value: 1022
  },
  {
    label: 'Xe ô tô 29 chỗ',
    value: 1023
  },
  {
    label: 'Xe ô tô 45 chỗ',
    value: 1024
  },
  {
    label: 'Xe ô tô 52 chỗ',
    value: 1025
  },
  {
    label: 'Xe tải dưới 1 tấn',
    value: 2002
  },
  {
    label: 'Xe tải dưới 2 tấn',
    value: 2003
  },
  {
    label: 'Xe tải dưới 3 tấn',
    value: 2004
  },
  {
    label: 'Xe tải dưới 4 tấn',
    value: 2005
  },
  {
    label: 'Xe tải dưới 5 tấn',
    value: 2006
  },
  {
    label: 'Xe tải dưới 6 tấn',
    value: 2007
  },
  {
    label: 'Xe tải dưới 7 tấn',
    value: 2008
  },
  {
    label: 'Xe tải dưới 8 tấn',
    value: 2009
  },
  {
    label: 'Xe tải dưới 9 tấn',
    value: 2010
  },
  {
    label: 'Xe tải dưới 10 tấn',
    value: 2011
  },
  {
    label: 'Xe tải dưới 11 tấn',
    value: 2012
  },
  {
    label: 'Xe tải dưới 12 tấn',
    value: 2013
  },
  {
    label: 'Xe tải dưới 13 tấn',
    value: 2014
  },
  {
    label: 'Xe tải dưới 14 tấn',
    value: 2015
  },
  {
    label: 'Xe tải dưới 15 tấn',
    value: 2016
  },
  {
    label: 'Xe tải dưới 16 tấn',
    value: 2017
  },
  {
    label: 'Xe tải dưới 17 tấn',
    value: 2018
  },
  {
    label: 'Xe tải dưới 18 tấn',
    value: 2019
  },
  {
    label: 'Xe tải dưới 19 tấn',
    value: 2020
  },
  {
    label: 'Xe tải dưới 27 tấn',
    value: 2021
  },
  {
    label: 'Xe tải dưới 40 tấn',
    value: 2022
  },
  {
    label: 'Xe tải trên 40 tấn',
    value: 2023
  },
  {
    label: 'Xe đầu kéo dưới 19 tấn',
    value: 2024
  },
  {
    label: 'Xe đầu kéo dưới 27 tấn',
    value: 2025
  },
  {
    label: 'Xe đầu kéo dưới 40 tấn',
    value: 2026
  },
  {
    label: 'Xe đầu kéo trên 40 tấn',
    value: 2027
  },
  {
    label: 'Xe bán tải',
    value: 2001
  },
  {
    label: 'Xe chuyên dụng',
    value: 4000
  },
  {
    label: 'Xe 4 bánh có động cơ',
    value: 5000
  },
  {
    label: 'Xe cứu thương',
    value: 6000
  }
]

export const VEHICLE_SUB_TYPE = [
  {
    label: 'Xe ô tô con',
    value: 1,
    vehicleType:1,
  },
  {
    label: 'Xe khách',
    value: 11,
    vehicleType:10,
  },
  {
    label: 'Xe tải',
    value: 12,
    vehicleType:10,
  },
  {
    label: 'Ô tô đầu kéo',
    value: 13,
    vehicleType:10,
  },
  {
    label: 'Rơ moóc và sơ mi rơ moóc',
    value: 20,
    vehicleType:20,
  },
  {
    label: 'Phương tiện khác',
    value: 10,
    vehicleType:10,
  },
  {
    label: 'Xe bán tải',
    value: 14,
    vehicleType:10,
  }
]
export const TTDK_INSURANCE_PARTNER = {
  MIC:{
    id:1,
    label: 'MIC',
    link:'https://emic.vn/menuak.aspx?p=G,071_TTDK,XEL#bhhd_xelE',
    icon:(
      <div className="d-flex align-items-center justify-content-center">
        <img src={L2MICIcon} style={{width:'35px',height:'15px'}}/>
      </div>
    ),
  },
  TASCO:{
    id:2,
    label: 'TASCO',
    link:'https://baohiemtasco.vn/',
    icon:(
      <div className="d-flex align-items-center justify-content-center">
        <img src={L2TASCOIcon} style={{width:'35px',height:'15px'}}/>
      </div>
    ),
  },
  PVI:{
    id:3,
    label: 'PVI',
    link:'https://ttdk.partner.saladin.vn',
    icon:(
      <div className="d-flex align-items-center justify-content-center">
        <img src={L2PVIIcon} style={{width:'35px',height:'15px'}}/>
      </div>
    ),
  },
  VNI:{
    id:4,
    label: 'VNI',
    link:'https://ttdk.partner.saladin.vn',
    icon:(
      <div className="d-flex align-items-center justify-content-center">
        <img src={L2VNIIcon} style={{width:'35px',height:'15px'}}/>
      </div>
    ),
  },
  BSH:{
    id:5,
    label: 'BSH',
    link:'https://ttdk.partner.saladin.vn',
    icon:(
      <div className="d-flex align-items-center justify-content-center">
        <img src={L2VBSHIcon} style={{width:'35px',height:'15px'}}/>
      </div>
    ),

  },
}

export const WEBVIEW_TYPES = {
  WEBVIEW: 1,
}