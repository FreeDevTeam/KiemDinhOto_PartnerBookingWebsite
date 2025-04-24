export const SCHEDULE_TYPE = {
  VEHICLE_INSPECTION: 1, // Đăng kiểm xe định kỳ
  NEW_VEHICLE_INSPECTION: 2, // đăng kiểm xe mới
  CHANGE_REGISTATION: 4, // Đổi mục đích sử dụng, đổi chủ, đổi thông tin hồ sơ
  PAY_ROAD_FEE: 5, // Thanh toán phí đường bộ
  PAY_INSURRANCE_FEE: 6, // Thanh toán phí bảo hiểm
  REGISTER_EPASS_TAG: 2, // Đăng ký dán thẻ EPASS
  REGISTER_NEW_VEHICLE: 3, // nộp hồ sơ xe mới
  CONSULTANT_MAINTENANCE: 7, // Đặt lịch tư vấn bảo dưỡng
  CONSULTANT_INSURANCE: 8, // Đặt lịch tư bảo hiểm vật chất xe ô tô
  CONSULTANT_RENOVATION: 9, // Đặt lịch tư vấn cải tạo xe
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
  CONSULTANT_INSURANCE_COMPENSATION: 25, // Tư vấn bồi thường bảo hiểm
  CONSULTANT_DRIVER_HEALTH: 26, // Tư vấn sức khỏe lái xe
}

