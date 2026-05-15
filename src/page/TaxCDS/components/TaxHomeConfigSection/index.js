import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { getHomePageConfigCache } from '../../../../helper/getHomePageConfigCache'
import { handleDirect } from '../../../../components/Slider/SliderHome'
import './index.scss'

const TaxHomeConfigSection = ({ title, category }) => {
  const history = useHistory()
  const [items, setItems] = useState([])

  useEffect(() => {
    getHomePageConfigCache('ALL').then((data) => {
      const list = Array.isArray(data) ? data : []

      const nextItems = list
        .filter((item) => Number(item?.configCategory) === Number(category))
        .filter((item) => !item?.isHidden && !item?.isDeleted)
        .sort((a, b) => Number(a?.displayPosition || 0) - Number(b?.displayPosition || 0))

      setItems(nextItems)
    })
  }, [category])

  const handleClick = (item) => {
    const link = item?.linkNavigation || item?.link

    if (!link) return

    handleDirect(link, item?.navigationType, history)
  }

  if (!items.length) return null

  return (
    <div className="tax-home-config-section">
      <div className="tax-home-config-section__card">
        <div className="tax-home-config-section__title">
          {title}
        </div>

        <div className="tax-home-config-section__grid">
          {items.map((item) => (
            <button
              key={item?.stationHomePageConfigId || item?.targetId || item?.title}
              type="button"
              className="tax-home-config-section__item"
              onClick={() => handleClick(item)}
            >
              <div className="tax-home-config-section__icon">
                {item?.imageUrl && (
                  <img src={item.imageUrl} alt={item?.title || ''} />
                )}
              </div>

              <div
                className="tax-home-config-section__label"
                dangerouslySetInnerHTML={{ __html: item?.title || item?.label || '' }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TaxHomeConfigSection