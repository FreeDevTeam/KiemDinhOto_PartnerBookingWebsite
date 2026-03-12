
import React from 'react'
import { Row, Col, Radio, Checkbox } from 'antd'
import './StationServicesSelect.scss'

// Hàm detect phương thức thanh toán dựa trên dịch vụ đã chọn
export function detectPaymentCase(stationServices = [], selectedServiceIds = []) {
  if (!stationServices.length || !selectedServiceIds.length) return null // Không có dịch vụ nào được chọn
  const selected = stationServices.find(s => s.stationServicesId === selectedServiceIds[0])
  if (!selected) return null
  if (selected.enablePrepay === 1) return 'prepay' // Thanh toán bắt buộc
  if (selected.enableOnlinePayment === 1) return 'onlinePayment' // Thanh toán tùy chọn
  return null // Không cần thanh toán
}

function StationServicesSelect({ stationServices = [], selectedServiceIds = [], onChange }) {
  const selectedServiceId = selectedServiceIds.length > 0 ? selectedServiceIds[0] : null;

  const handleSelectChange = (serviceIds) => {
    if (onChange) {
      // Chỉ lấy dịch vụ đầu tiên (single-select)
      onChange([serviceIds[serviceIds.length - 1]]);
    }
  };

  if (stationServices.length === 0) {
    return null;
  }

  const selectedService = stationServices.find(s => s.stationServicesId === selectedServiceId);
  const selectedPrice = selectedService ? selectedService.servicePrice : 0;

  return (
    <div className="station-services-select">
      <Checkbox.Group value={selectedServiceId ? [selectedServiceId] : []} onChange={handleSelectChange} style={{ width: '100%' }}>
        <Row>
          {stationServices.map((item) => (
            <Col span={24} key={item.stationServicesId} className="mb-2">
              <div className="service-checkbox-wrapper">
                <Checkbox value={item.stationServicesId}>
                  <span className="checkbox-label">{item.serviceName}</span>
                </Checkbox>
              </div>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
      {selectedPrice > 0 && (
        <div className="service-total-price mt-2">
          <b>Tổng tiền dịch vụ:</b> <span>{selectedPrice.toLocaleString('vi-VN')} đ</span>
        </div>
      )}
    </div>
  );
}

export default StationServicesSelect
