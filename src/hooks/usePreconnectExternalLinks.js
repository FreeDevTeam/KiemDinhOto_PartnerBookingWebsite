import { useEffect } from 'react'

const usePreconnectExternalLinks = (homepageConfig) => {
  useEffect(() => {
    // Nếu danh sách rỗng thì không làm gì cả
    const list = homepageConfig || []
    const domains = new Set()

    // Lọc ra các domain độc nhất (origin) từ các link điều hướng
    list.forEach((item) => {
      const link = item?.linkNavigation
      if (link && (link.startsWith('https://') || link.startsWith('http://'))) {
        try {
          const url = new URL(link)
          domains.add(url.origin)
        } catch (e) {
          // ignore invalid URLs
        }
      }
    })

    const linkElements = []
    
    domains.forEach((origin) => {
      // dns-prefetch: Yêu cầu trình duyệt phân giải DNS cho domain này trước,
      // giúp giảm độ trễ khi người dùng thực sự bấm vào link.
      const dnsPrefetch = document.createElement('link')
      dnsPrefetch.rel = 'dns-prefetch'
      dnsPrefetch.href = origin
      document.head.appendChild(dnsPrefetch)
      linkElements.push(dnsPrefetch)

      // preconnect: Thiết lập sẵn kết nối mạng (DNS, TCP, TLS) tới domain,
      // giúp việc tải trang/iframe phía sau nhanh chóng hơn đáng kể.
      const preconnect = document.createElement('link')
      preconnect.rel = 'preconnect'
      preconnect.href = origin
      preconnect.crossOrigin = 'anonymous'
      document.head.appendChild(preconnect)
      linkElements.push(preconnect)
    })

    // Dọn dẹp các thẻ <link> đã gắn vào <head> khi component bị unmount
    return () => {
      linkElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })
    }
  }, [homepageConfig])
}

export default usePreconnectExternalLinks
