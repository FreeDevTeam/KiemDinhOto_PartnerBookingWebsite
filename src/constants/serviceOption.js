export const SCHEDULE_TYPE = {
  VEHICLE_INSPECTION: 1, // Đăng kiểm xe định kỳ
  NEW_VEHICLE_INSPECTION: 2, // đăng kiểm xe mới
  CHANGE_REGISTATION: 4, // Đổi mục đích sử dụng, đổi chủ, đổi thông tin hồ sơ
  PAY_ROAD_FEE: 5, // Thanh toán phí đường bộ
  PAY_INSURRANCE_FEE: 6, // Thanh toán phí bảo hiểm
}

export const SCHEDULE_TITLE = {
  [SCHEDULE_TYPE.VEHICLE_INSPECTION]: {
    title: 'Đăng kiểm xe định kỳ',
    subTitle: 'Dành cho khách hàng đặt lịch để đăng kiểm các xe đã đăng kiểm trước đây'
  },
  [SCHEDULE_TYPE.NEW_VEHICLE_INSPECTION]: {
    title: 'Đăng kiểm xe mới',
    subTitle: 'Dành cho khách hàng đăng kiểm lần đầu - không mang phương tiện đến trạm đăng kiểm'
  },
  // },
  [SCHEDULE_TYPE.CHANGE_REGISTATION]: {
    title: 'Thay đổi thông tin xe',
    subTitle: 'Dành cho khách hàng muốn đổi mục đích sử dụng phương tiện, hoặc đổi thông tin chủ sở hữu xe, biển số xe'
  },
  [SCHEDULE_TYPE.PAY_ROAD_FEE]: {
    title: 'Thanh toán phí đường bộ',
    subTitle: 'Dành cho khách hàng muốn thanh toán phí đường bộ'
  },
  [SCHEDULE_TYPE.PAY_INSURRANCE_FEE]: {
    title: 'Thanh toán phí bảo hiểm',
    subTitle: 'Dành cho khách hàng muốn thanh toán phí bảo hiểm'
  },
}

export const SCHEDULE_DATA = [
  {
    id: SCHEDULE_TYPE.VEHICLE_INSPECTION,
    ...SCHEDULE_TITLE[SCHEDULE_TYPE.VEHICLE_INSPECTION],
    icon: require('../assets/icons/dk_xe_cu.png')
  },
  {
    id: SCHEDULE_TYPE.CHANGE_REGISTATION,
    ...SCHEDULE_TITLE[SCHEDULE_TYPE.CHANGE_REGISTATION],
    icon: require('../assets/icons/Isolation_Mode.png')
  },
]
