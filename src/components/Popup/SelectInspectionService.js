import React, { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { iHaNoiInspectionServices } from '../../constants/Layout2Constants'
import { ReactComponent as ArrowRight } from '../../assets/Booking-icon/ArrowRight.svg'
import { ROUTERS as routes } from '../../router'
import './SelectInspectionService.scss'

const SelectInspectionService = () => {
  const history = useHistory()
  const { isUserLoggedIn } = useSelector((state) => state.authReducer || {})

  const inspectionServices = iHaNoiInspectionServices

  const debouncedNavigation = useMemo(
    () => debounce((service) => {
      if(service?.isAuthNessary===true && !isUserLoggedIn){
        return history.push(routes.login.path)
      }
      return history.push(service.path)
    }, 400),
    [history, isUserLoggedIn]
  );

  const handleSelectService = (service) => {
    debouncedNavigation(service)
  }

  return (
    <div className="select-service-wrapper">
      <div className="select-service-body">
        <div className="askadvice-service">
          <div className="booking-title title-normal" style={{ marginBottom: '20px', marginTop: '40px' }}>Chọn dịch vụ đăng kiểm</div>
          {inspectionServices.map((service) => {
            return (
              <div
                className="askadvice-service-item"
                key={service.id}
                onClick={() => handleSelectService(service)}
              >
                <div className="content-left">
                  <div className="service-icon-box">
                    {service.icon}
                  </div>
                </div>
                <div className="content-right">
                  <div className="title text-normal">{service.title}</div>
                  <div className="subTitle text-small">{service.subTitle}</div>
                </div>
                <div className="content-arrow" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ArrowRight />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SelectInspectionService
