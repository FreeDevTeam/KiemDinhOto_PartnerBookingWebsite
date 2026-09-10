import React from 'react'
import { Drawer } from 'antd'
import './index.scss'
import useWindowDimensions from '../../hooks/window-dimensions'
import BidvCancelIcon from '../../assets/icons/icon_ht_cancel.png'

const BaseBottomSheet = (props) => {
  const {
    isOpen,
    onClose,
    title = ' ',
    drawerClassName = '',
    drawerHeight = 'auto',
    closeIcon = <img src={BidvCancelIcon} className="bidv-bottom-sheet-close-icon" alt="Đóng" style={{ width: 40, height: 40, objectFit: 'contain', display: 'block' }} />,
    children
  } = props

  const { width } = useWindowDimensions()

  return (
    <Drawer
      title={<span className="bottom-sheet-title">{title}</span>}
      placement="bottom"
      open={isOpen}
      onClose={onClose}
      destroyOnClose
      closeIcon={null}
      extra={
        <div onClick={onClose} style={{ cursor: 'pointer' }}>
          {closeIcon}
        </div>
      }
      height={drawerHeight}
      className={`popup-booking base-bottom-sheet ${drawerClassName}`}
      styles={{
        wrapper: {
          maxWidth: '600px',
          margin: '0 auto',
          width: '100%',
          boxShadow: 'none'
        },
        content: {
          borderRadius: '24px 24px 0 0',
          overflow: 'hidden',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '45dvh',
          maxHeight: '80dvh'
        },
        header: {
          borderBottom: 'none',
          padding: '24px 16px 12px',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          flex: '0 0 auto'
        },
        body: {
          padding: '0 16px 24px',
          background: '#ffffff',
          overflowY: 'auto',
          flex: '1 1 auto'
        }
      }}
    >
      {children}
    </Drawer>
  )
}

export default BaseBottomSheet
