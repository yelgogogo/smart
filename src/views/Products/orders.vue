<template>
  <div>
    <!-- 订单查询表单 -->
    <el-form ref="form" class="mini-class">
      <!-- 引用search-bar组件（包括店铺，国家和时间选择） -->
      <search-bar :shopList="shopList" :nationList="nationList" :periodSelect="7" @onChange="searchBarChange($event)" ></search-bar>
      <el-row>
        <!-- 订单号输入框 -->
        <el-col :span="6" style="padding-right: 5px;">
          <el-form-item label="订单">
            <el-input
              class="shop-select"
              placeholder="输入订单号"
              clearable
              :size="SELECT_SIZE"
              v-model="filter.orderId">
            </el-input>
          </el-form-item>
        </el-col> 
        <!-- 买家Id输入框 -->
        <el-col :span="4" style="padding-right: 5px;">
          <el-form-item label="买家">
            <el-input
              class="nation-select"
              placeholder="请输入买家Id"
              clearable
              :size="SELECT_SIZE"
              v-model="filter.buyerId">
            </el-input>
          </el-form-item>
        </el-col>  
        <!-- ASIN输入框 -->
        <el-col :span="6" :offset="1">
          <el-form-item label="产品ASIN">
              <el-input
                placeholder="输入ASIN"
                class="asin-input"
                clearable
                :size="SELECT_SIZE"
                v-model="filter.productId">
              </el-input>
            </el-form-item>
        </el-col>
        <!-- 订单状态选择框 -->
        <el-col :span="6" style="padding-right: 5px;">
          <el-form-item label="订单状态">
            <el-select v-model="orderStatus" placeholder="选择状态" @change="orderStatusChange" class="shop-select" :size="SELECT_SIZE">
              <el-option
                v-for="status in statusList"
                :key="status"
                :label="status"
                :value="status">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 搜索&重置按钮 -->
        <el-col :span="24" :offset="0" class="text-right">
          <el-button type="primary" round icon="el-icon-search" @click="searchGrid" :size="SELECT_SIZE">搜索</el-button>
          <el-button type="" round icon="el-icon-search" @click="resetSearch" :size="SELECT_SIZE">重置</el-button>
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
        <!-- 分页设置 -->
        <el-col :span="16">
          <el-pagination
          @size-change="sizeChange"
          @current-change="currentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="sizes, total, prev, pager, next, jumper"
          :total="total">
          </el-pagination>
        </el-col>
      <!-- <el-col :span="5" :offset="0" class="text-right"> -->
        <!-- <el-button size="mini" icon="el-icon-plus" @click="ExportCsv">导出表格</el-button> -->
        <!-- </el-col> -->
        <el-col :span="8" class="text-right">
          <!-- <el-button size="mini" v-popover:showHideColumns>显示/隐藏列</el-button> -->
          <el-button v-if="showDownload" size="mini" icon="el-icon-document" @click="getDownload">请求下载</el-button>
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
        <!-- 订单查询表格 -->
        <el-table v-if="gridData.length>0"
          :height="tableHeight" 
          border
          :data="gridData"
          @sort-change="changeSortItem">
          <el-table-column 
            v-for="(headerName, index) in dynamicHeaders" 
            :width="headerWidth[headerName]?headerWidth[headerName]:'100'"
            :key="headerName + '_' + index" 
            :label="dictCn[headerName]"
            v-if="dynamicHeaders.includes(headerName)"
            :prop="headerName"
            :sortable="headerName==='purchaseDate' || headerName==='amazonOrderId' || headerName==='asin' || headerName==='buyerName'
             || headerName==='buyerId' || headerName==='quantityOrdered'? 'custom':false">
            <template slot-scope="scope" v-if="scope.row[headerName]">
                <p v-if="headerName === 'productName'" :title="scope.row.productName" class="product-name" >{{scope.row[headerName]}}</p>
                <p v-else-if="headerName === 'buyerName'" :title="scope.row.buyerName" class="product-name" >{{scope.row[headerName]}}</p>
                <span v-else>
                  {{scope.row[headerName]}}
                </span>
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
// import moment from 'moment'
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
      tableHeight: window.innerHeight - 260,
      orderStatus: '',
      download: [],
      filter: {
        shopId: null,
        // asinOrName: '',
        period: {
          start: '',
          end: ''
        },
        status: ['Pending', 'Unshipped', 'Shipped', 'Canceled'],
        countryCode: '',
        productId: '',
        buyerId: '',
        ordeId: '',
        sortParam: '',
        high2low: ''
      },
      mockData: [],
      stars: '',
      dynamicHeaders: [],
      checkedList: [],
      periodOptions: PERIOD_OPTIONS,
      rateList: [1, 2, 3, 4, 5],
      pageSize: 20,
      total: 0,
      currentPage: 1,
      maxlength: 200,
      nationId: '',
      nationList: [],
      statusId: '',
      statusList: ['Not Canceled', 'All', 'Pending', 'Unshipped', 'Shipped', 'Canceled'],
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
      headers: [],
      headersDownload: [],
      headerWidth: HEADER_WIDTH,
      dictCn: {
        purchaseDate: '购买时间',
        amazonOrderId: '订单号',
        orderStatus: '订单状态',
        asin: 'ASIN',
        productName: '产品名字',
        buyerName: '买家名字',
        buyerId: '买家ID',
        price: '订单价格',
        emailSent: '邮件数',
        quantityOrdered: '订单数量',
        countryCode: '国家',
        shopName: '店铺'
      },
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
    dictEn () {
      let dictEn = {}
      for (let prop in this.dictCn) {
        dictEn[this.dictCn[prop]] = prop
      }
      return dictEn
    }
  },
  created () {
    // this.search_val = this.$route.query.productId
    // this.shopId = this.$route.query.shopId
    this.orderStatus = 'Not Canceled'
    this.filter.status = ['Pending', 'Unshipped', 'Shipped']
    this.getShopList()
    this.getNationList()
  },
  mounted () {
  },
  methods: {
    // 改变排序方式
    changeSortItem (val) {
      this.filter.sortParam = val.prop
      if (val.order === 'descending') {
        this.filter.high2low = true
      } else {
        this.filter.high2low = false
      }
      this.getPageProducts()
    },
    // 重置查询条件
    resetSearch () {
      this.filter.orderId = ''
      this.filter.buyerId = ''
      this.filter.productId = ''
      this.orderStatus = ['Not Canceled']
      this.getPageProducts()
    },
    // 创建表格表头
    createHeader () {
      this.dynamicHeaders = ['purchaseDate', 'shopName', 'countryCode', 'amazonOrderId', 'orderStatus', 'asin', 'productName', 'buyerName', 'buyerId', 'price', 'quantityOrdered', 'emailSent']
      this.headers = this.dynamicHeaders
      const headersDownload = ['purchaseDate', 'shopName', 'countryCode', 'amazonOrderId', 'orderStatus', 'asin', 'productName', 'buyerName', 'buyerId', 'price', 'quantityOrdered', 'emailSent']
      this.headersDownload = headersDownload.map(h => this.dictCn[h] ? this.dictCn[h] : h)
    },
    // 订单状态改变操作
    orderStatusChange (evnet) {
      console.log(this.orderStatus)
      if (this.orderStatus === 'All') {
        this.filter.status = ['Pending', 'Unshipped', 'Shipped', 'Canceled']
      } else if (this.orderStatus === 'Not Canceled') {
        this.filter.status = ['Pending', 'Unshipped', 'Shipped']
      } else {
        this.filter.status = [this.orderStatus]
      }
      this.getPageProducts()
    },
    // 根据筛选条件查询数据
    searchGrid () {
      if (this.filter.orderId !== '' && this.filter.orderId !== undefined) {
        this.filter.buyerId = ''
        this.filter.productId = ''
        this.filter.shopId = ''
        this.filter.countryCode = ''
        this.filter.status = ['Pending', 'Unshipped', 'Shipped', 'Canceled']
        this.orderStatus = ['Not Canceled']
      }
      this.getPageProducts()
    },
    // 改变页面条数
    sizeChange (e) {
      this.pageSize = e
      this.getPageProducts()
    },
    // 改变当前页面
    currentChange (e) {
      this.currentPage = e
      this.getPageProducts()
    },
    // 更新可视列
    updateVisibleColumns () {
      this.showHideColumns(this.checkedList)
      // this.headers = this.checkedList
    },
    // 更新可视列
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
    // 获取订单数据
    getPageProducts () {
      let pagination = {
        pageSize: this.pageSize,
        currentPage: this.currentPage
      }
      pagination.filter = this.filter
      const period = this.filter.period
      this.$store.dispatch('setLoadingState', true)
      api.post('/api/product/orders', {pagination, period}).then(res => {
        if (res.status === 200 && res.data) {
          this.gridData = res.data.grid
          this.total = res.data.pagination.total
          this.createHeader()
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
    // 下载订单数据
    getDownload () {
      let pagination = {
        pageSize: 99999,
        currentPage: 1
      }
      pagination.filter = this.filter
      const period = this.filter.period
      api.post('/api/product/orders', {pagination, period}).then(res => {
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
      this.$sendDownloadHistory('订单查询')
      this.showDownload = false
    },
    // 修改下载状态
    changeDownloadStatus () {
      this.showDownload = true
      this.download = []
    },
    // 获取店铺列表
    getShopList () {
      api.get('/api/shop').then(res => {
        this.shopList = res.data
      })
    },
    // 获取国家列表
    getNationList () {
      api.get('/api/country').then(res => {
        this.nationList = res.data.grid
        this.nationListBK = this.nationList
      })
    },
    // searchBar变动后的自动更新数据
    searchBarChange (filter) {
      console.log('searchBarChange', filter)
      this.filter = {...this.filter, ...filter}
      this.currentPage = 1
      this.getPageProducts()
    },
    // error控制
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
<style>
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

