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
  date: 200,
  price: 140,
  shopName: 120,
  productName: 200,
  reviewDate: 120,
  orderId: 160,
  operatorId: 100,
  orders: 60,
  'Session Percentage': 90,
  name: 400,
  title: 200,
  score: 60,
  lastUpdateTime: 120,
  buyerId: 140,
  sellerId: 140,
  currentQuantity: 140,
  asin: 120,
  QA: 40
}
