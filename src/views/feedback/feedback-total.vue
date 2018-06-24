<template>
  <div>
    <el-form ref="form">
      <search-bar :shopList="shopList" :nationList="nationList" :periodSelect="7" @onChange="searchBarChange($event)" ></search-bar>
        <el-row>
          <el-col :span="5" style="padding-right: 5px;">
            <el-form-item label="星评">
              <el-select clearable v-model="star" placeholder="选择星评" class="shop-select" @change="starChange">
                <el-option
                  v-for="rate in rateList"
                  :key="rate"
                  :label="rate"
                  :value="rate">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="产品ASIN">
                <el-input
                  placeholder="输入ASIN"
                  type="textarea"
                  class="asin-input"
                  clearable
                  v-model="filter.productId">
                </el-input>
              </el-form-item>
          </el-col>
          <el-col :span="5" :offset="0">
              <el-button type="primary" round icon="el-icon-search" @click="searchGrid">搜索</el-button>
              <el-button type="" round icon="el-icon-search" @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-popover
            ref="showHideColumns"
            trigger="hover">
            <el-checkbox-group v-model="checkedList" @change="updateVisibleColumns">
              <el-checkbox v-for="(header, index) of headers" :key="index" :label="header" style="width: 100%;"></el-checkbox>
            </el-checkbox-group>
          </el-popover>
          <el-col :span="16">
            <el-pagination
            @size-change="sizeChange"
            @current-change="currentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="sizes, total, prev, pager, next"
            :total="total">
          </el-pagination>
        </el-col>
        <el-col :span="8" class="text-right">
          <!-- <el-button size="mini" v-popover:showHideColumns>显示/隐藏列</el-button> -->
          <el-button v-if="download.length===0" size="mini" icon="el-icon-document" @click="getDownload">请求下载</el-button>
          <vue-csv-download
            v-else
            :data="download"
            :fields="fieldsCn"
            class="download"
            >
            <el-button size="mini" icon="el-icon-document">下载</el-button>
          </vue-csv-download>
        </el-col>
      </el-row>
    </el-form>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-table 
          border
          stripe
          height="500"
          :data="gridData">
          <el-table-column 
            v-for="(headerName, index) in dynamicHeaders" 
            :width="headerWidth[headerName]?headerWidth[headerName]:'100'"
            :key="headerName + '_' + index" 
            :fixed="headerFixed[headerName]"
            :label="headerName"
            v-if="dynamicHeaders.includes(headerName)">
            <template slot-scope="scope" v-if="scope.row[headerName]">
              {{scope.row[headerName]}}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import api from '../../utils/api'
import { Message } from 'element-ui'
import VueCsvDownload from '@/components/csvDownload/csvDownload'
import {PERIOD_OPTIONS, HEADER_WIDTH} from '../../utils/enum'
import searchBar from '@/components/search-bar/search-bar'

