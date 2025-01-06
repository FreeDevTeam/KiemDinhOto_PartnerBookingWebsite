import React, { useEffect, useRef, useState } from 'react'
import Slider from 'react-slick'
import './homePartner.scss'
import BasicPlaceholder from './../../components/BasicComponent/BasicPlaceholder';
import { PARTNER } from './../../constants/partner';
import { Link } from 'react-router-dom';
import SupportServices from './../../services/addBookingService'
const HomePartner = ({ setSheetVisible, setDataBtn }) => {
  const sliderRef = useRef(null)
  var total = Object.values(PARTNER).length,
    rand = Math.floor( Math.random() * total )
  const [numberSlide,setNumberSlide]= useState(4)
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: numberSlide,
    slidesToScroll: 1,
    rows: 1,
    autoplay:true,
    autoplaySpeed:5000,
    initialSlide:rand,
  }
  let arr=[]
  Object.values(PARTNER).map(item=>{
    arr.push(item)
  })
  const [partner,setPartner]=useState(arr)
  const [paramsFilter, setParamsFilter] = useState({
    filter: {
      configCategory:3
    },
    skip: 0,
    limit: 20,
});
  const getHomePageConfig = async (params) => {
    SupportServices.getList(params).then((result) => {
      const { statusCode, data, message } = result;
      if (data?.data?.length > 2) {
        setParamsFilter(params);
        setPartner(data?.data);
        setNumberSlide(data?.data?.length)
        if(data?.data?.length > 4){
          setNumberSlide(4)
        }
      } else {
        let arr=[]
        Object.values(PARTNER).map(item=>{
          arr.push(item)
        })
        setPartner(arr);
      }
    })
  }
  useEffect(() => {
    getHomePageConfig(paramsFilter)
    if(window.innerWidth < 580){
      setNumberSlide(3)
    }
  }, [])
  const handleClickPartner = (value) => {
    setSheetVisible(true)
    let data= {
      label: value?.title,
      link: (value?.linkNavigation)?.slice(0, 7)?.includes("http") ? value?.linkNavigation : `${process.env.REACT_APP_DEPLOY_URL}${value?.linkNavigation}`
    }
    setDataBtn(data)
  }
  return (
    <div className="card-slider partner-slider">
      <div className="slider-navigation d-flex">
      </div>
      <Slider ref={sliderRef} {...settings}>
        {partner?.length > 0 && partner?.map((item) => (
          <div key={item.name}>
            <div className="group-wrappe w-100">
              <div>
                {item ? (
                  <>
                     <div> {/*onClick={()=>handleClickPartner(item)}> */}
                        {item.partnerBanner}
                        <ItemsRender img={item.image ||item?.imageUrl} title={item.title}/>
                    </div>
                  </>
                ): 
                <div className='skeleton'>
                  <BasicPlaceholder
                  ></BasicPlaceholder>
                </div>
                }
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}
export default HomePartner

function ItemsRender({img, title}) {
  return (
    <div className='d-flex justify-content-center align-items-center flex-column'>
        <img className='partner-img border' src={img} />
        <span className='text-center pt-1 text-small' style={{ whiteSpace: 'pre-line' }}>{title}</span>
    </div>
  )
}