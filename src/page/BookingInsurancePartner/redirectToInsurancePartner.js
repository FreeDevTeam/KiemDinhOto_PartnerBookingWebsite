import { VEHICLE_COLOR } from '../../constants/global'

const redirectToInsurancePartner = (data,url)=> {
  let _targetUrl = url || 'https://ttdk.partner.saladin.vn/mua-bao-hiem-o-to/thong-tin-xe'
    let _targetRequireData = {
      phone: data?.phone || '',
      name: data.fullnameSchedule || '',
      plate_number: data?.licensePlates, 
      plate_color: '',
    }
    _targetRequireData.plate_number = data.vehicleIdentity || '';

    if(data?.licensePlateColor == 2) {
      _targetRequireData.plate_color=0;
    }else if(data?.licensePlateColor == 3){
      _targetRequireData.plate_color=1;
    }else{
      _targetRequireData.plate_color=2;
    }

    _targetUrl += '?'

    for (let i = 0; i < Object.keys(_targetRequireData).length; i++) {
      const _paramKey = Object.keys(_targetRequireData)[i];
      if (_targetRequireData[_paramKey] !== '') {
        _targetUrl += `&${_paramKey}=${_targetRequireData[_paramKey]}`
      }
    }
  

window.open(_targetUrl, '_blank');
}
export default redirectToInsurancePartner;