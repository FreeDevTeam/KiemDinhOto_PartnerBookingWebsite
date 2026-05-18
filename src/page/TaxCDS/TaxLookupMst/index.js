import React, { useEffect, useMemo, useState } from 'react'
import TaxPageHeader from '../components/TaxPageHeader'
import TaxSearchForm from '../components/TaxSearchForm'
import { TAX_SEARCH_TYPE, validateTaxKeyword } from '../constants/taxLookup'
import { getBannerBySectionCache } from '../../../helper/getBannerBySectionCache'
import TaxSupportSection from '../components/TaxSupportSection'
import TaxUtilitySection from '../components/TaxUtilitySection'
import TaxEmptyResult from '../components/TaxEmptyResult'
import MstResultList from './components/MstResultList'
import TaxCdsService from '../../../services/taxCdsService'
import './index.scss'

const TAX_BANNER_SECTION = '2001'
const TAX_MST_LOOKUP_CACHE_KEY = 'TAX_MST_LOOKUP_CACHE'

const getInitialLookupCache = () => {
  try {
    const cachedLookup = localStorage.getItem(TAX_MST_LOOKUP_CACHE_KEY)

    if (cachedLookup) {
      const parsedLookup = JSON.parse(cachedLookup)
      return Array.isArray(parsedLookup) ? parsedLookup : []
    }

    return []
  } catch (error) {
    return []
  }
}

const saveLookupCacheToLocalStorage = (lookupList = []) => {
  try {
    localStorage.setItem(TAX_MST_LOOKUP_CACHE_KEY, JSON.stringify(lookupList))
  } catch (error) {
    // ignore localStorage error
  }
}

const mapTaxLookupResult = (item = {}) => {
  const isRegistered = Boolean(item.isRegistered)

  return {
    taxCDSMstLookupId: item.taxCDSMstLookupId || null,
    taxCode: item.taxCode || '',
    name: item.taxpayerName || '',
    address: item.businessAddress || item.taxRegistrationAddress || '',
    taxDepartment: item.taxDepartment || '',
    identityNumber: item.identityNumber || '',
    status: item.status || '',
    statusText: item.statusText || '',
    note: item.note || '',
    serviceName: 'Thuê Trợ lý thuế thông minh',
    actionText: isRegistered ? 'Quản lý' : 'Đăng ký',
    isRegistered
  }
}

const mapTaxLookupResults = (list = []) => {
  if (!Array.isArray(list)) return []

  return list
    .map(mapTaxLookupResult)
    .filter((item) => item.taxCode)
}

const MstResultSkeleton = ({ count = 3 }) => {
  return (
    <div className="tax-mst-skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <div className="tax-mst-skeleton-card" key={index}>
          <div className="tax-mst-skeleton-card-header">
            <div className="tax-mst-skeleton-avatar" />

            <div className="tax-mst-skeleton-header-content">
              <div className="tax-mst-skeleton-line tax-mst-skeleton-title" />
              <div className="tax-mst-skeleton-line tax-mst-skeleton-code" />
            </div>

            <div className="tax-mst-skeleton-pill" />
          </div>

          <div className="tax-mst-skeleton-body">
            <div className="tax-mst-skeleton-info-row">
              <div className="tax-mst-skeleton-icon" />
              <div className="tax-mst-skeleton-line tax-mst-skeleton-line-full" />
            </div>

            <div className="tax-mst-skeleton-info-row">
              <div className="tax-mst-skeleton-icon" />
              <div className="tax-mst-skeleton-line tax-mst-skeleton-line-medium" />
            </div>

            <div className="tax-mst-skeleton-info-row">
              <div className="tax-mst-skeleton-icon" />
              <div className="tax-mst-skeleton-line tax-mst-skeleton-line-short" />
            </div>
          </div>

          <div className="tax-mst-skeleton-footer">
            <div className="tax-mst-skeleton-service">
              <div className="tax-mst-skeleton-line tax-mst-skeleton-service-title" />
              <div className="tax-mst-skeleton-line tax-mst-skeleton-service-desc" />
            </div>

            <div className="tax-mst-skeleton-button" />
          </div>
        </div>
      ))}
    </div>
  )
}

