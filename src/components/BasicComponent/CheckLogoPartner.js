import React from 'react'
import { ReactComponent as ZaloIcon } from "./../../assets/icons/Zalo.svg"
import { ReactComponent as SaladinIcon } from "./../../assets/icons/Saladin.svg"
import { ReactComponent as MomoIcon } from './../../assets/icons/Momo.svg'
import { ReactComponent as MICIcon } from './../../assets/icons/mic.svg'

export const TTDK_PARTNER = [
  {
    name:'zalo',
    icon:<ZaloIcon />
  },
  {
    name:'saladin',
    icon:<SaladinIcon />
  },
  {
    name:'momo',
    icon:<MomoIcon />
  },
  {
    name:'dvbhmic',
    icon:(
      <div style={{ height: '100%', width: '100%',display:'flex',alignItems:'center'}}><img src="./MIC.png" alt="" /></div>
    )
  },
]