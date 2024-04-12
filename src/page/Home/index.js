import React from 'react'
import { banner1, banner2, banner3, banner4, banner5, carImage, motoImage } from '../../assets/img'
import { Carousel, notification } from 'antd'
import './index.scss'
// import { ScheduleIcon } from '../../assets/icons'
import { ReactComponent as ScheduleIcon } from '../../assets/icons/dldk.svg'
import { ReactComponent as CarIcon } from '../../assets/icons/car.svg'
import { ReactComponent as MotoIcon } from '../../assets/icons/moto.svg'
import { ReactComponent as SupportIcon } from '../../assets/icons/support.svg'
import { ReactComponent as ScheduleDetailIcon } from '../../assets/icons/lh.svg'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { PATH } from '../../constants/router'
import { useGlobalContext } from '../../context/GlobalContext'

export default function HomePage() {
  const BANNER = [
    {
      img:banner4,
      link:"https://ttdk.com.vn/kiemtraphatnguoi",

    },
    {
      img:banner5,
      link:"https://vucar.vn/?utm_source=TTDK&utm_medium=Partnership&utm_campaign=Partnership_TTDK",

    },
    {
      img:banner1,
      link:"https://ttdk.partner.saladin.vn/promo",

    },
    {
      img:banner2,
      link:"https://forms.gle/o3iGkaa63Ney5nq1A",

    },
    {
      img:banner3,
      link:"https://ttdk.com.vn/contact-cooperation",

    },
  ]
  const history = useHistory()
  const { handleGetUserPhone } = useGlobalContext();
  const handleRouter = async (path) => {
    handleGetUserPhone().then(data => {
      history.push(path)
    })
  }
  return (
    <div
      className="home-page"
    >
      <Carousel autoplay>
        {BANNER.map((v,index) => (
          <div key={index} className="slide">
            <a href={v.link} target="_blank">
              <img src={v.img} />
            </a>
          </div>
        ))}
      </Carousel>
      <div className="content">
        <div className="left box" onClick={() => handleRouter(PATH.BOOKING)}>
          <ScheduleIcon className="icon"> </ScheduleIcon>
          Đặt lịch đăng kiểm
        </div>
        <div className="right">
          <div className="first-box" onClick={() => handleRouter(PATH.MY_BOOKING_HYSTORY)}>
            <ScheduleDetailIcon className="icon-small" />
            Xem lịch hẹn
          </div>
          <a href="http://zalo.me/3485707806416347108?src=qr&f=1" target="_blank" className="second-box">
            <SupportIcon className="icon-small" />
            Hỗ trợ CSKH
          </a>
        </div>
      </div>
      <div className="second-content">
      <p className="title">Bảo Hiểm</p>
        <a href="https://ttdk.com.vn/gia-han-bao-hiem-tnds?title=Gia%20h%E1%BA%A1n%20b%E1%BA%A3o%20hi%E1%BB%83m%20TNDS" target="_blank" className="right-content">
          <img src={carImage} alt="" srcset="" />
          <div className="small-text mt-2">An toàn trên mọi nẻo đường</div>
          <div className="small-extra-text mt-2">
            <CarIcon className="small-icon" />
            Bảo hiểm TNDS Ô tô
          </div>
        </a>
        <a href="https://ttdk.com.vn/doi-tac-bao-hiem/saladin-bao-hiem-toan-dien" target="_blank" className="right-content">
          <img src={motoImage} alt="" srcset="" />
          <div className="small-text mt-2">Bảo hiểm xe máy trong 5 phút</div>
          <div className="small-extra-text mt-2">
            <MotoIcon className="small-icon" />
            Bảo hiểm TNDS xe máy
          </div>
        </a>
      </div>
    </div>
  )
}
