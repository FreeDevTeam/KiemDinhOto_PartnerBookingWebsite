import React, { useEffect, useState, memo } from 'react'
import { Spin, Tag, Input } from 'antd'
import { SCHEDULE_STATUS_3_0, VIHCLE_TYPES_STATE } from '../../constants/global'
import _ from 'lodash'
import BookingService from '../../services/addBookingService'
import { changeTime } from '../../helper/changeTime'
import { useHistory, useLocation } from 'react-router-dom'
import OtherVehicles from './../../assets/icons/otherVehicles.png'
import Car from './../../assets/icons/car.png'
import BasicTablePaging from '../../components/BasicComponent/BasicTablePaging'
import useCommonData from '../../hooks/CommonData'
import useWindowDimensions from '../../hooks/window-dimensions'
import { isMobileDisplaySize } from '../../pageUtililiy/isMobileDisplaySize'
const { TextArea } = Input
const LicensePlateTag = ({ color, licensePlate }) => {
  const plateColor = {
    1: (
      <Tag className="licensePlate-tag white mgl-5" color="#fffff" style={{ color: '#333', borderColor: '#000' }}>
        {licensePlate}
      </Tag>
    ),
    2: (
      <Tag className="licensePlate-tag mgl-5" color="#0050B3">
        {licensePlate}
      </Tag>
    ),
    3: (
      <Tag className="licensePlate-tag mgl-5" color="#FFC53D">
        {licensePlate}
      </Tag>
    ),
    4: (
      <Tag className="licensePlate-tag mgl-5" color="#FF4D4F">
        {licensePlate}
      </Tag>
    )
  }

  return plateColor[color || 1]
}

const ScheduleItem = ({
  licensePlates,
  licensePlateColor,
  dateSchedule,
  stationsName,
  stationsAddress,
  time,
  status,
  vehicleType,
  customerScheduleId,
  scheduleHash,
  scheduleType,
  station,
  chatLinkUserToEmployee
}) => {
  const history = useHistory()
  const { metaData } = useCommonData()

  const RetunStatus = ({ status }) => {
    let el = _.find(SCHEDULE_STATUS_3_0, { value: status })
    return el ? (
      <div style={{ color: el?.color, fontWeight: 500, fontSize: 14, lineHeight: '15.4px', display: 'inline' }} className="ms-1">
        {el?.label}
      </div>
    ) : (
      <></>
    )
  }

  const { width } = useWindowDimensions()
  const navigateToExternalSite = (Url) => {
    if (isMobileDisplaySize(width)){
      window.location.replace(Url)
    }else(
      window.open(Url, '_blank')
    )
  }

  return (
    <div className="scheduleItem cursor" onClick={() => history.push(`/booking-detail/${customerScheduleId}`)}>
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <div className="me-3">
            {vehicleType === VIHCLE_TYPES_STATE.TRAILERS || vehicleType === VIHCLE_TYPES_STATE.OTHER_VEHICLES ? (
              <img src={OtherVehicles} style={{ width: 29, height: 30 }} />
            ) : (
              <img src={Car} style={{ width: 29, height: 30 }} />
            )}
          </div>
          {licensePlates && <LicensePlateTag licensePlate={licensePlates} color={licensePlateColor} />}
        </div>
      </div>
      <div>
        <div className="scheduleItem-info">
          <div className="d-block mt-2 align-items-center">
            <span className="text-small me-1 scheduleItem-lable">Dịch vụ:</span>
            <div className="text-small scheduleItem-value scheduleItem-href d-inline">
              {
                Object.values(metaData?.SCHEDULE_TYPE).find(obj => obj?.scheduleType === scheduleType)?.scheduleTypeName || 'Đăng kiểm xe'
              }
            </div>
          </div>
          <div className="d-block mt-2 align-items-center">
            <span className="text-small me-1 scheduleItem-lable">Ngày giờ hẹn:</span>
            <div className="text-small scheduleItem-value scheduleItem-black d-inline">
              {changeTime(time?.split('-')[0])}{time && '-'} {dateSchedule}
            </div>
          </div>
          <div className="d-block mt-2 d-flex justify-content-between" style={{gap:'5px'}}>
            <span>
              <span className="text-small me-1 scheduleItem-lable">Địa điểm:</span>
              {
                station?.stationsName ? (
                  <a className="text-small scheduleItem-value scheduleItem-href" href="#">
                    <span className="scheduleItem-decoration">{station?.stationsName}</span>
                  </a>
                ) : (
                  <span className="">-</span>
                )
              }
              
            </span>
            {chatLinkUserToEmployee && 
              <span className="text-small me-1 scheduleItem-lable wrap" onClick={(e) => {
                e.stopPropagation();
                navigateToExternalSite(chatLinkUserToEmployee)
              }}>
                <span className="text-very-small btn-chat">Chat</span>
              </span>
            }
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between w-100">
        <span className="mb-0">
          Trạng thái:
          <RetunStatus status={status} />
        </span>
      </div>
    </div>
  )
}

function BookingHistoryList({ loading, setLoading, phoneNumber }) {
  const location = useLocation();
  const DEFAULT_FILTER = {
    skip: 0,
    limit: 20,
    filter: {
      phone: phoneNumber
    },
    order: {
      key: "createdAt",
      value: "desc"
    }
  }

  const history = useHistory()
  const [filter, setFilter] = useState(DEFAULT_FILTER)
  const [dataList, setDataList] = useState({ data: [], total: 0 })
  const [resultAfterAPIText, setResultAfterAPIText] = useState('')
  useEffect(() => {
    if (phoneNumber) {
      getData({
        ...filter,
        filter: {
          phone: phoneNumber
        }
      })
    }
  }, [phoneNumber])

  function getData(filter) {
    setLoading(true)
    BookingService.getBookingHistory(filter).then((result) => {
      const { isSuccess, message, data } = result
      setLoading(false)
      if (!isSuccess || !data) {
        setResultAfterAPIText("Không có dữ liệu")
        return
      } else {
        if(data?.total === 0) {
          setResultAfterAPIText("Bạn chưa có lịch hẹn nào")
        }
        setDataList(data)
      }
    }).catch((err) => {
      setLoading(false)
      setResultAfterAPIText("Không có dữ liệu")
    })
  }

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Spin />
      </div>
    )
  }
  const handleChangePage = (pageNum) => {
    // setCurrentPage(pageNum)
    const skip = (pageNum -1) * filter.limit
    const newFilter = {
      ...filter,
      skip
    }
    setFilter(newFilter)
    getData(newFilter)
  }
  return (
    <div>
      <div>
        {dataList?.data&&dataList?.data?.length>0 ? dataList?.data.map((element, index) => {
          return (
            <ScheduleItem
              key={index}
              {...{
                ...element,
                status: element?.CustomerScheduleStatus
              }}
              scheduleHash={element.scheduleHash}
            />
          )
        }) :(
            <div className='d-flex justify-content-center align-items-center'>
              {resultAfterAPIText}
          </div>
        )
      }
      </div>
      <div className="" style={{ maxWidth: 600, margin: 'auto', width: '100%', marginBottom: '60px' }}>
      {dataList?.data?.length > 0 && (
        <div className="" style={{ maxWidth: 600, margin: 'auto', width: '100%',marginBottom:'60px' }}>
          <>
            <BasicTablePaging handlePaginations={handleChangePage} count={dataList?.data?.length < filter.limit}></BasicTablePaging>
          </>
        </div>
      )}
      </div>
    </div>
  )
}

export default memo(BookingHistoryList)
