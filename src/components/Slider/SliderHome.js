import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Slider from 'react-slick'
import "./SliderHome.scss";
import BasicPlaceholder from './../BasicComponent/BasicPlaceholder';

export const SliderHome = (props) => {
	const settingSilde = {
		dots: true,
		infinite: true,
		speed: 500,
		className: props?.center ? "center":'',
    centerMode: props?.center ? true: false,
    centerPadding: props?.center ? "16px" : '',
		slidesToShow: 1,
		slidesToScroll: 1,
    autoplay:true,
    autoplaySpeed:5000,
		appendDots: dots => (
			<div style={{ bottom: '16px' }}>
				<ul style={{ margin: "0px", paddingLeft: "10px" }} className='d-flex justify-content-start align-items-end'> {dots} </ul>
			</div>
		),
		customPaging: i => (
			<div style={{ height: 20 }}>
				<div className="slick-dot"></div>
			</div>
		)
	};

	const { setting , isLoading,className } = props
	const renderSlider = useMemo(() => {

		if(isLoading) {
			return <div className="slider-container sliderHome" style={{aspectRatio:'358/134'}}>
				<BasicPlaceholder
				></BasicPlaceholder>
			</div>
		}
		return (
			<div className={`slider-container sliderHome ${className}`}>
				<Slider {...settingSilde}>
				{setting  && setting?.map((item,index)=>{
					return(
						props?.hideNewsFromZaloMiniApp ? (
							<div className="slide">
								<img src={item.bannerImageUrl || process.env.PUBLIC_URL + '/default-banner.jpg'} alt={`Slide ${index + 1}`} />
							</div>
						):(
							<a className="slide" href={item.bannerUrl || ''} target={item.bannerUrl ? '_blank' : ''}>
								<img src={item.bannerImageUrl || process.env.PUBLIC_URL + '/default-banner.jpg'} alt={`Slide ${index + 1}`} />
							</a>
						)
					)
				})}
				</Slider>
			</div>
		)
	}, [setting , isLoading])

	return <div>{renderSlider}</div>
}
