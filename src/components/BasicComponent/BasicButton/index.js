import React from 'react'
import { Button } from 'antd'
import './index.scss'

/**
 * Nút dùng chung.
 * type: 'primary' | 'default'
 */
function BasicButton({ type = 'primary', title, children, onClick, className = '', block = true, ...rest }) {
  return (
    <Button
      type={type === 'primary' ? 'primary' : 'default'}
      size="large"
      block={block}
      className={`basic-button basic-button-${type} ${className}`}
      onClick={onClick}
      {...rest}>
      {title || children}
    </Button>
  )
}

export default BasicButton
