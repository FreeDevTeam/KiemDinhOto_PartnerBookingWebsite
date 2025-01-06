import NewService from "./../services/addBookingService"
const CACHE_EXPIRATION_MINUTES = 5;

export const getBannerBySectionCache = async (bannerSection) => {
    if (!bannerSection) return [];

    const cacheKey = `BANNER_${bannerSection}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        let parsedData;
        try {
            parsedData = JSON.parse(cachedData);
        } catch (e) {
            // Nếu parsing thất bại, nghĩa là dữ liệu trong localStorage bị hỏng hoặc không hợp lệ
            console.error('Error parsing cached data:', e);
        }

        if (parsedData && parsedData.timestamp && parsedData.data) {
            const { data, timestamp } = parsedData;
            const now = new Date().getTime();

            // Kiểm tra nếu dữ liệu cache còn hạn
            if (now - timestamp < CACHE_EXPIRATION_MINUTES * 60 * 1000) {
                return data;
            }
        }
    }

    // Nếu không có cache hoặc cache đã hết hạn, gọi API
    const result = await NewService.getBannerStationsList({
        filter: {
            bannerSection,
        },
    });

    if (result?.data) {
        // Lưu kết quả vào localStorage với timestamp hiện tại
        const cacheData = {
            data: result.data,
            timestamp: new Date().getTime(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }

    return result?.data;
};
