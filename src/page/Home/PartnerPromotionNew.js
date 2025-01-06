import React, { useState, useRef } from 'react'
import Slider from 'react-slick'
import './homeNew.scss'
import { useHistory } from 'react-router-dom'
import BasicPlaceholder from './../../components/BasicComponent/BasicPlaceholder'
import CardItem from './CardItemNews'
import { RATIO_IMG } from './../../constants/global'

const PartnerPromotionNew = ({ listNews, setSheetVisible, setDataBtn }) => {
  const history = useHistory()
  const [isDragging, setIsDragging] = useState(false)
  
  const handleCardClick = (value) => {
    setSheetVisible(true)
    let data= {
      label: value?.stationNewsTitle,
      link: `${process.env.REACT_APP_DEPLOY_URL}/detail-partner-post/${value?.stationNewsId}?isEmbeddedView=true`
    }
    setDataBtn(data)
  }

  const SkeletonLoad=()=>{
    return (
      <div className="card item">
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
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className='card-slider news-slider'>
      <div className="slider-navigation d-flex">
      </div>
      {listNews?.length > 0 ? 
        (
          <div className='bodyContain'>
            {
              listNews.map(item => (
                <div className='item'>
                  <CardItem
                    ratio={RATIO_IMG.DEFAULT.value}
                    key={item.stationNewsId}
                    id={item.stationNewsId}
                    title={item.stationNewsTitle}
                    src={item.stationNewsAvatar}
                    showEye={false}
                    handleCardClick={()=>handleCardClick(item)}
                  />
                </div>
              ))
            }
          </div>
        )
         :
         <div className='bodyContain'>
          <SkeletonLoad></SkeletonLoad>
          <SkeletonLoad></SkeletonLoad>
          <SkeletonLoad></SkeletonLoad>
          <SkeletonLoad></SkeletonLoad>
        </div>
      }
    </div>
  )
}

export default PartnerPromotionNew
