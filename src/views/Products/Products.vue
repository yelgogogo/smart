<template>
  <div>
    <el-form ref="form" class="mini-class">
      <search-bar :shopList="shopList" :nationList="nationList" :periodSelect="7" @onChange="searchBarChange($event)" ></search-bar>
  <el-row>
        <el-col :span="6">
          <el-form-item>
            <el-checkbox v-model="filter.dimension.shop" @change="useShopChange">按店铺</el-checkbox>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <el-radio-group v-model="useOrderQuantity" @change="useOrderQuantityChange" :size="SELECT_SIZE">
              <el-radio label="order">按订单</el-radio>
              <el-radio label="quantity">按数量</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="5" class="text-left">
          <el-form-item>
            <el-checkbox v-model="interestedOnly" @change="showHideLiked" :size="SELECT_SIZE">只显示我关注的</el-checkbox>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-input
            :size="SELECT_SIZE"
            placeholder="请输入产品名称或者ASIN"
            v-model="filter.asinOrName"
            @clear="searchProduct"
            clearable>
            <el-button slot="append" icon="el-icon-search" @click="searchProduct">搜索</el-button>
          </el-input>
        </el-col>
      </el-row>
    </el-form>
    <el-row>
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
      <el-col :span="8" class="text-right">
        <el-button v-if="showDownload" size="mini" icon="el-icon-document" @click="getDownload">请求下载</el-button>
        <vue-csv-download
          v-else
          :data="download"
          :fields="headersDownload"
          class="download">
          <el-button size="mini" icon="el-icon-document" @click="changeDownloadStatus">下载</el-button>
        </vue-csv-download>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-table
          v-if="gridData.length > 0"
          :summary-method="getSummaries"
          border
          show-summary
          :data="gridData"
          :height="tableHeight" 
          @sort-change="changeSortItem">
            <el-table-column
              label="店铺"
              width="120"
              prop="shopName"
              fixed="left">
            </el-table-column>
            <el-table-column
              label="国家"
              width="45"
              prop="countryCode"
              fixed="left">
            </el-table-column>  
            <el-table-column
              label="ASIN"
              width="100"
              prop="ASIN"
              fixed="left"
              sortable>
              <template slot-scope="scope">
                <a :href="scope.row.url" target="_blank">{{scope.row.ASIN}}</a>
                <div v-for="cp in scope.row.competitors" :key="cp">
                  {{cp}}&nbsp;<el-tag type="success" size="mini">竞</el-tag> 
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="产品名称"
              width="300"
              fixed="left">
              <template slot-scope="scope">
                {{scope.row.productName}}
                <!-- <i class="el-icon-edit" @click="changeName(scope.row)"></i> -->
              </template>
            </el-table-column>
 
            <el-table-column v-for="orderData in dateList"
              :key="orderData.label"
              :label="orderData.label"
              width="100"
              :prop="orderData.label"
              sortable
              align="center">
            </el-table-column>
            <el-table-column
              label="合计"
              width="70"
              prop="totalCount"
              fixed="right"
              sortable
              align="center">
            </el-table-column>
            <el-table-column
              header-align="center"
              align="center"
              width="200"
              fixed="right"
              label="操作">
              <template slot-scope="scope">
                <el-button size="mini" round @click="add(scope.row)"  v-show="operationShow">
                  建议
                </el-button>
                <router-link :to="{path: '/main/edit-product', query: scope.row}">
                  <el-button size="mini" round  v-show="operationShow">
                    编辑
                  </el-button>
                </router-link>
                <router-link :to="{path: '/main/analysis', query: {productName:scope.row.productName,countryCode:scope.row.countryCode,marketplaceId: scope.row.marketplaceId, shopId: scope.row.shopId, productId: scope.row.ASIN}}">
                  <el-button size="mini" round  v-show="operationShow">
                    分析
                  </el-button>
                </router-link>
              </template>
            </el-table-column>
            <el-table-column
              width="45"
              fixed="right"
              label="关注"
              align="center">
              <template slot-scope="scope">
                <i class="el-icon-star-off large-icon" title="点击关注" v-if="isNotLike(scope.row)" @click="likeProduct(scope.row, true)"></i>
                <i class="el-icon-star-on large-icon" title="取消关注" v-else @click="likeProduct(scope.row, false)"></i>
              </template>              
            </el-table-column>
          </el-table>
      </el-col>
    </el-row>
    <el-dialog title="工作流" :visible.sync="dialogFormVisible">
        <el-form :model="form">
          <el-form-item label="ASIN" :label-width="formLabelWidth">
              {{form.ASIN}}
          </el-form-item>
          <!-- <el-form-item label="产品描述" :label-width="formLabelWidth">
              {{form.name}}
          </el-form-item> -->
          <el-form-item label="产品名称" :label-width="formLabelWidth">
            {{form.productName}}
          </el-form-item>
          <el-form-item label="优化类型" :label-width="formLabelWidth">
            <el-select v-model="form.optimizationType" placeholder="选择优化类型">
              <el-option
                v-for="option in optimizationTypes"
                :key="option"
                :label="option"
                :value="option">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="所属店铺" :label-width="formLabelWidth">
            {{form.shopName}}
          </el-form-item>
          <el-form-item label="所属国家" :label-width="formLabelWidth">
            {{form.marketplaceName}}
          </el-form-item>
          <el-form-item label="优先级" :label-width="formLabelWidth">
              <el-radio-group v-model="form.status">
                <el-radio label='normal'>普通</el-radio>
                <el-radio label='high'>高</el-radio>
              </el-radio-group>
          </el-form-item>
          <el-form-item label="建议主题" :label-width="formLabelWidth">
            <el-row>
              <el-col :span="10">
                <el-input v-model="form.title"></el-input>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="建议" :label-width="formLabelWidth">
              <el-input type="textarea" :maxlength="maxlength" :autosize="{ minRows: 3, maxRows: 5}" :placeholder="'请输入建议内容, 最大字数' + maxlength" v-model="form.suggestion"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>        
          <el-button type="primary" @click="saveWork" v-if="modalType === 'add'">保  存</el-button>
        </div>
      </el-dialog>
  </div>
