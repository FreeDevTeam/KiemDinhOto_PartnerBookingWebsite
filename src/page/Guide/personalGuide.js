import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import './index.scss'

import LoadingPopup from '../../components/LoadingPopup'
import SystemConfigurationsService from '../../services/SystemConfigurationsService'

function PersonalGuide() {
  const history=useHistory()
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false)
  const [personalGuideLink, setPersonalGuideLink] = useState({})

  const fetchData = () => {
    setIsLoading(true);
    SystemConfigurationsService.getPublicSystemConfigurations({}).then((res) => {
      setIsLoading(false);
      setPersonalGuideLink(res?.personalGuideLink)
      if(res?.personalGuideLink){
        window.location.href=res?.personalGuideLink
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

export default PersonalGuide