import React, { useState, useEffect } from 'react'
import './homeNew.scss'
import BasicPlaceholder from './../../components/BasicComponent/BasicPlaceholder'
import { L3Feed } from './../../components/Feed/L3Feed/L3Feed'

const HomeRecruitment = ({listNews, setSheetVisible, setDataBtn}) => {
  const handleCardClick = (value) => {
    setSheetVisible(true)
    let data= {
      label: value?.stationNewsTitle,
      link: `${process.env.REACT_APP_DEPLOY_URL}/detail-recruitment-post/${value?.stationNewsId}?isEmbeddedView=true`
    }
    setDataBtn(data)
  }
  const SkeletonLoad=()=>{
    return (
      <div className="sationHome mb-2">
        <div className="sationHome-group">
          <div className="d-flex align-items-center">
            <div className="sationHome-img me-3">
              <BasicPlaceholder
              ></BasicPlaceholder>
            </div>
            <div className="sationHome-info">
              <p className="sationHome-title mb-0">
                <BasicPlaceholder
                  width="70%"
                  height="15px"
                ></BasicPlaceholder>
              </p>
              <p className="mb-0">
                <span>
                  <a className="sationHome-address">
                    <BasicPlaceholder
                      width="90%"
                      height="15px"
                    ></BasicPlaceholder>
                  </a>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="sation-slider">
    {listNews?.length > 0 ?
      (<>
        {listNews.map((item) => (
          <div onClick={()=>handleCardClick(item)}>
            <React.Fragment key={item.stationNewsTitle}>
              <L3Feed driver={item} withoutDivider={true}/>
            </React.Fragment>
          </div>
        ))}
      </>) : 
      (<>
        <SkeletonLoad></SkeletonLoad>
        <SkeletonLoad></SkeletonLoad>
      </>)
    }
    </div>
  )
}

export default HomeRecruitment