export default {
  components: {
    VueCsvDownload,
    searchBar
  },
  data () {
    return {
      dynamicHeaders: [],
      mockData: [],
      filter: {
        shopId: null,
        // asinOrName: '',
        period: {
          start: '',
          end: ''
        },
        countryCode: '',
        productId: '',
        star: undefined
      },
      star: '',
      checkedList: [],
      periodOptions: PERIOD_OPTIONS,
      rateList: ['All', 1, 2, 3, 4, 5],
      pageSize: 20,
      total: 0,
      currentPage: 1,
      maxlength: 200,
      nationList: ['US', 'UK', 'DE', 'FR', 'IT', 'ES', 'JP'],
      statusId: '',
      statusList: ['All', 'Active', 'Processing Succeed', 'Failed Deleted'],
      userId: '',
      userList: [],
      gridData: [],
      productTotal: 0,
      pageProducts: [],
      search_val: undefined,
      shopId: undefined,
      isShowLiked: false,
      likedProducts: [],
      shopList: [],
      formLabelWidth: '120px',
      options: [],
      productType: '',
      dialogFormVisible: false,
      optimizationTypes: [
      ],
      periodSelect: 7,
      dr: null,
      searchField: {
        productId: '',
        auditor: '',
        proposer: ''
      },
      dictEn: {
        '提议编号': 'suggestionId',
        '标题': 'title',
        '店铺': 'shopName',
        '国家': 'countryCode',
        '提议状态': 'status',
        '提议时间': 'createDate',
        '产品名称': 'name',
        'ASIN': 'productId',
        '提议人': ' proposer',
        '优化类型': 'suggestType',
        '提议内容': 'suggestion',
        '审批人': 'auditor',
        '审批建议': 'reply',
        '审批时间': 'auditDate',
        '完成时间': 'finishDate',
        '总结内容': 'sumup',
        '总结时间': 'sumupDate',
        '备注': 'comments'
      },
      dictCn: {
        suggestionId: '提议编号',
        title: '标题',
        shopName: '店铺',
        countryCode: '国家',
        status: '提议状态',
        createDate: '提议时间',
        name: '产品名称',
        productId: 'ASIN',
        proposer: '提议人',
        suggestType: '优化类型',
        suggestion: '提议内容',
        auditor: '审批人',
        reply: '审批建议',
        auditDate: '审批时间',
        finishDate: '完成时间',
        sumup: '总结内容',
        sumupDate: '总结时间',
        comments: '备注'
      },
      nationListBK: [],
      headers: [],
      headersArray: [],
      headerFixed: {
        totalQuantity: 'right',
        totalAverage: 'right'
      },
      headerWidth: HEADER_WIDTH,
      download: [],
      form: {
        productId: '',
        shopId: undefined,
        productName: '',
        optimizationType: '',
        suggestion: '',
        title: '',
        sn: 1
      }
    }
  },
  computed: {
    fieldsCn () {
      return this.headers
    }
  },
  created () {
    this.search_val = this.$route.query.productId
    this.shopId = this.$route.query.shopId

    this.getShopList()
    this.getNationList()

    // this.getPageProducts()
  },
  methods: {
    resetSearch () {
      this.star = null
      this.product = null
      this.filter = { ...this.filter, star: undefined, productId: undefined }
      this.getPageProducts()
    },
    starChange (value) {
      if (value === 'All') {
        this.filter.star = undefined
      } else {
        this.filter.star = value
      }
      this.getPageProducts()
    },
    createHeader (headers) {
      this.dynamicHeaders = ['shopName', 'country', 'asin', 'productName', 'currentQuantity', 'currentAverage']
      let sort = []
      for (let header in headers) {
        if (!this.dynamicHeaders.includes(header)) {
          sort.push(header)
        }
      }
      sort = sort.sort((a, b) => {
        return a > b ? 1 : -1
      })

      this.dynamicHeaders = [...this.dynamicHeaders, ...sort]
      this.headers = this.dynamicHeaders
      console.log(this.dynamicHeaders, sort)
      // this.headers = this.headersArray.map(e => this.dictCn[e.en])
      // this.checkedList = this.dynamicHeaders.map(e => this.dictCn[e])
    },
    searchBarChange (filter) {
      if (filter.shopId) {
        const shop = this.shopList.find(s => s.shopId === filter.shopId)
        this.nationList = shop.countryCode.map(c => {
          return { countryCode: c }
        })
      } else {
        this.nationList = this.nationListBK
      }
      console.log('searchBarChange', filter)
      this.filter = {...this.filter, ...filter}
      this.currentPage = 1
      this.getPageProducts()
    },
    searchGrid () {
      this.getPageProducts()
    },
    sizeChange (e) {
      this.pageSize = e
      this.getPageProducts()
    },
    currentChange (e) {
      this.currentPage = e
      this.getPageProducts()
    },
    updateVisibleColumns () {
      this.showHideColumns(this.checkedList)
      // this.headers = this.checkedList
    },
    showHideColumns (newHeaders) {
      for (let dh in this.dynamicHeaders) {
        let found = newHeaders.find(nh => {
          return dh === nh
        })
        if (found) {
          this.dynamicHeaders[dh] = true
        } else {
          this.dynamicHeaders[dh] = false
        }
      }
      this.dynamicHeaders = { ...this.dynamicHeaders }
    },
    updateDateRangeValue () {
      console.log(this.dr)
    },
    searchProduct () {
      let filter = {
        productId: this.search_val,
        shopId: this.shopId
      }
      this.getPageProducts(filter)
    },
    getPageProducts () {
      let pagination = {
        pageSize: this.pageSize,
        currentPage: this.currentPage
      }

      pagination.filter = this.filter

      const period = this.filter.period
      this.$store.dispatch('setLoadingState', true)

      api.post('/api/review/statistics', {pagination, period}).then(res => {
        if (res.status === 200 && res.data) {
          this.gridData = res.data.grid
          this.total = res.data.pagination.total
          this.createHeader(this.gridData[0])
        }
        this.$store.dispatch('setLoadingState', false)
      }).catch(err => {
        this.$store.dispatch('setLoadingState', false)
        Message({
          showClose: true,
          message: err.response.statusText,
          type: 'error'
        })
      })
    },
    getDownload () {
      let pagination = {
        pageSize: 99999,
        currentPage: 1
      }
      pagination.filter = this.filter

      const period = this.filter.period
      api.post('/api/review/statistics', {pagination, period}).then(res => {
        if (res.status === 200 && res.data) {
          this.download = res.data.grid
        }
      }).catch(err => {
        Message({
          showClose: true,
          message: err.response.statusText,
          type: 'error'
        })
      })
      this.$sendDownloadHistory('反馈统计')
    },
    getNationList () {
      api.get('/api/country').then(res => {
        this.nationList = res.data.grid
        this.nationListBK = this.nationList
      })
    },
    getShopList () {
      api.get('/api/shop').then(res => {
        this.shopList = res.data
      })
    },
    updatePageProducts (currentPage) {
      this.currentPage = currentPage
      this.getPageProducts()
    },
    listLikedProducts () {
      api.get(`/api/interested`).then(res => {
        console.log(res.data)
        this.likedProducts = res.data
      })
    },
    showHideLiked () {
      let filter = {
        productId: this.search_val,
        shopId: this.shopId,
        interestedOnly: this.isShowLiked ? 1 : undefined
      }
      this.getPageProducts(filter)
    },
    likeProduct (product, like) {
      let productInfo = {
        productId: product.asin,
        shopId: product.shopId
      }
      if (like === true) {
        api.post(`/api/interested`, productInfo).then(res => {
          if (res && res.status === 200) {
            console.log(res)
            this.listLikedProducts()
          }
        })
      } else {
        let interested = this.likedProducts.find(p => p.productId === product.asin)
        api.delete(`/api/interested/${interested.interestedId}`).then(res => {
          this.listLikedProducts()
        })
      }
    },
    errorHandler (err, specialCase) {
      if (specialCase && err.request.status === specialCase.code) {
        Message({
          showClose: true,
          message: specialCase.message,
          type: 'error'
        })
      } else if (err.request.status === 403) {
        Message({
          showClose: true,
          message: '当前用户权限不足',
          type: 'error'
        })
      } else if (err.request.status === 431) {
        Message({
          showClose: true,
          message: '数据提交冲突',
          type: 'error'
        })
      } else {
        Message({
          showClose: true,
          message: err.response.statusText,
          type: 'error'
        })
      }
    }
  }
}
</script>
<style scoped>
.el-icon-star-off {
  color:#FF6600
}

.nation-select {
  width: 110px!important;
}
.el-icon-star-on {
  color:#FF6600
}

.asin-input {
  width: 150px!important;
}
.rate-select {
  width: 110px!important;
}

.period-select {
  width: 150px!important;
}

.shop-select {
  width: 160px!important;
}
.el-checkbox+.el-checkbox {
  margin-left: 0!important;
}
</style>

