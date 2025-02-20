import React, { useState, useRef } from 'react'
import Slider from 'react-slick'
import './homeNew.scss'
import { useHistory } from 'react-router-dom'
import BasicPlaceholder from './../../components/BasicComponent/BasicPlaceholder'
import CardItem from './CardItemNews'

const HomeNew = ({ listNews , linkDirectDetail = "detail-post" , showEye = true, setSheetVisible, setDataBtn}) => {
  const LENGTH_LIST_NO_SLIDER = 1 // nếu chỉ có 1 thì sẽ không dùng slider
  const history = useHistory()
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef(null)

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
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
        link: `${process.env.REACT_APP_DEPLOY_URL}/${linkDirectDetail}/${value?.stationNewsId}?isEmbeddedView=true`
      }
      setDataBtn(data)
    }
  }

  const SkeletonLoad=()=>{
    return (
      <div className="card">
        <div className="group-wrappe w-100">
          <div className="group">
            <div className='news-img'>
              <BasicPlaceholder
              ></BasicPlaceholder>
            </div>
            <div className="overlap-group">
              <div className="frame">
                <p className="card-title">
                  <BasicPlaceholder
                  ></BasicPlaceholder>
                </p>
              </div>
              <div className="d-flex justify-content-between mb-2 mobile">
                <BasicPlaceholder
                  height="15px"
                ></BasicPlaceholder>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="card-slider news-slider">
      <div className="slider-navigation d-flex">
      </div>
      {listNews?.length > 0 ? 
        (
          listNews.length === LENGTH_LIST_NO_SLIDER ? 
          <CardItem
            key={listNews[0].stationNewsId}
            id={listNews[0].stationNewsId}
            title={listNews[0].stationNewsTitle}
            date={listNews[0].createdAt}
            views={listNews[0].totalViewed}
            src={listNews[0].stationNewsAvatar}
            handleCardClick={handleCardClick}
            showEye={showEye}
          /> :
          (<Slider ref={sliderRef} {...settings}>
            {listNews?.map((item) => (
              <CardItem
                key={item.stationNewsId}
                id={item.stationNewsId}
                title={item.stationNewsTitle}
                date={item.createdAt}
                views={item.totalViewed}
                src={item.stationNewsAvatar}
                handleCardClick={()=>handleCardClick(item)}
                showEye={showEye}
              />
            ))}
          </Slider>)
        ) :
        <Slider ref={sliderRef} {...settings}>
          <SkeletonLoad></SkeletonLoad>
          <SkeletonLoad></SkeletonLoad>
          <SkeletonLoad></SkeletonLoad>
        </Slider>
      }
    </div>
  )
}


export default HomeNew
