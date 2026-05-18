import React from 'react'
import { TAX_SEARCH_TYPE, TAX_SEARCH_TYPE_OPTIONS } from '../../constants/taxLookup'
import './index.scss'

const normalizeDigits = (value) => String(value || '').replace(/\D/g, '')

const TaxSearchForm = ({
  searchType = TAX_SEARCH_TYPE.MST,
  value = '',
  error = '',
  loading = false,
  disabled = false,
  submitText = 'Tìm kiếm',
  onChangeSearchType,
  onChangeValue,
  onSubmit
}) => {
  const currentOption =
    TAX_SEARCH_TYPE_OPTIONS.find((item) => item.value === searchType) ||
    TAX_SEARCH_TYPE_OPTIONS[0]

  const isSubmitDisabled = disabled || loading || !value

  const handleChangeType = (type) => {
    if (type === searchType) return

    if (onChangeSearchType) {
      onChangeSearchType(type)
    }
  }

  const handleChangeValue = (event) => {
    const nextValue = normalizeDigits(event.target.value)

    if (onChangeValue) {
      onChangeValue(nextValue)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (disabled || loading) return

    if (onSubmit) {
      onSubmit()
    }
  }

  return (
    <form className="tax-search-form" onSubmit={handleSubmit}>
      <div className="tax-search-form__tabs">
        {TAX_SEARCH_TYPE_OPTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`tax-search-form__tab ${
              searchType === item.value ? 'active' : ''
            }`}
            onClick={() => handleChangeType(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="tax-search-form__search-row">
        <input
          className="tax-search-form__input"
          value={value}
          onChange={handleChangeValue}
          inputMode="numeric"
          maxLength={currentOption.maxLength}
          placeholder={currentOption.placeholder}
          disabled={disabled || loading}
        />

        <button
          type="submit"
          className="tax-search-form__submit"
          disabled={isSubmitDisabled}
        >
          {loading ? 'Đang tìm...' : submitText}
        </button>
      </div>

      {error && <div className="tax-search-form__error">{error}</div>}
    </form>
  )
}

export default TaxSearchForm
export { TAX_SEARCH_TYPE }