export const SCHEDULE_TYPE_MINIAPP = {
  VEHICLE_INSPECTION: 1, // Đăng kiểm xe định kỳ
  REGISTER_NEW_VEHICLE: 3, // nộp hồ sơ xe mới
  CONSULTANT_INSURANCE_COMPENSATION: 25, // Tư vấn bồi thường bảo hiểm
  CHANGE_REGISTATION: 4, // Đổi mục đích sử dụng, đổi chủ, đổi thông tin hồ sơ
  VEHICLE_INSPECTION_CONSULTATION: 12, // Tư vấn đăng kiểm xe định kỳ
  TRAFFIC_FINE_CONSULTATION: 13, // Tư vấn xử lý phạt nguội
  CONSULTANT_MAINTENANCE: 7, // Đặt lịch tư vấn bảo dưỡng
  CONSULTANT_TNDS_INSURANCE: 14, // Tư vấn bảo hiểm TNDS xe ô tô
  CONSULTANT_INSURANCE: 8, // Đặt lịch tư bảo hiểm vật chất xe ô tô
  CONSULTANT_RENOVATION: 9, // Đặt lịch tư vấn cải tạo xe
  LOST_REGISTRATION_PAPER: 10, // Mất giấy đăng kiểm
  REISSUE_INSPECTION_STICKER: 11, // Cấp lại tem đăng kiểm
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
  [SCHEDULE_TYPE.REGISTER_EPASS_TAG]: {
    title: 'Đăng ký dán thẻ EPASS',
    subTitle: 'Dành cho khách hàng muốn dán thẻ thu phí không dừng EPASS cho xe'
  },
  [SCHEDULE_TYPE.REGISTER_NEW_VEHICLE]: {
    title: 'Nộp hồ sơ xe mới',
    subTitle: 'Dành cho khách hàng muốn nộp hồ sơ xe mới trước khi đăng kiểm'
  },
  [SCHEDULE_TYPE.CONSULTANT_MAINTENANCE]: {
    title: 'Tư vấn bảo dưỡng',
    subTitle: 'Dành cho khách hàng muốn được tư vấn bảo dưỡng xe định kỳ hoặc theo nhu cầu'
  },
  [SCHEDULE_TYPE.CONSULTANT_INSURANCE]: {
    title: 'Tư vấn bảo hiểm vật chất xe ô tô',
    subTitle: 'Dành cho khách hàng cần tư vấn về các loại bảo hiểm xe ô tô'
  },
  [SCHEDULE_TYPE.CONSULTANT_RENOVATION]: {
    title: 'Tư vấn cải tạo xe',
    subTitle: 'Dành cho khách hàng muốn cải tạo kết cấu phương tiện'
  },
  [SCHEDULE_TYPE.LOST_REGISTRATION_PAPER]: {
    title: 'Mất giấy đăng kiểm',
    subTitle: 'Dành cho khách hàng bị mất giấy đăng kiểm và cần hỗ trợ cấp lại'
  },
  [SCHEDULE_TYPE.REISSUE_INSPECTION_STICKER]: {
    title: 'Cấp lại tem đăng kiểm',
    subTitle: 'Dành cho khách hàng cần xin cấp lại tem đăng kiểm đã mất hoặc hư hỏng'
  },
  [SCHEDULE_TYPE.VEHICLE_INSPECTION_CONSULTATION]: {
    title: 'Tư vấn đăng kiểm xe định kỳ',
    subTitle: 'Dành cho khách hàng muốn được tư vấn trước khi đưa xe đi đăng kiểm'
  },
  [SCHEDULE_TYPE.TRAFFIC_FINE_CONSULTATION]: {
    title: 'Tư vấn phạt nguội',
    subTitle: 'Dành cho khách hàng cần tư vấn xử lý các lỗi vi phạm phạt nguội'
  },
  [SCHEDULE_TYPE.CONSULTANT_TNDS_INSURANCE]: {
    title: 'Tư vấn bảo hiểm TNDS xe ô tô',
    subTitle: 'Dành cho khách hàng cần tư vấn bảo hiểm TNDS xe ô tô'
  },
  [SCHEDULE_TYPE.AUTO_NOTIFY_VIOLATION]: {
    title: 'Tra cứu cảnh báo đăng kiểm',
    subTitle: 'Dành cho khách hàng muốn biết xe có vi phạm hoặc bị từ chối đăng kiểm không'
  },
  [SCHEDULE_TYPE.SUPPORT_FINE_RESOLUTION]: {
    title: 'Hỗ trợ xử lý phạt nguội',
    subTitle: 'Dành cho khách hàng cần hỗ trợ giải quyết các lỗi vi phạm giao thông chưa xử lý'
  },
  [SCHEDULE_TYPE.GPS_RENEWAL]: {
    title: 'Gia hạn định vị',
    subTitle: 'Dành cho khách hàng muốn gia hạn dịch vụ định vị GPS trên xe'
  },
  [SCHEDULE_TYPE.BUSINESS_VEHICLE_BADGE_RENEWAL]: {
    title: 'Gia hạn phù hiệu xe KD',
    subTitle: 'Dành cho khách hàng cần gia hạn phù hiệu xe kinh doanh vận tải'
  },
  [SCHEDULE_TYPE.TRAINING_CERTIFICATE_RENEWAL]: {
    title: 'Gia hạn giấy tập huấn',
    subTitle: 'Dành cho tài xế cần gia hạn giấy chứng nhận tập huấn'
  },
  [SCHEDULE_TYPE.DASHCAM_RENEWAL]: {
    title: 'Gia hạn camera hành trình',
    subTitle: 'Dành cho khách hàng muốn gia hạn lưu trữ hoặc dịch vụ camera hành trình'
  },
  [SCHEDULE_TYPE.REGISTER_VETC_TAG]: {
    title: 'Đăng ký dán thẻ VETC',
    subTitle: 'Dành cho khách hàng muốn dán thẻ thu phí không dừng VETC cho xe'
  },
  [SCHEDULE_TYPE.TNDS_INSURANCE_RENEWAL]: {
    title: 'Gia hạn BH TNDS',
    subTitle: 'Dành cho khách hàng muốn gia hạn bảo hiểm trách nhiệm dân sự bắt buộc'
  },
  [SCHEDULE_TYPE.OFF_HOUR_NEW_VEHICLE_REGISTER]: {
    title: 'Nộp hồ sơ xe mới (ngoài giờ HC)',
    subTitle: 'Dành cho khách hàng cần hỗ trợ nộp hồ sơ xe mới ngoài giờ hành chính'
  },
  [SCHEDULE_TYPE.OFF_HOUR_VEHICLE_INSPECTION]: {
    title: 'Đăng kiểm xe (ngoài giờ HC)',
    subTitle: 'Dành cho khách hàng cần đăng kiểm xe ngoài giờ hành chính'
  },
  [SCHEDULE_TYPE.CONSULTANT_INSURANCE_COMPENSATION]: {
    title: 'Tư vấn bồi thường bảo hiểm',
    subTitle: 'Dành cho khách hàng cần hỗ trợ làm hồ sơ bồi thường bảo hiểm'
  },
  [SCHEDULE_TYPE.CONSULTANT_DRIVER_HEALTH]: {
    title: 'Tư vấn sức khỏe lái xe',
    subTitle: 'Dành cho tài xế cần tư vấn, khám sức khỏe để lái xe theo quy định'
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





