export interface CommodityPoint {
  text: string
  mediaName: string
  publishedAt: string
}

export interface CommodityOverview {
  commodity: string
  articleCount: number
  mainPointCount: number
  /**
   * Jumlah poin pendukung menurut sheet "Ringkasan Komoditas". Nilai ini tidak
   * dapat diturunkan dari artikel pada sheet "Hasil Scraping" sehingga selalu
   * diambil langsung dari Excel.
   */
  supportingPointCount: number
  positiveCount: number
  negativeCount: number
  /** Rentang tanggal publikasi sesuai sheet "Ringkasan Komoditas", mis. "1 Sep - 22 Sep". */
  dateRange: string
  points: CommodityPoint[]
}
