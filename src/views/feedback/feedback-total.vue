<template>
  <div>
    <el-form ref="form" class="mini-class">
      <!-- 通用搜索组件 -->
      <search-bar :shopList="shopList" :nationList="nationList" :periodSelect="7" @onChange="searchBarChange($event)" ></search-bar>
        <!-- 其他搜索 -->
        <el-row>
          <el-col :span="6" style="padding-right: 5px;">
            <el-form-item label="星评">
              <el-select clearable v-model="star" placeholder="选择星评" class="shop-select" @change="starChange" :size="SELECT_SIZE">
                <el-option
                  v-for="rate in rateList"
                  :key="rate"
                  :label="rate"
                  :value="rate">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="ASIN">
                <el-input
                  placeholder="输入ASIN"
                  class="asin-input"
                  clearable
                  v-model="filter.productId" :size="SELECT_SIZE">
                </el-input>
              </el-form-item>
          </el-col>
          <el-col :span="5" :offset="0">
              <el-button type="primary" round icon="el-icon-search" @click="searchGrid" :size="SELECT_SIZE">搜索</el-button>
              <el-button type="" round icon="el-icon-search" @click="resetSearch" :size="SELECT_SIZE">重置</el-button>
          </el-col>
        </el-row>
        <el-row>
          <!-- 显示隐藏列 -->
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
          <el-button v-if="showDownload" size="mini" icon="el-icon-document" @click="getDownload">请求下载</el-button>
          <!-- 下载组件 -->
          <vue-csv-download
            v-else
            :data="download"
            :fields="headersDownload"
            class="download"
            >
            <el-button size="mini" icon="el-icon-document" @click="changeDownloadStatus">下载</el-button>
          </vue-csv-download>
        </el-col>
      </el-row>
    </el-form>
    <el-row :gutter="20">
      <el-col :span="24">
        <!-- 数据列表 -->
        <el-table 
          border
          :height="tableHeight" 
          :data="gridData"
          @sort-change="changeSortItem">
          <el-table-column 
            v-for="(headerName, index) in dynamicHeaders" 
            :width="headerWidth[headerName]?headerWidth[headerName]:'100'"
            :key="headerName + '_' + index" 
            :fixed="headerFixed[headerName]"
            :label="dictCn[headerName]?dictCn[headerName]:headerName"
            v-if="dynamicHeaders.includes(headerName)"
            :prop="headerName"
            align = center
            :sortable="headerName==='countryCode' || headerName==='productName' ? false : 'custom'">
            <template slot-scope="scope" v-if="scope.row[headerName]">
              <a :href="scope.row.homeURL" target="_blank" v-if="headerName === 'asin'">{{scope.row[headerName]}}</a>
              <span v-else>{{scope.row[headerName]}}</span>
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
import {PERIOD_OPTIONS, HEADER_WIDTH, SELECT_SIZE} from '../../utils/enum'
import searchBar from '@/components/search-bar/search-bar'

export default {
  components: {
    VueCsvDownload,
    searchBar
  },
  data () {
    return {
      SELECT_SIZE: SELECT_SIZE,
      tableHeight: window.innerHeight - 240,
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
        star: undefined,
        sortParam: '',
        high2low: ''
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
      dictCn: {
        shopName: '店铺名称',
        asin: 'ASIN',
        productName: '产品名称',
        countryCode: '国家',
        currentQuantity: '当选数量',
        currentAverage: '当选分数',
        totalQuantity: '反馈总数',
        totalAverage: '反馈分数'
      },
      nationListBK: [],
      headers: [],
      headersDownload: [],
      headersArray: [],
      headerFixed: {
        productName: 'left',
        countryCode: 'left',
        asin: 'left'
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
      },
      showDownload: true
    }
  },
  computed: {
    // 英文词典
    dictEn () {
      let dictEn = {}
      for (let prop in this.dictCn) {
        dictEn[this.dictCn[prop]] = prop
      }
      return dictEn
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
    // 改变排序
    changeSortItem (val) {
      this.filter.sortParam = val.prop
      if (val.order === 'descending') {
        this.filter.high2low = true
      } else {
        this.filter.high2low = false
      }
      this.getPageProducts()
    },
    // 重置搜索条件
    resetSearch () {
      this.star = null
      this.product = null
      this.filter = { ...this.filter, star: undefined, productId: undefined }
      this.getPageProducts()
    },
    // 星评过滤
    starChange (value) {
      if (value === 'All') {
        this.filter.star = undefined
      } else {
        this.filter.star = value
      }
      this.getPageProducts()
    },
    // 创建表头
    createHeader (headers) {
      this.dynamicHeaders = ['asin', 'countryCode', 'productName', 'totalQuantity', 'totalAverage', 'currentQuantity', 'currentAverage']
      let sort = []
      for (let header in headers) {
        if (!this.dynamicHeaders.includes(header) && header !== 'shopId' && header !== 'shopName' && header !== 'homeURL' && header !== 'marketplaceId') {
          sort.push(header)
        }
      }
      sort = sort.sort((a, b) => {
        return a > b ? 1 : -1
      })

      this.dynamicHeaders = [...this.dynamicHeaders, ...sort]
      this.headers = this.dynamicHeaders
      const headersFixed = ['asin', 'countryCode', 'totalQuantity', 'totalAverage', 'currentQuantity', 'currentAverage']
      const headersDownload = [...headersFixed, ...sort]
      this.headersDownload = headersDownload.map(h => this.dictCn[h] ? this.dictCn[h] : h)
    },
    // 搜索栏改变
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
    // 搜索
    searchGrid () {
      this.getPageProducts()
    },
    // 页面大小改变
    sizeChange (e) {
      this.pageSize = e
      this.getPageProducts()
    },
    // 当前页面改变
    currentChange (e) {
      this.currentPage = e
      this.getPageProducts()
    },
    // 显示隐藏列
    updateVisibleColumns () {
      this.showHideColumns(this.checkedList)
      // this.headers = this.checkedList
    },
    // 显示隐藏列
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
    // 取后台数据
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
          if (this.gridData.length > 0) {
            this.createHeader(this.gridData[0])
          }
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
      this.showDownload = true
    },
    // 取下载数据
    getDownload () {
      let pagination = {
        pageSize: 99999,
        currentPage: 1
      }
      pagination.filter = this.filter

      const period = this.filter.period
      api.post('/api/review/statistics', {pagination, period}).then(res => {
        if (res.status === 200 && res.data) {
          this.download = res.data.grid.map(d => {
            let download = {}
            for (let prop in d) {
              if (this.dictCn[prop]) {
                download[this.dictCn[prop]] = d[prop]
              } else {
                download[prop] = d[prop]
              }
            }
            return download
          })
        }
      }).catch(err => {
        Message({
          showClose: true,
          message: err.response.statusText,
          type: 'error'
        })
      })
      this.$sendDownloadHistory('反馈统计')
      this.showDownload = false
    },
    // 改变下载状态
    changeDownloadStatus () {
      this.showDownload = true
      this.download = []
    },
    // 取国家列表
    getNationList () {
      api.get('/api/country').then(res => {
        this.nationList = res.data.grid
        this.nationListBK = this.nationList
      })
    },
    // 取店铺列表
    getShopList () {
      api.get('/api/shop').then(res => {
        this.shopList = res.data
      })
    },
    // 改变当前页
    updatePageProducts (currentPage) {
      this.currentPage = currentPage
      this.getPageProducts()
    },
    // 错误处理器
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

