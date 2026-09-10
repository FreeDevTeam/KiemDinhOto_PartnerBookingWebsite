import React, { useState, useMemo, useEffect } from 'react'
import { Select } from 'antd'
import BasicEmpty from '../BasicComponent/BasicEmpty'
import BaseBottomSheet from '../BaseBottomSheet'
import SearchList from '../shared/search/SearchList'
import './index.scss'

const BottomSheetSelect = (props) => {
  const { 
    options = [], 
    children, 
    value, 
    onChange, 
    placeholder, 
    showSearch, 
    isSearchable,
    disabled,
    title,
    ...restProps 
  } = props

  const [isOpen, setIsOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  // Chuẩn hoá dữ liệu đầu vào:
  // Thẻ Select có thể nhận dữ liệu theo 2 cách: truyền qua prop `options` hoặc các thẻ con `<Select.Option>`
  // Hàm này sẽ gom 2 nguồn đó lại thành 1 mảng options thống nhất để xử lý ở BottomSheet
  const mergedOptions = useMemo(() => {
    let result = []
    if (options && options.length > 0) {
      result = options
    } else if (children) {
      const childArray = React.Children.toArray(children)
      result = childArray.map(child => ({
        value: child.props.value,
        label: child.props.children,
        disabled: child.props.disabled,
        ...child.props
      }))
    }
    return result
  }, [options, children])

  // Hàm đệ quy bóc tách chuỗi text thuần túy từ một React Node:
  // Ví dụ: label của option có thể là một đoạn JSX <div><span>Text</span></div> 
  // thay vì một string thông thường. Hàm này dùng để lấy chữ "Text" ra, phục vụ cho việc tìm kiếm (search).
  const extractTextFromNode = (node) => {
    if (typeof node === 'string') return node
    if (typeof node === 'number') return String(node)
    if (Array.isArray(node)) {
      return node.map(extractTextFromNode).join(' ')
    }
    if (node && typeof node === 'object' && node.props && node.props.children) {
      return extractTextFromNode(node.props.children)
    }
    return ''
  }

  // Lọc options dựa trên searchText
  const filteredOptions = useMemo(() => {
    if (!searchText) return mergedOptions
    return mergedOptions.filter(opt => {
      let searchStr = ''
      if (typeof opt.searchLabel === 'string') {
        searchStr = opt.searchLabel
      } else if (typeof opt.name === 'string') {
        searchStr = opt.name
      } else if (typeof opt.label === 'string') {
        searchStr = opt.label
      } else if (opt.label && typeof opt.label === 'object') {
        searchStr = extractTextFromNode(opt.label)
      } else if (typeof opt.areaName === 'string') {
        searchStr = opt.areaName
      } else if (typeof opt.vntName === 'string') {
        searchStr = opt.vntName
      } else if (typeof opt.value === 'string') {
        searchStr = opt.value
      }
      return searchStr.toLowerCase().includes(searchText.toLowerCase())
    })
  }, [mergedOptions, searchText])

  // Xử lý khi chọn item
  const handleSelectItem = (item) => {
    if (item.disabled) return
    if (onChange) {
      onChange(item.value, item)
    }
    setIsOpen(false)
    setSearchText('')
  }

  return (
    <>
      <Select
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        open={false}
        options={options}
        onDropdownVisibleChange={(open) => {
          if (open && !disabled) {
            setIsOpen(true)
            setSearchText('')
          }
        }}
        {...restProps}
      >
        {children}
      </Select>

      <BaseBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title || placeholder || 'Chọn giá trị'}
      >
        <div className="bottom-sheet-select-wrapper">
          {(showSearch || isSearchable) && (
            <div className="bottom-sheet-search-wrapper">
              <SearchList
                placeholder="Tìm kiếm"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={(val) => setSearchText(val)}
                className="w-100"
              />
            </div>
          )}
          
          <div className="bottom-sheet-options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => (
                <button
                  key={item.value}
                  className={`list-items ${item.disabled ? 'disabled-item' : ''} ${item.value === value ? 'selected-item' : ''}`}
                  disabled={item.disabled}
                  onClick={() => handleSelectItem(item)}
                >
                  {item.label || item.areaName || item.vntName || item.name || item.value || JSON.stringify(item)}
                </button>
              ))
            ) : (
              <div className="p-4 text-center">
                <BasicEmpty description="Không tìm thấy kết quả phù hợp" />
              </div>
            )}
          </div>
        </div>
      </BaseBottomSheet>
    </>
  )
}

export default BottomSheetSelect
