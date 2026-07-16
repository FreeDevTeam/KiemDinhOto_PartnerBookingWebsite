import React from 'react'
import { Empty } from 'antd'
import './index.scss'

const BasicEmpty = ({ description, mode = 'small', ...props }) => {
  return (
    <div className={`basic-empty-wrapper basic-empty-wrapper-${mode}`}>
      <Empty description={description} {...props} />
    </div>
  )
}

export default BasicEmpty
