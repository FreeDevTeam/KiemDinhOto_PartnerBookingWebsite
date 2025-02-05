import React, { useEffect, useState } from 'react'
import "./index.scss";
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Input } from 'antd';

const BasicTablePaging = ({handlePaginations,count=false,firstPage}) => {
    const Enter = 13
    const [prevDisabled, setPrevDisabled] = useState(true)
    const [nextDisabled, setNextDisabled] = useState()
    const [value, setValue] = useState(1)

    const onKeyDown = (e) =>{
      let value=Number(e.target.value)
      if(e.keyCode === Enter){  // click vào phím enter
        if(value < 1){
          handlePaginations(1)
          setValue(1)
        }else{
          handlePaginations(value)
        }
      }
    }

    const moveToNextPage = () =>{
      if(value > 9999999){
        return null
      }
      if(count){
        return null
      }
      handlePaginations(value + 1)
      setPrevDisabled(false)
      setValue(value + 1)
    }

    const moveToPreviousPage = () =>{
      if(value < 2){
        return null
      }
      setValue(value - 1)
      handlePaginations(value - 1)
    }

    const handleChange = (value) =>{
      let newValue = Number(value.replace(/[^0-9]/g, ""));
      setValue(newValue)
      if(newValue <= 1){
        setPrevDisabled(true)
      }else{
        setPrevDisabled(false)
      }
    }
    useEffect(()=>{
      setNextDisabled(count)
    },[count])
    useEffect(()=>{
      setValue(1)
    },[firstPage])
    useEffect(()=>{
      if(value <= 1){
      setPrevDisabled(true)
      }
    },[value])
  return (
    <div className="pagination react-paginate separated-pagination pagination-sm justify-content-center pr-3 mt-1 mb-5">
      <div className={`prev-item position-relative ${prevDisabled ? 'disable-item' : 'pointer'}`}>
        <span onClick={() =>moveToPreviousPage()} className='bg_left'><LeftOutlined /></span>
      </div>
      <div>
        <Input
          className='input_paging'
          value={value}
          onKeyDown={(e) => onKeyDown(e)}
          onChange={(e) => { handleChange(e.target.value) }}
          />
      </div>
      <div className={`next-item position-relative ${nextDisabled ? 'disable-item' : 'pointer'}`}>
          <span onClick={() =>moveToNextPage()} className='bg_right'><RightOutlined /></span>
      </div>
    </div>
  )
}

export default BasicTablePaging