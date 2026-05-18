import React, { useRef, useState } from 'react'
import DeleteIcon from '../../../../../assets/img/tax-delete-icon.png'
import './index.scss'

const MstResultList = ({
  results = [],
  onRegister,
  swipeToDelete = false,
  onDelete,
}) => {
  const [openedKey, setOpenedKey] = useState('')
  const startXRef = useRef(0)

  if (!results.length) return null

  const getItemKey = (item, index) => `${item.taxCode}-${index}`

  const handlePointerDown = (event) => {
    if (!swipeToDelete) return
    startXRef.current = event.clientX || 0
  }

  const handlePointerUp = (event, key) => {
    if (!swipeToDelete) return

    const endX = event.clientX || 0
    const diffX = endX - startXRef.current

    if (diffX < -40) {
      setOpenedKey(key)
      return
    }

    if (diffX > 40) {
      setOpenedKey('')
    }
  }

  const handleDelete = (item) => {
    if (onDelete) {
      onDelete(item)
    }

    setOpenedKey('')
  }

  return (
    <div className="mst-result-list">
      {results.map((item, index) => {
        const itemKey = getItemKey(item, index)
        const isOpened = openedKey === itemKey

        return (
          <div
            className={`mst-result-swipe ${isOpened ? 'is-opened' : ''}`}
            key={itemKey}
            onPointerDown={handlePointerDown}
            onPointerUp={(event) => handlePointerUp(event, itemKey)}
            onPointerCancel={() => setOpenedKey('')}
          >
            {swipeToDelete && (
              <button
                type="button"
                className="mst-result-swipe__delete"
                onClick={() => handleDelete(item)}
              >
                <img
                  className="mst-result-swipe__delete-icon"
                  src={DeleteIcon}
                  alt=""
                />
                <span>Xoá</span>
              </button>
            )}

            <div className="mst-result-card">
              <div className="mst-result-card__tax-code">
                <span className="mst-result-card__icon" />
                <span>{item.taxCode}</span>
              </div>

              <div className="mst-result-card__name">
                {item.name}
              </div>

              <div className="mst-result-card__address">
                {item.address}
              </div>

              <div className={`mst-result-card__footer ${item.isRegistered ? 'is-registered' : ''}`}>
                <span>{item.serviceName}</span>

                <button
                    type="button"
                    className={item.isRegistered ? 'is-registered' : ''}
                    onClick={() => onRegister && onRegister(item)}
                >
                    {item.actionText || 'Đăng ký'}
                </button>
                </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MstResultList