import React, { useEffect, useRef, useState } from 'react'
import './index.scss'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { useGlobalContext } from './../../../context/GlobalContext'
import Slider from 'react-slick'
import useWindowDimensions from '../../../hooks/window-dimensions'
import addKeyLocalStorage, { saveClickToLocalStorage } from '../../../helper/localStorage'
import LogService from '../../../services/logService'
import { Card, Row, Col } from 'antd'
import Title from 'antd/es/typography/Title'
import { openWebview } from "zmp-sdk/apis";

const CLICK_STORAGE_KEY = 'recordClickData'
const L2FunctionButtonList = (props) => {
  const { handleZaloAuthorize,globalState } = useGlobalContext();
  const intervalRef = useRef(localStorage.getItem(addKeyLocalStorage(CLICK_STORAGE_KEY)))
  const {setSheetVisible, setDataBtn, slider, isDefaultSection}=props
  const { list ,title,className } = props
  const history = useHistory()
  const { handleGetUserPhone } = useGlobalContext()
  const isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1 // ==> dùng cho miniApp
  const handleRouter = async (path, targetId) => {
    if (targetId) {
      saveClickToLocalStorage({ localStorageKey: CLICK_STORAGE_KEY, targetId })
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          submitClickData()
        }, 30 * 1000) // 30s
      }
    }

    history.push(path)
  }
  const { height, width } = useWindowDimensions()
  const smallMobile = width <= 420
  const sliderRef = useRef(null)
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: smallMobile ? 3 : 4,
    slidesToScroll: smallMobile ? 3 : 4,
    rows: 2,
  }
  const handleClick = async (element) => {
    if (element?.targetId) {
      saveClickToLocalStorage({ localStorageKey: CLICK_STORAGE_KEY, targetId: element?.targetId })
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          submitClickData()
        }, 30 * 1000) // 30s
      }
    }

    const link = element?.link || element?.linkNavigation
    const isZaloLink = link.includes('zalo.me')
    if (isZaloLink) {
      if (isZaloApp) {
        await setSheetVisible(false)
        await openWebview({ url: link, config: { style: "normal" } });
      } else {
        await setSheetVisible(false)
        window.open(link, '_blank')
      }
    } else {
      await setSheetVisible(true)
      await setDataBtn(element)
    }
  }
  const submitClickData = async () => {
    const clickData = JSON.parse(localStorage.getItem(addKeyLocalStorage(CLICK_STORAGE_KEY))) || []
    if (!clickData || Object.keys(clickData).length === 0) return
    const clicks = Object.entries(clickData).map(([key, value]) => ({
      ...value
    }))

    const payload = {
      listClick: clicks.map((click) => ({
        targetId: click.targetId,
        totalClick: click.count
      }))
    }

    try {
      const { issSuccess } = await LogService.recordClick(payload)
      if (issSuccess) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        localStorage.removeItem(addKeyLocalStorage(CLICK_STORAGE_KEY))
      }
    } catch (err) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }
  const renderBtns = () => {
    return (
      <div style={{marginBottom:'1rem'}}>
        <div className='text-large title-homelayout' style={{padding:'0 10px'}}>{title}</div>
        {slider ? (
          <div className={`card-slider layout1-btn-booking-section slider-list-btn ${className}`}>
            <Slider ref={sliderRef} {...settings}>
              {list.map((element, key) => {
                if (element?.unOpen) {
                  return (
                    <div
                      key={key}
                      className="layout1-btn-booking-item"
                      onClick={() => (element?.disable ? '' : handleRouter(element?.link || element?.linkNavigation, element?.targetId))}>
                      {element.icon ? (
                        element.icon
                      ) : (
                        <img
                          style={{ width: '40px', height: '40px', borderRadius: '4px', display: 'inline' }}
                          className="mb-2"
                          src={element?.imageUrl}
                          alt=""
                        />
                      )}
                      <div
                        className="text-small"
                        style={{ height: 44, transform: 'translateY(-50%)', marginTop: '1rem' }}
                        dangerouslySetInnerHTML={{ __html: element.label || element?.title }}></div>
                    </div>
                  )
                } else {
                  return (
                    <div key={key} className="layout1-btn-booking-item" onClick={() => (element?.disable ? '' : handleClick(element))}>
                      {element.icon ? (
                        element.icon
                      ) : (
                        <img
                          style={{ width: '40px', height: '40px', borderRadius: '4px', display: 'inline' }}
                          className="mb-2"
                          src={element?.imageUrl}
                          alt=""
                        />
                      )}
                      <div
                        className="text-small"
                        style={{ height: 44, transform: 'translateY(-50%)', marginTop: '1rem' }}
                        dangerouslySetInnerHTML={{ __html: element.label || element?.title }}></div>
                    </div>
                  )
                }
              })}
            </Slider>
          </div>
        ) : isDefaultSection ? (
          <DefaultCard cardData={list} handleClick={handleClick} handleRouter={handleRouter} />
        ) : (
          <div className={`layout1-btn-booking-section d-flex ai-c ${className}`} style={{ flexWrap: 'wrap' }}>
            {list.map((element, key) => {
              if (element?.unOpen) {
                return (
                  <div
                    key={key}
                    className="layout1-btn-booking-item"
                    onClick={() => (element?.disable ? '' : handleRouter(element?.link || element?.linkNavigation, element?.targetId))}>
                    {element.icon ? (
                      element.icon
                    ) : (
                      <img style={{ width: '40px', height: '40px', borderRadius: '4px' }} className="mb-2" src={element?.imageUrl} alt="" />
                    )}
                    <div
                      className="text-small"
                      style={{ height: 44, transform: 'translateY(-50%)', marginTop: '1rem' }}
                      dangerouslySetInnerHTML={{ __html: element.label || element?.title }}></div>
                  </div>
                )
              } else {
                return (
                  <div key={key} className="layout1-btn-booking-item" onClick={() => (element?.disable ? '' : handleClick(element))}>
                    {element.icon ? (
                      element.icon
                    ) : (
                      <img style={{ width: '40px', height: '40px', borderRadius: '4px' }} className="mb-2" src={element?.imageUrl} alt="" />
                    )}
                    <div
                      className="text-small"
                      style={{ height: 44, transform: 'translateY(-50%)', marginTop: '1rem' }}
                      dangerouslySetInnerHTML={{ __html: element.label || element?.title }}></div>
                  </div>
                )
              }
            })}
          </div>
        )}
      </div>
    )
  }
  return (
    <>
      <div> {renderBtns()}</div>
    </>
  )
}
export default L2FunctionButtonList

const DefaultCard = ({ cardData = [], handleRouter, handleClick }) => {
  return (
    <div
      className="ant-row d-flex mb-4"
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        rowGap: 16,
        columnGap: 16,
        marginLeft: 16,
        marginRight: 16
      }}>
      <Row gutter={[16, 16]}>
        {cardData.map((item, index) => (
          <Col
            xs={12}
            sm={12}
            md={12}
            lg={12}
            key={index}
            onClick={() =>
              item?.disable ? '' : item?.unOpen ? handleRouter(item?.link || item?.linkNavigation, item?.targetId) : handleClick(item)
            }>
            <Card bordered hoverable style={{ borderRadius: 12, textAlign: 'center', height: '100%' }} bodyStyle={{ padding: 20 }}>
              <div style={{ marginBottom: 12 }}>
                { item?.icon ? item.icon : <img style={{ width: '40px', height: '40px', borderRadius: '4px' }} className="mb-2" src={item?.imageUrl} alt="" />}
              </div>
              <Title level={5}>{item.title || item.label }</Title>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