</template>

<script>
import api from '../../utils/api'
import { Message } from 'element-ui'
import {PERIOD_OPTIONS, PERIOD_UNIT, SELECT_SIZE} from '../../utils/enum'
import VueCsvDownload from '@/components/csvDownload/csvDownload'
import moment from 'moment'
import searchBar from '@/components/search-bar/search-bar'

export default {
  components: {
    VueCsvDownload, searchBar
  },
  data () {
    return {
      SELECT_SIZE: SELECT_SIZE,
      tableHeight: window.innerHeight - 240,
      useOrderQuantity: 'quantity',
      dateList: [],
      useShop: null,
      status: 'normal',
      radio: 0,
      maxlength: 200,
      gridData: [],
      summaryData: [],
      periodSelect: 7,
      filter: {
        shopId: null,
        asinOrName: '',
        period: {
          start: '',
          end: ''
        },
        dimension: {
          shop: false,
          order: false,
          quantity: true
        },
        sortParam: '',
        high2low: ''
      },
      dr: null,
      nationId: '',
      periodOptions: PERIOD_OPTIONS,
      nationList: [],
      nationListBK: [],
      pageSize: 20,
      total: 0,
      currentPage: 1,
      pageProducts: [],
      search_val: undefined,
      shopId: undefined,
      interestedOnly: false,
      likedProducts: [],
      shopList: [],
      formLabelWidth: '120px',
      options: [],
      productType: '',
      modalType: 'add',
      dialogFormVisible: false,
      optimizationTypes: [],
      headersDownload: [],
      download: [],
      form: {
        status: 'normal',
        productId: '',
        shopId: undefined,
        productName: '',
        optimizationType: '',
        suggestion: '',
        title: '',
        sn: 1
      },
      dynamicHeaders: [],
      dictCn: {
        shopName: '店铺名称',
        ASIN: 'ASIN',
        productName: '产品名称',
        countryCode: '国家',
        totalCount: '合计'
      },
      operationShow: true,
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
    this.search_val = this.$route.query.productId
    this.filter.shopId = this.$route.query.shopId
    let format = 'YYYY-MM-DD'
    let start = moment().subtract(this.periodSelect, 'days').format(format)
    let end = moment().format(format)
    this.filter.period.start = start
    this.filter.period.end = end
    this.getShopList()
    this.getNationList()
    // if (this.search_val && this.shopId) {
    //   this.searchProduct()
    // } else {
    //   this.getPageProducts()
    // }
    this.listSuggestTypes()
  },
  methods: {
    createHeader (headers) {
      this.dynamicHeaders = ['shopName', 'countryCode', 'ASIN', 'productName', 'totalCount']
      let sort = []
      const noShow = ['orderList', 'marketplaceId', 'marketplaceName', 'shopId', 'url']
      for (let header in headers) {
        if (!this.dynamicHeaders.includes(header) && !noShow.includes(header)) {
          sort.push(header)
        }
      }
      sort = sort.sort((a, b) => {
        return a < b ? 1 : -1
      })
      console.log('sort', sort)

      this.dynamicHeaders = [...this.dynamicHeaders, ...sort]
      this.headers = this.dynamicHeaders
      const headersFixed = ['shopName', 'countryCode', 'ASIN', 'productName']
      const headersDownload = [...headersFixed, ...sort, 'totalCount']
      this.headersDownload = headersDownload.map(h => this.dictCn[h] ? this.dictCn[h] : h)
    },
    changeSortItem (val) {
      this.filter.sortParam = val.prop
      if (val.order === 'descending') {
        this.filter.high2low = true
      } else {
        this.filter.high2low = false
      }
      this.getPageProducts()
    },
    getSummaries (param) {
      const sums = ['合计', '', '', '']
      if (this.summaryData.length > 0) {
        for (let index = 0; index < this.summaryData.length; index++) {
          sums.push(this.summaryData[index].sum)
        }
      }
      return sums
    },
    useOrderQuantityChange () {
      console.log(this.useOrderQuantity, this.filter)
      this.filter.dimension.order = false
      this.filter.dimension.quantity = false
      this.filter.dimension[this.useOrderQuantity] = true
      console.log(this.useOrderQuantity, this.filter)
      this.getPageProducts()
    },
    useShopChange (event) {
      // this.filter.dimension = {shop: this.useShop}
      this.getPageProducts()
      if (event === true) {
        this.operationShow = false
      } else {
        this.operationShow = true
      }
      console.log(event)
    },
    searchBarChange (filter) {
      console.log('searchBarChange', filter)
      this.filter = {...this.filter, ...filter}
      if (this.filter.period.select === 120) {
        this.filter.period.unit = PERIOD_UNIT.WEEK
      } else if (this.filter.period.select === 183) {
        this.filter.period.unit = PERIOD_UNIT.MONTH
      } else {
        this.filter.period.unit = PERIOD_UNIT.DAY
      }
      this.currentPage = 1
      this.getPageProducts()
    },
    periodCustomizeChange () {
      console.log(this.dr)
      this.filter.period.start = this.dr[0]
      this.filter.period.end = this.dr[1]
      this.getPageProducts()
    },
    sizeChange (e) {
      this.pageSize = e
      this.getPageProducts()
    },

    periodChange () {
      if (this.periodSelect === 0) {
        return
      }
      let format = 'YYYY-MM-DD'
      let start = moment().subtract(this.periodSelect, 'days').format(format)
      let end = moment().format(format)
      // const status = this.getStatus
      this.filter.period.start = start
      this.filter.period.end = end
      this.getPageProducts()
      // this.searchField.period = {
      //   dateType: status.join(','),
      //   start: start,
      //   end: end
      // }
      // this.getPageWorkflows()
    },
    getShopName (shopId) {
      const finder = this.shopList.find(s => s.shopId === shopId)
      return finder ? finder.shopName : ''
    },
    listSuggestTypes () {
      api.get(`/api/suggest_type`).then(res => {
        this.optimizationTypes = res.data
      })
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
    add (row) {
      console.log(row)
      const {ASIN, productName, shopId, shopName, marketplaceName} = row
      this.modalType = 'add'
      this.dialogFormVisible = true
      this.form.productId = ASIN
      this.form.ASIN = ASIN
      this.form.productName = productName
      this.form.shopName = shopName
      this.form.shopId = shopId
      this.form.marketplaceName = marketplaceName
      this.form.optimizationType = ''
      this.form.suggestion = undefined
      this.form.title = undefined
    },
    isNotLike (product) {
      return !this.likedProducts.find(p => {
        return product.ASIN === p.productId
      })
    },
    searchProduct () {
      // let filter = {
      //   productId: this.filter.asinOrName,
      //   shopId: this.shopId
      // }
      this.getPageProducts()
    },
    getPageProducts () {
      let pagination = {
        pageSize: this.pageSize,
        currentPage: this.currentPage
      }
      pagination.filter = this.filter
      this.$store.dispatch('setLoadingState', true)
      api.post('/api/product/pagination', {pagination}).then(res => {
        if (res.status === 200 && res.data) {
          this.gridData = res.data.grid
          if (this.gridData.length > 0) {
            this.dateList = this.gridData[0].orderList
            this.createHeader(this.gridData[0])
          }
          this.total = res.data.pagination.total
          this.summaryData = res.data.summary
          this.listLikedProducts()
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
    getDownload () {
      let pagination = {
        pageSize: 99999,
        currentPage: 1
      }
      pagination.filter = this.filter
      api.post('/api/product/pagination', {pagination}).then(res => {
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
      this.$sendDownloadHistory('销量报表')
      this.showDownload = false
    },
    changeDownloadStatus () {
      this.showDownload = true
      this.download = []
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
    currentChange (currentPage) {
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
      // let filter = {
      //   productId: this.filter.asinOrName,
      //   shopId: this.shopId,
      //   interestedOnly: this.interestedOnly
      // }
      this.filter.interestedOnly = this.interestedOnly
      this.getPageProducts()
    },
    likeProduct (product, like) {
      let productInfo = {
        productId: product.ASIN,
        marketplaceId: product.marketplaceId,
        shopId: product.shopId
      }
      if (like === true) {
        api.post(`/api/interested`, productInfo).then(res => {
          if (res && res.status === 200) {
            Message({
              showClose: true,
              message: '更新成功',
              type: 'success'
            })
            this.listLikedProducts()
          }
        })
      } else {
        let interested = this.likedProducts.find(p => p.productId === product.ASIN)
        api.delete(`/api/interested/${interested.interestedId}`).then(res => {
          Message({
            showClose: true,
            message: '更新成功',
            type: 'success'
          })
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
<style>
.el-icon-star-off {
  color:#FF6600
}

.el-icon-edit {
  color:#FF6600
}

.el-icon-star-on {
  color:#FF6600
}

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

.radio-select {
  margin-top: 10px;
}
</style>

