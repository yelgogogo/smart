<template>
  <div>
    <el-form ref="form" class="mini-class">
      <!-- 通用搜索栏组件 -->
      <search-bar :shopList="shopList" :nationList="nationList" :periodSelect="7" @onChange="searchBarChange($event)" ></search-bar>
        <!-- 其他搜索栏 -->
        <el-row>
          <el-col :span="6" style="padding-right: 5px;">
            <el-form-item label="状态">
              <el-select clearable v-model="statusId" placeholder="选择状态" class="shop-select" @change="statusChange" :size="SELECT_SIZE">
                <el-option
                  v-for="status in statusList"
                  :key="status"
                  :label="status"
                  :value="status">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" style="padding-right: 5px;">
            <el-form-item label="星评">
              <el-select clearable v-model="star" placeholder="选择星评" class="rate-select" @change="starChange" :size="SELECT_SIZE">
                <el-option
                  v-for="rate in rateList"
                  :key="rate"
                  :label="rate"
                  :value="rate">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="10" :offset="1" style="padding-right: 5px;">
            <el-form-item label="选择用户" >
              <el-select clearable v-model="filter.userId" placeholder="选择用户" class="period-select" @change="userChange" :size="SELECT_SIZE">
                <el-option
                  v-for="user in userList"
                  :key="user.value"
                  :label="user.userName"
                  :value="user.userId">
                </el-option>
              </el-select>

            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6" style="padding-right: 5px;">
            <el-form-item label="买家">
              <el-input
                class="shop-select"
                placeholder="请输入买家Id"
                clearable
                v-model="filter.buyerId"
                :size="SELECT_SIZE">
              </el-input>
            </el-form-item>
          </el-col>  
          <el-col :span="4" style="padding-right: 5px;">
              <el-form-item label="订单">
                <el-input
                  class="nation-select"
                  placeholder="输入订单号"
                  clearable
                  v-model="filter.orderId"
                  :size="SELECT_SIZE">
                </el-input>
              </el-form-item>
            </el-col>  
          <el-col :span="6" :offset="1">
            <el-form-item label="产品ASIN">
                <el-input
                  placeholder="输入ASIN"
                  class="asin-input"
                  clearable
                  v-model="filter.productId"
                  :size="SELECT_SIZE">
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
            <!-- 分页器 -->
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
            :fixed="headerFixed[headerName]"
            :key="headerName + '_' + index" 
            :label="dictCn[headerName]"
            v-if="dynamicHeaders.includes(headerName)"
            :prop="headerName"
            :sortable="headerName==='reviewDate' || headerName==='asin' || headerName==='buyerId' || headerName==='text' || headerName==='star'
             || headerName==='amazonOrderId' || headerName==='author' || headerName==='title' || headerName==='lastUpdateDate'? 'custom':false"
            ref="sortTable">
            <template slot-scope="scope" v-if="scope.row[headerName]">
              <div v-if="headerName === 'title'"><a :href="scope.row.detailURL" target="_blank">{{scope.row[headerName]}}</a></div>
              <div v-else-if="headerName === 'author'"><a :href="scope.row.profileURL" target="_blank">{{scope.row[headerName]}}</a></div>
              <p v-else-if="headerName === 'productName'" :title="scope.row.productName" class="product-name" >{{scope.row[headerName]}}</p>
              <div v-else>{{scope.row[headerName]}}</div>
            </template>
          </el-table-column>
          <!-- 列表操作栏 -->
          <el-table-column
            header-align="center"
            align="center"
            label="操作">
            <template slot-scope="scope">
                <el-button size="mini" round @click="edit(scope.row)">
                  编辑
                </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!-- 反馈详情弹窗 -->
    <el-dialog title="反馈详情" :visible.sync="dialogFormVisible">
        <el-form :model="form">
          <el-form-item label="ASIN" :label-width="formLabelWidth">
              {{form.asin}}
          </el-form-item>
          <el-form-item label="Status" :label-width="formLabelWidth">
              <el-select v-model="form.status" placeholder="选择优化类型" :size="SELECT_SIZE">
                <el-option
                  v-for="option in statusList"
                  :key="option"
                  :label="option"
                  :value="option">
                </el-option>
              </el-select>
          </el-form-item>
          <el-form-item label="Stars" :label-width="formLabelWidth">
              {{form.star}}
          </el-form-item>
          <el-form-item label="Name" :label-width="formLabelWidth">
            {{form.author}}
          </el-form-item>
          <el-form-item label="Buyer Id" :label-width="formLabelWidth">
            {{form.buyerId}}
          </el-form-item>
          <el-form-item label="Title" :label-width="formLabelWidth">
            {{form.title}}
          </el-form-item>
          <el-form-item label="Review" :label-width="formLabelWidth">
              {{form.text}}
            </el-form-item>
          <el-form-item label="操作" :label-width="formLabelWidth">
            <div v-for="(msg, index) in reviewHistory" :key="index">
              {{ msg.date }} {{ msg.message }}
            </div>
            <!-- <div>2018-04-12 这个反馈处理 admin</div> -->
            <!-- <div>2018-04-13 这个反馈不要处理 Michael</div> -->
            <el-input type="textarea" :maxlength="maxlength" :autosize="{ minRows: 3, maxRows: 5}" :placeholder="'请输入建议内容, 最大字数' + maxlength" v-model="form.message"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>        
          <el-button type="primary" @click="saveFeedback">保  存</el-button>
        </div>
      </el-dialog>
  </div>
