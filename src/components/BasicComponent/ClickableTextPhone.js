import React, { useState, useCallback } from 'react'
import { useEffect } from 'react'
import { IS_ZALO_MINI_APP } from '../../constants/global'
import { openPhone } from '../../helper/zaloSDK'
export const ClickableTextPhone=({phoneNum,children,className,style}) => {
  const [telTo,setTelTo]=useState([])
  const phoneType = phoneNum?.replace(/[^0-9]/g, "").slice(0, 4)
  const handleGetPhoneType=useCallback(()=>{
    const phone =phoneNum?.replace(/[^0-9]/g, "");
    if(phoneType === '0511'){
      const phoneConvert=phone.replace(phone.slice(0, 11),`${phone.slice(0, 11)+'-'}`)
      setTelTo([phoneConvert?.split("-")])
    }else{
      const phoneConvert=phone.replace(phone.slice(0, 10),`${phone.slice(0, 10)+'-'}`)
      setTelTo([phoneConvert?.split("-")])
    }
  }, [phoneNum, phoneType])
  useEffect(()=>{
    handleGetPhoneType()
  },[handleGetPhoneType])
  const handleClick = async (phone) => {
    if (IS_ZALO_MINI_APP) {
      try {
        await openPhone(phone);
      } catch (error) {
        console.error('Failed to open phone:', error);
      }
    } else {
      window.location.href = `tel:${phone}`;
    }
  }
  return(
    <div style={{gap:'5px',display:'flex',width:'100%'}} >
      {telTo?.length>0 && telTo?.map(item=>(
        item?.map(i=>(
          i&&(
            <div onClick={() => handleClick(i)} className={className} style={{cursor: 'pointer', ...style}}>
              {children}
            </div>
          )
        ))
      ))}
    </div>
  )
}