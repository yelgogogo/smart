<template>
  <div>
    <el-form ref="form">
      <search-bar :shopList="shopList" :nationList="nationList" :periodSelect="7" @onChange="searchBarChange($event)" ></search-bar>
        <el-row>
          <el-col :span="6" style="padding-right: 5px;">
            <el-form-item label="订单">
              <el-input
                class="shop-select"
                placeholder="输入订单号"
                clearable
                v-model="filter.orderId">
              </el-input>
            </el-form-item>
          </el-col> 
          <el-col :span="4" style="padding-right: 5px;">
            <el-form-item label="买家">
              <el-input
                class="nation-select"
                placeholder="请输入买家Id"
                clearable
                v-model="filter.buyerId">
              </el-input>
            </el-form-item>
          </el-col>  
 
          <el-col :span="6" :offset="1">
            <el-form-item label="产品ASIN">
                <el-input
                  placeholder="输入ASIN"
                  class="asin-input"
                  clearable
                  v-model="filter.productId">
                </el-input>
              </el-form-item>
          </el-col>
          <el-col :span="6" style="padding-right: 5px;">
              <el-form-item label="订单状态">
                <el-select clearable v-model="orderStatus" placeholder="选择状态" @change="orderStatusChange" class="shop-select">
                  <el-option
                    v-for="status in statusList"
                    :key="status"
                    :label="status"
                    :value="status">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          <el-col :span="24" :offset="0" class="text-right">
              <el-button type="primary" round icon="el-icon-search" @click="searchGrid">搜索</el-button>
              <el-button type="" round icon="el-icon-search" @click="searchGrid">重置</el-button>
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
            layout="sizes, total, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
          </el-col>
        <!-- <el-col :span="5" :offset="0" class="text-right"> -->
          <!-- <el-button size="mini" icon="el-icon-plus" @click="ExportCsv">导出表格</el-button> -->
          <!-- </el-col> -->
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
        <el-table v-if="gridData.length>0"
          border
          stripe
          :data="gridData">
          <el-table-column 
            v-for="(headerName, index) in dynamicHeaders" 
            :width="headerWidth[headerName]?headerWidth[headerName]:'100'"
            :key="headerName + '_' + index" 
            :label="dictEn[headerName]"
            v-if="dynamicHeaders.includes(headerName)">
            <template slot-scope="scope" v-if="scope.row[headerName]">
              {{scope.row[headerName]}}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="24">
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
    </el-row>
  </div>
</template>

<script>
import api from '../../utils/api'
import { Message } from 'element-ui'
import moment from 'moment'
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
        ordeId: ''
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
      statusList: ['All', 'Pending', 'Unshipped', 'Shipped', 'Canceled'],
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
      headerWidth: HEADER_WIDTH,
      dictEn: {
        date: '购买时间',
        orderId: '订单号',
        status: '订单状态',
        asin: 'ASIN',
        productName: '产品名字',
        buyerName: '买家名字',
        buyerId: '买家ID',
        quantity: '订单数量',
        price: '订单价格',
        country: '国家',
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
      }
    }
  },
  computed: {
    fieldsCn () {
      return this.headers
    }
  },
  created () {
    // this.search_val = this.$route.query.productId
    // this.shopId = this.$route.query.shopId

    this.getShopList()
    this.getNationList()
  },
  methods: {
    resetSearch () {
      this.filter = {...this.filter, ordeId: undefined, buyerId: undefined, productId: undefined}
      this.getPageProducts()
    },
    createHeader () {
      this.dynamicHeaders = ['date', 'shopName', 'country', 'orderId', 'status', 'asin', 'productName', 'buyerName', 'buyerId', 'quantity', 'price']
      this.headers = this.dynamicHeaders
    },
    orderStatusChange (evnet) {
      console.log(this.orderStatus)
      if (this.orderStatus === 'All') {
        this.filter.status = ['Pending', 'Unshipped', 'Shipped', 'Canceled']
      } else {
        this.filter.status = [this.orderStatus]
      }
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
    updateLu () {
      let format = 'YYYY-MM-DD'
      let start = moment().subtract(this.periodSelect, 'days').format(format)
      let end = moment().format(format)
      const status = this.getStatus

      console.log('updateLu', status, start, end)
      // this.searchField.period = {
      //   dateType: status.join(','),
      //   start: start,
      //   end: end
      // }
      // this.getPageWorkflows()
    },
    updateDateRangeValue () {
      console.log(this.dr)
    },
    saveWork () {
      let self = this
      self.form.sn = undefined
      api.post(`/api/suggestion`, self.form).then(res => {
        Message({
          showClose: true,
          message: '更新成功!',
          type: 'success'
        })
        self.dialogFormVisible = false
        self.getPageWorkflows(true)
      }).catch(err => {
        self.errorHandler(err, {code: 404, message: '产品未找到'})
      })
    },
    edit (row) {
      console.log(row)
      this.form = row
      this.dialogFormVisible = true
    },
    isNotLike (product) {
      return !this.likedProducts.find(p => {
        return product.asin === p.productId
      })
    },
    searchProduct () {
      this.getPageProducts()
    },
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
    },
    getDownload () {
      let pagination = {
        pageSize: 99999,
        currentPage: 1
      }
      pagination.filter = this.filter
      const period = this.filter.period
      api.post('/api/product/orders', {pagination, period}).then(res => {
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
      this.$sendDownloadHistory('订单查询')
    },
    getShopList () {
      api.get('/api/shop').then(res => {
        this.shopList = res.data
      })
    },
    getNationList () {
      api.get('/api/country').then(res => {
        this.nationList = res.data.grid
        this.nationListBK = this.nationList
      })
    },
    searchBarChange (filter) {
      console.log('searchBarChange', filter)
      this.filter = {...this.filter, ...filter}
      this.currentPage = 1
      this.getPageProducts()
    },
    updatePageProducts (currentPage) {
      this.currentPage = currentPage
      this.getPageProducts()
    },
    showHideLiked () {
      let filter = {
        productId: this.search_val,
        shopId: this.shopId,
        interestedOnly: this.isShowLiked ? 1 : undefined
      }
      this.getPageProducts(filter)
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

