export const USER_VEHICLE_ERROR = {
  DUPLICATE_IDENTITY:'Biển số xe đã được đăng ký bởi tài khoản khác',
  DUPLICATE_VEHICLE: 'Biển số xe đã được đăng ký, vui lòng kiểm tra lại danh sách phương tiện',
  VEHICLE_NOT_FOUND: 'Không tìm thấy thông tin phương tiện',
  INVALID_PLATE_NUMBER: 'Biển số xe không hợp lệ',
  MAX_OWNER_VEHICLE: 'Vượt quá số lượng xe cho phép',
  INVALID_VEHICLE_CERTIFICATE: 'Số seri GCN không trùng khớp với BSX',
  WRONG_VEHICLE_TYPE: 'Sai loại phương tiện',
  WRONG_SUB_CATEGORY : 'Phân loại xe không đúng',
  INVALID_VEHICLE_EXPIRATION_DATE:'Ngày hết hạn không hợp lệ'
}

export const SCHEDULE_ERROR = {
  INVALID_STATION: 'Thiếu thông tin trạm',
  INVALID_BOOKING_CONFIG: 'Lịch hẹn đã đầy',
  MAX_OWNER_VEHICLE: 'Vượt quá số lượng xe cho phép',
  BOOKING_MAX_LIMITED: 'Danh sách lịch hẹn đã đầy. Vui lòng chọn trung tâm khác hoặc thời gian khác',
  UNCONFIRMED_BOOKING_EXISTED: 'Phương tiện của quý khách đã có lịch hẹn. Vui lòng kiểm tra lại!',
  INVALID_DATE: 'Ngày hẹn không hợp lệ',
  INVALID_BOOKING_DATE:'Ngày hẹn không hợp lệ',
  BLOCK_USER_BOOKING_SCHEDULE: 'Người dùng bị khóa đặt lịch',
  BOOKING_ON_DAY_OFF: 'Ngày hẹn không đúng',
  BOOKING_ON_SUNDAY: 'Sai thông tin ngày hẹn',
  INVALID_PLATE_NUMBER: 'Biển số xe không hợp lệ',
  INVALID_REQUEST: 'Đặt lịch thất bại',
  MAX_LIMIT_SCHEDULE_BY_USER: 'Số lượng lịch hẹn của người dùng quá giới hạn',
  MAX_LIMIT_SCHEDULE_BY_PHONE: 'Số lượng lịch hẹn của số điện thoại quá giới hạn ',
  MAX_LIMIT_SCHEDULE_BY_PLATE_NUMBER: 'Số lượng lịch hẹn của biển số xe quá giới hạn',
  ALREADY_CANCEL: 'Lịch hẹn đã hủy trước đó',
  BOOKING_MAX_LIMITED_BY_CONFIG: 'Lịch hẹn không được vượt giới hạn',
  BOOKING_MAX_LIMITED: 'Danh sách lịch hẹn đã đầy. Vui lòng chọn trung tâm khác hoặc thời gian khác',
  CONFIRMED_BY_STATION_STAFF: 'Đã được trung tâm xác nhận',
  EARLY_BOOKING: ' Không được đặt lịch hẹn sớm hơn 10 ngày so với ngày hết hạn',
  BOOKING_ON_TODAY: 'Đã được trung tâm xác nhận',
  INVALID_VEHICLE_CERTIFICATE: 'Số seri GCN không trùng khớp với BSX',
  BLOCK_BOOKING_BY_PHONE: 'Số điện thoại bị khóa tính năng đặt lịch. Vui lòng liên hệ CSKH để được hỗ trợ',
  BLOCK_BOOKING_BY_LICENSE_PLATE: 'Biển số xe đã bị khóa do đặt lịch quá nhiều',
  MAX_LIMIT_SCHEDULE_BY_VEHICLE_COUNT: 'Số lượng lịch vượt quá giới hạn',
  STATION_NOT_ACCEPT_VEHICLE:'trạm không nhận đặt lịch cho xe trên 16 chỗ',
  STATION_NOT_ACCEPTED_VEHICLE_TYPE:'Trạm không nhận đặt lịch cho loại xe này. Vui lòng chọn trạm khác.',

}

export const LOGIN_ERROR = {
  UNKNOWN_ERROR: 'Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại',
  INVALID_USER: 'Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại',
  BAD_REQUEST: 'Đăng nhập không thành công',
  NOT_VERIFIED_PHONE_NUMBER: 'Số điện thoại chưa được xác thực',
  PHONE_NUMBER_NOT_REGISTERED: 'Tài khoản không tồn tại. Vui lòng sử dụng số điện thoại để đăng ký tài khoản'
}

export const PAYMENT_ERROR = {
  RECEIPT_NOT_FOUND: 'Hoá đơn không tồn tại',
  WRONG_PAYMENT_METHOD: 'Phương thức thanh toán không hợp lệ',
  INVALID_ORDER: 'Hoá đơn không hợp lệ',
}
export const OTP_ERROR = {
  OTP_LOCKED_MESSAGE: 'SĐT của quý khách đã bị khóa.<br> Vui lòng liên hệ CSKH để được hỗ trợ',//Lỗi 1 SDT vượt quá 10 OTP trong suốt quá trình sử dụng trong 3 tháng.
  IP_REQ_LIMIT_EXCEEDED:'SĐT của quý khách đã bị khóa.<br> Vui lòng liên hệ CSKH để được hỗ trợ' //Giới hạn yêu cầu từ địa chỉ IP đã bị vượt quá 100.

}
export const ASK_ERROR = {
  NO_SERVICE_STATION: 'Không có trạm nào mở dịch vụ này. Vui lòng liên hệ CSKH để được hỗ trợ',
  UNCONFIRMED_BOOKING_EXISTED:'Đã có lịch hẹn. Vui lòng kiểm tra lại trong danh sách lịch hẹn'
}
export const CRIMINAL_ERROR = {
  VEHICLE_NOT_REGISTERED: 'Phương tiện chưa được đăng ký.<br> Vui lòng đăng ký hồ sơ phương tiện trước khi thực hiện kiểm tra cảnh báo',
}