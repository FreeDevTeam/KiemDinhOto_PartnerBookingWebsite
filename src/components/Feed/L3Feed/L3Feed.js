import { Empty } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import * as sc from './L3Feed.styled'
import moment from 'moment'
import { DATE_DISPLAY_FORMAT } from '../../../constants/dateFormats'

export const L3Feed = (props) => {
  const { driver,path='/detail-recruitment-post' } = props
  return (
    <>
      {!driver ? (
        <Empty />
      ) : (
        <div style={{maxWidth:'600px'}}>
          <sc.Container className="pointer" type={props.type}>
            <div style={{ textDecoration: 'none' }}>
              <sc.Content>
                <sc.Image src={driver?.stationId?.stationsLogo || process.env.PUBLIC_URL + "logo.png" } alt="" />
                <sc.Info>
                  <sc.Title className='text-normal' title={driver.stationNewsTitle}>{driver.stationNewsTitle}</sc.Title>
                  {/* <sc.Text className='text-normal' dangerouslySetInnerHTML={{ __html:driver.stationNewsContent }}></sc.Text> */}
                  <sc.CreatedAt className='text-very-small'>
                    <p>{moment(driver.createdAt || new Date()).format(DATE_DISPLAY_FORMAT)}</p>
                  </sc.CreatedAt>
                </sc.Info>
              </sc.Content>
            </div>
          </sc.Container>
          {!props.withoutDivider && <sc.Divider type={props.type} />}
        </div>
      )}
    </>
  )
}