const TaxLookupMst = () => {
  const [banner, setBanner] = useState(null)
  const [searchType, setSearchType] = useState(TAX_SEARCH_TYPE.MST)
  const [keyword, setKeyword] = useState('')
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState([])
  const [lookupCacheResults, setLookupCacheResults] = useState(getInitialLookupCache)
  const [lookupCacheExpanded, setLookupCacheExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const filteredLookupCacheResults = useMemo(() => {
    const currentResultCodes = results.map((item) => item.taxCode)

    return lookupCacheResults.filter(
      (item) => !currentResultCodes.includes(item.taxCode)
    )
  }, [lookupCacheResults, results])

  const visibleLookupCacheResults = lookupCacheExpanded
    ? filteredLookupCacheResults
    : filteredLookupCacheResults.slice(0, 3)

  const canToggleLookupCache = filteredLookupCacheResults.length > 3

  useEffect(() => {
    getBannerBySectionCache(TAX_BANNER_SECTION).then((data) => {
      const firstBanner = Array.isArray(data) ? data[0] : null
      setBanner(firstBanner || null)
    })
  }, [])

  const handleClickBanner = () => {
    if (!banner?.bannerUrl) return
    window.location.href = banner.bannerUrl
  }

  const handleDeleteLookupCache = (item) => {
    const nextLookupList = lookupCacheResults.filter((lookupItem) => {
      return lookupItem.taxCode !== item.taxCode
    })

    setLookupCacheResults(nextLookupList)
    saveLookupCacheToLocalStorage(nextLookupList)
  }

  const validateKeyword = () => {
    return validateTaxKeyword({
      searchType,
      keyword
    })
  }

  const saveLookupCache = (nextResults) => {
    if (!nextResults.length) return

    const nextLookupList = [
      ...nextResults,
      ...lookupCacheResults
    ].filter((item, index, array) => {
      return array.findIndex((lookupItem) => lookupItem.taxCode === item.taxCode) === index
    })

    const limitedLookupList = nextLookupList.slice(0, 10)

    setLookupCacheResults(limitedLookupList)
    saveLookupCacheToLocalStorage(limitedLookupList)
  }

  const handleSubmit = async () => {
    const message = validateKeyword()

    if (message) {
      setError(message)
      setSearched(false)
      setResults([])
      return
    }

    setError('')
    setSearched(false)
    setResults([])
    setLoading(true)

    try {
      const response = await TaxCdsService.lookupTaxCode({
        filter: {
          searchType: searchType
        },
        skip: 0,
        limit: 10,
        searchText: keyword,
        order: {
          key: 'createdAt',
          value: 'desc'
        }
      })

      setSearched(true)

      if (!response?.isSuccess) {
        setError(response?.message || 'Không thể tra cứu mã số thuế. Vui lòng thử lại.')
        setResults([])
        return
      }

      const list = Array.isArray(response?.data?.data) ? response.data.data : []
      const nextResults = mapTaxLookupResults(list)

      setResults(nextResults)
      saveLookupCache(nextResults)
    } catch (error) {
      setSearched(true)
      setResults([])
      setError('Không thể tra cứu mã số thuế. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = (item) => {
    if (item?.isRegistered) {
      console.log('TODO: Điều hướng sang màn quản lý gói TaxCDS:', item)
      return
    }

    console.log('TODO: Điều hướng sang màn đăng ký Trợ lý thuế thông minh:', item)
  }

  return (
    <div className="tax-mst-page">
      <div className="tax-mst-container">
        <TaxPageHeader title="Tra cứu mã số thuế" />

        <div className="tax-mst-banner-section">
          {banner?.bannerImageUrl && (
            <button
              type="button"
              className="tax-mst-banner"
              onClick={handleClickBanner}
            >
              <img src={banner.bannerImageUrl} alt={banner.bannerName || 'Banner'} />
            </button>
          )}
        </div>

        <div className="tax-mst-white-panel">
          <div className="tax-mst-search-card">
            <TaxSearchForm
              searchType={searchType}
              value={keyword}
              error={error}
              loading={loading}
              onChangeSearchType={(type) => {
                setSearchType(type)
                setKeyword('')
                setError('')
                setSearched(false)
                setResults([])
                setLookupCacheExpanded(false)
              }}
              onChangeValue={(value) => {
                setKeyword(value)
                setError('')
                setSearched(false)
                setResults([])
                setLookupCacheExpanded(false)
              }}
              onSubmit={handleSubmit}
            />

            {(loading || searched) && (
              <div className="tax-mst-result">
                <div className="tax-mst-result-title">
                  Kết quả tìm thấy:
                </div>

                {loading ? (
                  <MstResultSkeleton count={1} />
                ) : results.length > 0 ? (
                  <MstResultList
                    results={results}
                    onRegister={handleRegister}
                  />
                ) : (
                  <TaxEmptyResult />
                )}
              </div>
            )}

            {filteredLookupCacheResults.length > 0 && (
              <div className="tax-mst-history">
                <div className="tax-mst-history-title">
                  Lịch sử tra cứu
                </div>

                <MstResultList
                  results={visibleLookupCacheResults}
                  onRegister={handleRegister}
                  swipeToDelete
                  onDelete={handleDeleteLookupCache}
                />

                {canToggleLookupCache && (
                  <button
                    type="button"
                    className="tax-mst-history-toggle"
                    onClick={() => setLookupCacheExpanded((prev) => !prev)}
                  >
                    <span>{lookupCacheExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
                    <i
                      className={`tax-mst-history-toggle-icon ${
                        lookupCacheExpanded ? 'is-expanded' : ''
                      }`}
                    />
                  </button>
                )}
              </div>
            )}
          </div>

          <TaxSupportSection />
          <TaxUtilitySection />
        </div>
      </div>
    </div>
  )
}

export default TaxLookupMst