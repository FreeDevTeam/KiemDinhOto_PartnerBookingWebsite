import React, { useState, useRef } from 'react'
import './homeNew.scss'
import { AspectRatio } from 'react-aspect-ratio'
import { EyeOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import moment from 'moment'
import { DATE_DISPLAY_FORMAT } from './../../constants/dateFormats'
import { RATIO_IMG } from './../../constants/global'

const CardItem = ({ title, date, views, src, id, handleCardClick, showEye = true,ratio }) => {
  const convertToDisplayViewCounter = (view) => {
    let numberViews = 0
    if (view >= 10000) {
      numberViews = (views / 1000).toFixed(1) + 'K'
      return numberViews
    }
    if (view < 10000) {
      return view
    }
  }
  return (
    <div className="card">
      <div className="group-wrappe w-100">
        <div className="group">
          <div className='news-img'>
            <AspectRatio ratio={ratio || RATIO_IMG.DEFAULT.value} style={{ maxWidth: '100%' }}>
              <img src={src} className="unsplash" alt="" />
            </AspectRatio>
          </div>
          <div className="overlap-group">
            <div className="frame">
              <p className="card-title" onClick={() => handleCardClick(id)}>
                {title}
              </p>
            </div>
            {date && (
              <div className="d-flex justify-content-between mb-2 mobile">
                <div className="div new-date">
                  <div className="card-date">{moment(date).format(DATE_DISPLAY_FORMAT)}</div>
                </div>
                {
                  showEye && <div className="d-flex align-items-center">
                    <EyeOutlined style={{ color: 'var(--gray-color)' }} />
                    <div className="frame-3 ms-1">
                      <div className="card-view">{convertToDisplayViewCounter(views)}</div>
                    </div>
                  </div>
                }

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardItem
