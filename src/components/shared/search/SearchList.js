import React from 'react'
import { Input, Button } from 'antd'

import './SearchList.scss'
import { ReactComponent as Magnifer } from '../../../assets/icons/Magnifer.svg'

const { Search } = Input

function SearchList(props) {
  const customButton = <Button type="" icon={<Magnifer />} loading={props.loading} disabled={props.disabled} />
  return <Search {...props} className={`${props.className || ''} br-6 SearchList`} enterButton={customButton} />
}

export default SearchList