</template>

<script>
import api from '../../utils/api'
import { Message } from 'element-ui'
import moment from 'moment'
import VueCsvDownload from '@/components/csvDownload/csvDownload'
import {PERIOD_OPTIONS, HEADER_WIDTH, SELECT_SIZE} from '../../utils/enum.js'
import searchBar from '@/components/search-bar/search-bar'
import { mapGetters } from 'vuex'

export default {
  components: {
    VueCsvDownload, searchBar
  },
  data () {
    return {
      SELECT_SIZE: SELECT_SIZE,
      mockData: [
        // {sellerId: '11111-111', review: 'asdadasdasdasdasd', asin: 'xxxxxxxxx', country: 'UK', quantity: '1212', score: '5', reviewDate: '2018-04-12', status: 'xxxx', stars: '4', buyerId: '1212123', orderId: '121211212', name: 'asdasd', title: '1212t', operatorId: 11, lastUpdateTime: '2018-05-22 21:00:00'},
      ],
      tableHeight: window.innerHeight - 280,
      filter: {
        shopId: null,
        // asinOrName: '',
        period: {
          start: '',
          end: ''
        },
        countryCode: '',
        productId: '',
        buyerId: '',
        stars: 0,
        orderId: '',
        sortParam: '',
        high2low: ''
      },
      star: '',
      dynamicHeaders: {},
      checkedList: [],
      periodOptions: PERIOD_OPTIONS,
      rateList: ['All', 1, 2, 3, 4, 5],
      pageSize: 20,
      total: 0,
      currentPage: 1,
      maxlength: 200,
      nationId: '',
      nationList: ['US', 'UK', 'DE', 'FR', 'IT', 'ES', 'JP'],
      statusId: '',
      statusList: ['All', 'Active', 'Processing', 'Succeed', 'Failed', 'Deleted'],
      userId: '',
      userList: [],
      gridData: [],
      download: [],
      headersDownload: [],
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
      reviewHistory: [],
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
        reviewDate: '反馈日期',
        status: '状态',
        deleteDate: '删除日期',
        star: '星评',
        buyerId: '买家ID',
        amazonOrderId: '订单号',
        author: '买家',
        title: '标题',
        profileURL: '买家Profile',
        detailURL: '反馈链接',
        text: '反馈内容',
        operatorName: '操作人',
        lastUpdateDate: '操作时间'
      },
      headers: [],
      headerWidth: HEADER_WIDTH,
      headerFixed: {
        productName: 'left',
        countryCode: 'left',
        asin: 'left'
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
    ...mapGetters(['userInfo']),
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
    this.getShopList()
    this.getNationList()
    this.getUserList()
    console.log('this.dictEn', this.dictEn)
  },
  methods: {
    // 改变排序
    changeSortItem (val) {
      // console.log(val.prop + ' ' + val.order)
      // console.log(val)
      this.filter.sortParam = val.prop
      if (val.order === 'descending') {
        this.filter.high2low = true
      } else {
        this.filter.high2low = false
      }
      this.getPageProducts()
    },
    // 重置搜索
    resetSearch () {
      this.filter = { ...this.filter, buyerId: undefined, orderId: undefined, productId: undefined }
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
    // 切换用户
    userChange (value) {
      this.filter.userId = value
      this.getPageProducts()
    },
    // 创建表头
    createHeader () {
      this.dynamicHeaders = ['countryCode', 'asin', 'productName', 'reviewDate', 'status', 'deleteDate', 'star', 'buyerId', 'amazonOrderId', 'shopName', 'author', 'title', 'operatorName', 'lastUpdateDate']
      this.headers = this.dynamicHeaders
      const headersDownload = ['shopName', 'asin', 'countryCode', 'reviewDate', 'status', 'deleteDate', 'star', 'buyerId', 'amazonOrderId', 'author', 'profileURL', 'title', 'text', 'detailURL', 'operatorName', 'lastUpdateDate']
      this.headersDownload = headersDownload.map(h => this.dictCn[h] ? this.dictCn[h] : h)
    },
    // 状态过滤
    statusChange (e) {
      if (e === 'All') {
        this.filter.status = undefined
      } else {
        this.filter.status = e
      }
      this.getPageProducts()
    },
    // 国家列表
    getNationList () {
      api.get('/api/country').then(res => {
        this.nationList = res.data.grid
        this.nationListBK = this.nationList
      })
    },
    // 取反馈历史
    getReviewHistory (reviewId) {
      api.get(`/api/review/message/${reviewId}`).then(res => {
        this.reviewHistory = res.data.messages
      })
    },
    // 搜索栏变化
    searchBarChange (filter) {
      console.log('searchBarChange', filter)
      this.filter = {...this.filter, ...filter}
      this.currentPage = 1
      this.getPageProducts()
    },
    // 重置
    searchGrid () {
      if (this.filter.orderId !== '') {
        this.filter.buyerId = ''
        this.filter.productId = ''
        this.filter.shopId = ''
        this.filter.countryCode = ''
        this.filter.status = ''
        this.filter.star = ''
        this.filter.userId = ''
      }
      this.getPageProducts()
    },
    // 页面大小变化
    sizeChange (e) {
      this.pageSize = e
      this.getPageProducts()
    },
    // 当前页面变化
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
    // 改变时间
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
    // 改变范围
    updateDateRangeValue () {
      console.log(this.dr)
    },
    // 保存反馈
    saveFeedback () {
      let self = this
      // self.form.reviewId = this.userInfo.userId
      const params = {
        reviewId: self.form.reviewId,
        status: self.form.status,
        message: self.form.message
      }
      api.post(`/api/review/status`, params).then(res => {
        Message({
          showClose: true,
          message: '更新成功!',
          type: 'success'
        })
        self.dialogFormVisible = false
        // self.getPageWorkflows(true)
      }).catch(err => {
        self.errorHandler(err, {code: 404, message: '产品未找到'})
      })
    },
    // 编辑
    edit (row) {
      console.log(row)
      this.getReviewHistory(row.reviewId)
      this.form = row
      this.dialogFormVisible = true
    },
    // 取后台列表数据
    getPageProducts () {
      let pagination = {
        pageSize: this.pageSize,
        currentPage: this.currentPage
      }
      pagination.filter = this.filter
      const period = this.filter.period
      this.$store.dispatch('setLoadingState', true)

      api.post('/api/review', {pagination, period}).then(res => {
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
    // 取下载数据
    getDownload () {
      let pagination = {
        pageSize: 99999,
        currentPage: 1
      }
      pagination.filter = this.filter
      const period = this.filter.period
      api.post('/api/review', {pagination, period}).then(res => {
        if (res.status === 200 && res.data) {
          this.download = res.data.grid.map(d => {
            let download = {}
            for (let prop in d) {
              download[this.dictCn[prop]] = d[prop]
            }
            return download
          })
          console.log('this.download', this.download)
        }
      }).catch(err => {
        Message({
          showClose: true,
          message: err.response.statusText,
          type: 'error'
        })
      })
      this.$sendDownloadHistory('反馈详情')
      this.showDownload = false
    },
    // 改变下载状态
    changeDownloadStatus () {
      this.showDownload = true
      this.download = []
    },
    // 取店铺列表
    getShopList () {
      api.get('/api/shop').then(res => {
        this.shopList = res.data
      })
    },
    // 取用户列表
    getUserList () {
      let pagination = {
        pageSize: 1,
        currentPage: 50,
        filter: {
          fullName: '',
          userName: '',
          userRoleId: [],
          userStatus: 'active'
        }
      }
      api.post('/api/user/pagination', {pagination}).then(res => {
        this.userList = res.data.grid
      })
    },
    // 当前页面变化
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

