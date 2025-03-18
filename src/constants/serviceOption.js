export const SCHEDULE_TYPE = {
  VEHICLE_INSPECTION: 1, // Đăng kiểm xe định kỳ
  NEW_VEHICLE_INSPECTION: 2, // đăng kiểm xe mới
  CHANGE_REGISTATION: 4, // Đổi mục đích sử dụng, đổi chủ, đổi thông tin hồ sơ
  PAY_ROAD_FEE: 5, // Thanh toán phí đường bộ
  PAY_INSURRANCE_FEE: 6, // Thanh toán phí bảo hiểm
  REGISTER_EPASS_TAG: 2, // Đăng ký dán thẻ EPASS
  REGISTER_NEW_VEHICLE: 3, // nộp hồ sơ xe mới
  CONSULTANT_MAINTENANCE: 7, // Đặt lịch tư vấn bảo dưỡng
  CONSULTANT_INSURANCE: 8, // Đặt lịch tư bảo hiểm
  CONSULTANT_RENOVATION: 9, // Đặt lịch tư vấn hoán cải
  LOST_REGISTRATION_PAPER: 10, // Mất giấy đăng kiểm
  REISSUE_INSPECTION_STICKER: 11, // Cấp lại tem đăng kiểm
  VEHICLE_INSPECTION_CONSULTATION: 12, // Tư vấn đăng kiểm xe
  TRAFFIC_FINE_CONSULTATION: 13, // Tư vấn xử lý phạt nguội
  CONSULTANT_TNDS_INSURANCE: 14, // Tư vấn bảo hiểm vật chất xe ô tô
  AUTO_NOTIFY_VIOLATION: 15, // Tra cứu cảnh báo đăng kiểm
  SUPPORT_FINE_RESOLUTION: 16, // Hỗ trợ xử lý phạt nguội
  GPS_RENEWAL: 17, // Gia hạn định vị
  BUSINESS_VEHICLE_BADGE_RENEWAL: 18, // Gia hạn phù hiệu xe kinh doanh
  TRAINING_CERTIFICATE_RENEWAL: 19, // Gia hạn giấy tập huấn
  DASHCAM_RENEWAL: 20, // Gia hạn camera hành trình
  REGISTER_VETC_TAG: 21, // Đăng ký dán thẻ VETC
  TNDS_INSURANCE_RENEWAL: 22, // Gia hạn BH TNDS
  OFF_HOUR_NEW_VEHICLE_REGISTER: 23, // Nộp hồ sơ xe mới (Ngoài giờ HC)
  OFF_HOUR_VEHICLE_INSPECTION: 24, // Đăng kiểm xe (Ngoài giờ HC)
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

export const optionServiceType = [
  {
    value: 1,
    label: 'Tra cứu phạt nguội',
  },
  {
    value: 2,
    label: 'Dán thẻ VETC',
  },
  {
    value: 3,
    label: 'Đóng phí phạt nguội',
  },
  {
    value: 4,
    label: 'Gia hạn bảo hiểm TNDS',
  },
  {
    value: 5,
    label: 'Tư vấn hoán cải',
  },
  {
    value: 6,
    label: 'Đóng phí VETC',
  },
  {
    value: 7,
    label: 'Gia hạn BH thân vỏ',
  },
  {
    value: 8,
    label: 'Bảo dưỡng, sửa chữa xe cơ giới',
  },
  {
    value: 9,
    label: 'Đăng kiểm xe cơ giới',
  },
  {
    value: 10,
    label: 'Nạp tiền ePass',
  },
  {
    value: 11,
    label: 'Cứu hộ xe bị hư hỏng',
  },
  {
    value: 12,
    label: 'Tự động thông báo phạt nguội',
  },
  {
    value: 13,
    label: 'Đăng kiểm xe cũ',
  },
  {
    value: 14,
    label: 'Nộp hồ sơ xe mới',
  },
  {
    value: 15,
    label: 'Đổi mục đích sử dụng, đổi chủ, đổi thông tin hồ sơ',
  },
  {
    value: 16,
    label: 'Thanh toán phí đường bộ',
  },
  {
    value: 17,
    label: 'Đặt lịch tư vấn bảo dưỡng',
  },
  {
    value: 18,
    label: 'Đặt lịch tư vấn bảo hiểm',
  },
  {
    value: 19,
    label: 'Mất giấy đăng kiểm',
  },
  {
    value: 20,
    label: 'Cấp lại tem đăng kiểm',
  },
  {
    value: 21,
    label: 'Tư vấn đăng kiểm xe',
  },
  {
    value: 22,
    label: 'Tư vấn xử lý phạt nguội',
  },
  {
    value: 23,
    label: 'Tư vấn bảo hiểm vật chất xe ô tô',
  },
  {
    value: 24,
    label: 'Tra cứu cảnh báo đăng kiểm',
  },
  {
    value: 25,
    label: 'Hỗ trợ xử lý phạt nguội',
  },
  {
    value: 26,
    label: 'Gia hạn định vị',
  },
  {
    value: 27,
    label: 'Gia hạn phù hiệu xe kinh doanh',
  },
  {
    value: 28,
    label: 'Gia hạn giấy tập huấn',
  },
  {
    value: 29,
    label: 'Gia hạn camera hành trình',
  },
  {
    value: 30,
    label: 'Gia hạn BH TNDS',
  },
  {
    value: 31,
    label: 'Nộp hồ sơ xe mới (Ngoài giờ HC)',
  },
  {
    value: 32,
    label: 'Đăng kiểm xe (Ngoài giờ HC)',
  },
  {
    value: 33,
    label: 'Khám sức khỏe lái xe',
  },
  {
    value: 34,
    label: 'Tư vấn bồi thường bảo hiểm',
  },
];





