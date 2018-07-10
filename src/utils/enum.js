export const ROLE = {
  ADMIN: 9,
  DIRECTOR: 8,
  MANAGER: 7,
  EMPLOYEE: 1,
  GUEST: 0
}

export const PERIOD_UNIT = {
  MONTH: 7,
  WEEK: 6,
  DAY: 5
}

export const PERIOD_OPTIONS = [
  {
    label: '自定义',
    value: 0
  },
  {
    label: '最近一周',
    value: 7
  }, {
    label: '最近一个月',
    value: 30
  }, {
    label: '最近一个季度',
    value: 120
  }, {
    label: '最近半年',
    value: 183
  }
]

export const HEADER_WIDTH = {
  totalQuantity: 120,
  totalAverage: 120,
  date: 200,
  countryCode: 60,
  price: 140,
  shopName: 120,
  productName: 300,
  reviewDate: 120,
  orderId: 160,
  amazonOrderId: 160,
  operatorId: 100,
  orders: 60,
  'Session Percentage': 90,
  name: 200,
  title: 400,
  score: 60,
  purchaseDate: 160,
  lastUpdateTime: 120,
  lastUpdateDate: 160,
  buyerId: 140,
  sellerId: 140,
  currentQuantity: 100,
  asin: 120,
  QA: 60,
  author: 150
}
