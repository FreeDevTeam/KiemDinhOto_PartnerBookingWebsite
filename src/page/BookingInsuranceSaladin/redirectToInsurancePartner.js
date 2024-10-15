import { VEHICLE_COLOR } from '../../constants/global'

const redirectToInsurancePartner = (data)=> {
  let _targetUrl ='https://ttdk.partner.saladin.vn/mua-bao-hiem-o-to/thong-tin-xe'
    let _targetRequireData = {
      phone: data?.phone || '',
      name: data.fullnameSchedule.replaceAll(' ','') || '',
      chassis:data?.chassis || '',
      is_business:'',
      plate_number: data?.licensePlates, 
      email: data?.email, 
      plate_color: '',
    }
    _targetRequireData.plate_number = data.licensePlates || '';

    if(data?.licensePlateColor == 2) {
      _targetRequireData.plate_color=0;
      _targetRequireData.is_business=0;
    }else if(data?.licensePlateColor == 3){
      _targetRequireData.plate_color=1;
      _targetRequireData.is_business=1;
    }else{
      _targetRequireData.plate_color=2;
      _targetRequireData.is_business=0;
    }


    for (let i = 0; i < Object.keys(_targetRequireData).length; i++) {
      const _paramKey = Object.keys(_targetRequireData)[i];
      if (_targetRequireData[_paramKey] !== '') {
        if(i == 0){
          _targetUrl += `?${_paramKey}=${_targetRequireData[_paramKey]}`
        }else{
          _targetUrl += `&${_paramKey}=${_targetRequireData[_paramKey]}`
        }
      }
    }
    window.location.replace(_targetUrl.replace('?&','?'));
}
export default redirectToInsurancePartner;