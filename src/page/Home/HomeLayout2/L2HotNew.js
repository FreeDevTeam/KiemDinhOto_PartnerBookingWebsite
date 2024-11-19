import React, { useState, useRef } from 'react'
import Slider from 'react-slick'
import './../homeNew.scss'
import { AspectRatio } from 'react-aspect-ratio'
import { useHistory } from 'react-router-dom'
import { Button } from 'antd'
import useWindowDimensions from './../../../hooks/window-dimensions'
import { RATIO_IMG } from './../../../constants/global'

const L2HotNew = ({ hotNew, setSheetVisible, setDataBtn }) => {
  const history = useHistory()
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef(null)
  const { width } = useWindowDimensions()

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: width < 980 ? 1 : 2,
    slidesToScroll: 1,
    rows: 1,
    beforeChange: () => setIsDragging(true),
    afterChange: () => setIsDragging(false)
  }

  const handleCardClick = (value) => {
    if (!isDragging) {
      setSheetVisible(true)
      let data= {
        label: value?.stationNewsTitle,
        link: `${process.env.REACT_APP_DEPLOY_URL}/detail-post/${value?.stationNewsId}`
      }
      setDataBtn(data)
    }
  }

  return (
    <div className="card-slider news-slider">
      <div className="slider-navigation d-flex">
      </div>
      <Slider ref={sliderRef} {...settings}>
        {hotNew?.map((item) => (
          <CardItem
            key={item.stationNewsId}
            id={item.stationNewsId}
            title={item.stationNewsTitle}
            content={item.stationNewsContent}
            date={item.createdAt}
            views={item.totalViewed}
            src={item.stationNewsAvatar}
            handleCardClick={()=>handleCardClick(item)}
          />
        ))}
      </Slider>
    </div>
  )
}

const CardItem = ({ title, src, id, handleCardClick,content }) => {
  return (
    <div className="card">
      <div className="group-wrappe w-100">
        <div className="group">
          <AspectRatio ratio={RATIO_IMG.DEFAULT.value} style={{ maxWidth: '100%' }}>
            <img src={src} className="unsplash" alt="" />
          </AspectRatio>
          <div className="overlap-group layout2-hot-new-group">
            <div className="frame">
              <p className="card-title layout2-hot-new-title" onClick={() => handleCardClick(id)}>
                {title}
              </p>
            </div>
            <div>
            <Button
              className="login__button w-100 custom-df-btn custom-btn layout2-hot-new-detail-btn"
              onClick={() => handleCardClick(id)}
              size="normal">
              Xem ngay
            </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default L2HotNew
