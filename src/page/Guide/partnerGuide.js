import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import './index.scss'

import LoadingPopup from '../../components/LoadingPopup'
import SystemConfigurationsService from '../../services/SystemConfigurationsService'

function PartnerGuide() {
  const history=useHistory()
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false)
  const [partnerGuideLink, setPartnerGuideLink] = useState({})

  const fetchData = () => {
    setIsLoading(true);
    SystemConfigurationsService.getPublicSystemConfigurations({}).then((res) => {
      setIsLoading(false);
      setPartnerGuideLink(res?.partnerGuideLink)
      if(res?.partnerGuideLink){
        window.location.href=res?.partnerGuideLink
      }
    })
  }
  useEffect(() => {
    console.log('chajy');
    fetchData()
  }, []);

  if (isLoading) {
    return (
        <div className="criminal-loading">
          <LoadingPopup type="content"/>
      </div>
    )
  }


  return (
    <>
      
    </>
  )
}

export default PartnerGuide
