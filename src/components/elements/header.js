import React from 'react'
import { ReactComponent as QuestionIcon } from '../../assets/Booking-icon/hoi.svg'
import './index.scss'
import { useHistory, useLocation } from 'react-router-dom'
import useWindowDimensions from '../../hooks/window-dimensions';

const StickyHeader = ({
  className,
  icon = <span></span>,
  showArrowLeft = true,
  title = null,
  customBackPath = null,
  onGoBack,
  askQuestionButtonVisible = false,
  askQuestionButtonActionUrl = null,
  breakpoint = 600
}) => {
  const { width } = useWindowDimensions()
  const history = useHistory()
  const headerTitle = title ? title[0].toUpperCase() + title.slice(1) : ''
  const { search } = useLocation();
  const params = new URLSearchParams(search)
  const isEmbeddedView = sessionStorage.getItem('isEmbeddedView')
  if (width < breakpoint){
    return (
      <>
      {
        !isEmbeddedView && (
          <div
            className={`sticky-header ${className || ''}`}
          >
            <div className="sticky-header-title">
              <span className="mx-2" style={{ color : 'white'}}>{headerTitle}</span>
            </div>
            <div
              style={{ visibility: askQuestionButtonVisible ? 'visible' : 'hidden' }}
              className=" cursor style-color"
              onClick={() => {
                history.push(askQuestionButtonActionUrl)
              }}>
              <QuestionIcon width="16px" height="16px" color="#0C42BC" />
            </div>
          </div>
        )
      }
      </>
    )
  }
  return (
    <>
      {!isEmbeddedView && (
        <div
          className={`desktop-header ${className || ''}`}
        >
          <div className="desktop-header-title">
            <span className="mx-2">{headerTitle}</span>
          </div>
          <div
            style={{ visibility: askQuestionButtonVisible ? 'visible' : 'hidden' }}
            className="p-2 cursor style-color"
            onClick={() => {
              history.push(askQuestionButtonActionUrl)
            }}>
            <QuestionIcon width="17px" height="17px" color="#0C42BC" />
          </div>
        </div>
      )}
    </>
    )
}

export const StickyHeaderContainer = (props) => {
  return (
    <div style={{ maxWidth: 600, width: '100%' , margin: 'auto'  }}>
      <StickyHeader {...props} />
    </div>
  )
}

export default StickyHeader;