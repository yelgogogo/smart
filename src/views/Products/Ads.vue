<template>
  <div>
    <el-form ref="form" class="mini-class">
      <search-bar :shopList="shopList" :nationList="nationList" :periodSelect="7" @onChange="searchBarChange($event)" ></search-bar>
        <el-row>
          <el-col :span="5" style="padding-right: 5px;">
            <el-form-item label="ASIN">
              <el-input
                class="asin-input"
                placeholder="输入ASIN"
                clearable
                :size="SELECT_SIZE"
                v-model="filter.asin">
              </el-input>
            </el-form-item>
          </el-col> 
          <el-col :span="5" style="padding-right: 5px;">
            <el-form-item label="Campaign Name">
              <el-input
                class="campaignName-input"
                placeholder="输入Campaign Name"
                clearable
                :size="SELECT_SIZE"
                v-model="filter.campaignName">
              </el-input>
            </el-form-item>
          </el-col>  
          <el-col :span="5" :offset="1">
            <el-form-item label="Group Name">
                <el-input
                  placeholder="输入Group Name"
                  class="group-input"
                  clearable
                  :size="SELECT_SIZE"
                  v-model="filter.groupName">
                </el-input>
              </el-form-item>
          </el-col>
          <el-col :span="5" :offset="0" class="text-right">
              <el-button type="primary" round icon="el-icon-search" @click="searchGrid" :size="SELECT_SIZE">搜索</el-button>
              <el-button type="" round icon="el-icon-search" @click="resetSearch" :size="SELECT_SIZE">重置</el-button>
          </el-col>
        </el-row>          
        <el-row>
            <el-col :span="12">
                <el-form-item>
                    <el-radio-group v-model="useAsinCountryShop" @change="useAsinCountryShopChange" :size="SELECT_SIZE">
                        <el-radio label="inASIN">按ASIN</el-radio>
                        <el-radio label="inShop">按国家店铺</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
          <!-- <el-popover
            ref="showHideColumns"
            trigger="hover">
            <el-checkbox-group v-model="checkedList" @change="updateVisibleColumns">
              <el-checkbox v-for="(header, index) of headers" :key="index" :label="header" style="width: 100%;"></el-checkbox>
            </el-checkbox-group>
          </el-popover> -->
          <el-col :span="16">
            <el-pagination
            @size-change="sizeChange"
            @current-change="currentChange"
            :current-page="filter.pagination.currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="filter.pagination.pageSize"
            layout="sizes, total, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
          </el-col>
          <el-col :span="8" class="text-right">
            <!-- <el-button size="mini" v-popover:showHideColumns>显示/隐藏列</el-button> -->
            <el-button v-if="showDownload" size="mini" icon="el-icon-document" @click="getDownload">请求下载</el-button>
            <!-- <vue-csv-download
              v-else
              :data="download"
              :fields="headersDownload"
              class="download">
              <el-button size="mini" icon="el-icon-document" @click="changeDownloadStatus">下载</el-button>
            </vue-csv-download> -->
            <el-button size="mini" icon="el-icon-upload" @click="uploadDialogDisplay = true">广告上传</el-button>
            <el-button size="mini" icon="el-icon-delete" @click="adsDataDel">删除</el-button>
          </el-col>
        </el-row>
      </el-form>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-table v-if="gridData.length>0"
          :height="tableHeight" 
          stripe
          border
          :data="gridData"
          @sort-change="changeSortItem">
          <el-table-column 
            v-for="(headerName, index) in dynamicHeaders" 
            :width="headerWidth[headerName]?headerWidth[headerName]:'80'"
            :key="headerName + '_' + index" 
            :label="dictCn[headerName]"
            v-if="dynamicHeaders.includes(headerName)"
            :prop="headerName"
            :sortable="headerName==='Date' || headerName==='Campaign Name' || headerName==='Ad Group Name' || headerName==='Advertised SKU'
             || headerName==='Advertised ASIN' || headerName==='Impressions' || headerName==='Clicks' || headerName==='Click-Thru Rate (CTR)'
             || headerName==='Cost Per Click (CPC)' || headerName==='Spend' || headerName==='Total Sales' || headerName==='Total Orders'
             || headerName==='Total Advertising Cost of Sales (ACoS)'? 'custom':false"
            align = center
            :fixed="headerName === 'Shop' || headerName === 'Country' || (headerName === 'Currency' && useAsinCountryShop === 'inShop') 
            || headerName === 'Type' || headerName === 'Advertised ASIN' || headerName === 'Advertised SKU'? 'left' : false">
            <template slot-scope="scope" v-if="scope.row[headerName]">
              <p v-if="headerName === 'Advertised SKU'" :title="scope.row['Advertised SKU']" class="product-name" >{{scope.row[headerName]}}</p>
              <p v-else-if="headerName === 'Campaign Name'" :title="scope.row['Campaign Name']" class="product-name" >{{scope.row[headerName]}}</p>
              <p v-else-if="headerName === 'Ad Group Name'" :title="scope.row['Ad Group Name']" class="product-name" >{{scope.row[headerName]}}</p>
              <span v-else>{{ scope.row[headerName] }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-dialog title="广告上传" width="30%" :visible.sync="uploadDialogDisplay">
      <el-upload
        name="advertise"
        :on-success="onSuccess"
        :on-error="onError"
        :headers="getAuthHeaders()"
        :action="getUploadUrl()">
        <el-button size="mini" icon="el-icon-upload">广告上传</el-button>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogDisplay = false">取 消</el-button>
        <el-button type="primary" @click="uploadDialogDisplay = false">完 成</el-button>      
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from '../../utils/api'
import { Message } from 'element-ui'
// import moment from 'moment'
import VueCsvDownload from '@/components/csvDownload/csvDownload'
import {PERIOD_OPTIONS, ADS_HEADER_WIDTH, SELECT_SIZE} from '../../utils/enum'
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
      download: [],
      useAsinCountryShop: 'inShop',
      filter: {
        shopId: '',
        asin: '',
        campaignName: '',
        groupName: '',
        period: {
          start: '',
          end: ''
        },
        dimension: {
          inASIN: false,
          inShop: true
        },
        pagination: {
          pageSize: 20,
          currentPage: 1
        },
        countryCode: '',
        sortParam: '',
        high2low: ''
      },
      dynamicHeaders: [],
      checkedList: [],
      periodOptions: PERIOD_OPTIONS,
      nationList: [],
      total: 0,
      gridData: [],
      shopId: undefined,
      shopList: [],
      options: [],
      periodSelect: 7,
      headers: [],
      headersDownload: [],
      headerWidth: ADS_HEADER_WIDTH,
      showDownload: true,
      uploadDialogDisplay: false,
      dictCn: {
        'Shop': 'Shop',
        'Country': 'Country',
        'Advertised ASIN': 'Advertised ASIN',
        'Advertised SKU': 'Advertised SKU',
        'Date': 'Date',
        'Currency': 'Currency',
        'Campaign Name': 'Campaign Name',
        'Ad Group Name': 'Ad Group Name',
        'Impressions': 'Impressions',
        'Clicks': 'Clicks',
        'Click-Thru Rate (CTR)': 'Click-Thru Rate (CTR)',
        'Cost Per Click (CPC)': 'Cost Per Click (CPC)',
        'Spend': 'Spend',
        'Total Sales': 'Total Sales',
        'Total Advertising Cost of Sales (ACoS)': 'Total Advertising Cost of Sales (ACoS)',
        'Total Orders': 'Total Orders (#)',
        'Type': 'Type',
        'total': '合计'
      },
      byCountryShop: ['Shop', 'Country', 'Currency', 'Type'],
      byASIN: ['Shop', 'Country', 'Advertised ASIN', 'Advertised SKU', 'Date', 'Currency', 'Campaign Name', 'Ad Group Name', 'Impressions',
        'Clicks', 'Click-Thru Rate (CTR)', 'Cost Per Click (CPC)', 'Spend', 'Total Sales', 'Total Advertising Cost of Sales (ACoS)', 'Total Orders']
    }
  },
  created () {
    this.getShopList()
    this.getNationList()
  },
  mounted () {
  },
  methods: {
    getUploadUrl () {
      return api.baseURL + '/api/advertisement_data'
    },
    getAuthHeaders () {
      let headers = {}
      headers[api.tokenKey] = api.getToken()
      return headers
    },
    onSuccess (response, file, fileList) {
      console.log(response, file, fileList)
      if (response === 'ok') {
        this.$message({
          type: 'success',
          message: '上传数据成功!'
        })
        this.getPageAds()
      } else if (response.info.includes('是否确定上传并覆盖以前数据')) {
        const uuid = response.uuid
        const original = response.original
        const override = true
        this.$confirm('是否确定上传并覆盖以前数据?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          api.post('/api/advertisement_data_override', {uuid, original, override}).then(res => {
            if (res.status === 200 && res.data) {
              this.$message({
                type: 'success',
                message: '覆盖上传成功!'
              })
              this.getPageAds()
            }
          }).catch(err => {
            Message({
              showClose: true,
              message: err.response.statusText,
              type: 'error'
            })
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消上传'
          })
        })
      }
    },
    onError (err, file, fileList) {
      switch (err.status) {
        case 400: this.$message.error('400 ERROR')
          break
        case 401: this.$message.error('店铺/国家权限不匹配')
          break
      }
    },
    adsDataDel () {
      this.$confirm('是否确定删除当前广告数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const shopId = this.filter.shopId
        const asin = this.filter.asin
        const campaignName = this.filter.campaignName
        const groupName = this.filter.groupName
        const countryCode = this.filter.countryCode
        const period = this.filter.period
        api.post('/api/advertisement_data_delete', {shopId, asin, campaignName, groupName, countryCode, period}).then(res => {
          if (res.status === 200 && res.data) {
            this.$message({
              type: 'success',
              message: '删除数据成功!'
            })
          }
          this.getPageAds()
          this.$store.dispatch('setLoadingState', false)
        })
      }).catch(() => {
        Message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    changeSortItem (val) {
      this.filter.sortParam = val.prop
      if (val.order === 'descending') {
        this.filter.high2low = true
      } else {
        this.filter.high2low = false
      }
      this.getPageAds()
    },
    resetSearch () {
      this.filter.asin = ''
      this.filter.campaignName = ''
      this.filter.groupName = ''
      this.getPageAds()
    },
    createHeader (headers) {
      this.filter.dimension.inASIN === true ? this.dynamicHeaders = this.byASIN : this.dynamicHeaders = this.byCountryShop
      if (this.filter.dimension.inASIN === true) {
        this.dynamicHeaders = this.byASIN
      } else if (this.filter.dimension.inShop === true) {
        let tmpHeader = []
        this.dynamicHeaders = this.byCountryShop
        for (let header in headers) {
          if (!this.dynamicHeaders.includes(header) && header !== 'Values' && header !== 'total') {
            tmpHeader.push(header)
            this.$set(this.dictCn, header, header)
          }
        }
        tmpHeader = tmpHeader.sort((a, b) => {
          return a < b ? 1 : -1
        })
        this.dynamicHeaders = this.dynamicHeaders.concat(tmpHeader).concat('total')
      }
      this.headers = this.dynamicHeaders
      const headersDownload = []
      this.headersDownload = headersDownload.map(h => this.dictCn[h] ? this.dictCn[h] : h)
    },
    useAsinCountryShopChange () {
      console.log(this.useAsinCountryShop, this.filter)
      this.filter.dimension.inASIN = false
      this.filter.dimension.inShop = false
      this.filter.dimension[this.useAsinCountryShop] = true
      console.log(this.useAsinCountryShop, this.filter)
      this.getPageAds()
    },
    searchGrid () {
      if (this.filter.asin !== '' && this.filter.asin !== undefined) {
        this.filter.campaignName = ''
        this.filter.groupName = ''
        this.filter.shopId = ''
        this.filter.countryCode = ''
      }
      this.getPageAds()
    },
    sizeChange (e) {
      this.filter.pagination.pageSize = e
      this.getPageAds()
    },
    currentChange (e) {
      this.filter.pagination.currentPage = e
      this.getPageAds()
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
    getPageAds () {
      const period = this.filter.period
      this.$store.dispatch('setLoadingState', true)
      api.post('/api/advertisement/pagination', {...this.filter, period}).then(res => {
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
      this.showDownload = true
    },
    getDownload () {
      api.post('/api/advertisement_data_download', this.filter, {responseType: 'blob'}).then(res => {
        if (res.status === 200 && res.data) {
          // let blob = new Blob([res.data], {type: 'application/vnd.ms-excel'})
          // let objectUrl = URL.createObjectURL(blob)
          // window.location.href = objectUrl
          var filename = 'ads'
          let url = window.URL.createObjectURL(res.data)
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('download', filename + '.xlsx')
          document.body.appendChild(link)
          link.click()
        }
      }).catch(err => {
        Message({
          showClose: true,
          message: err.response.statusText,
          type: 'error'
        })
      })
      this.$sendDownloadHistory('广告数据')
      // this.showDownload = false
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
      })
    },
    searchBarChange (filter) {
      console.log('searchBarChange', filter)
      this.filter = {...this.filter, ...filter}
      this.filter.pagination.currentPage = 1
      this.getPageAds()
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

.campaignName-input {
  width: 140px!important;
}
.el-icon-star-on {
  color:#FF6600
}

.group-input {
  width: 140px!important;
}
.rate-select {
  width: 110px!important;
}

.period-select {
  width: 150px!important;
}

.asin-input {
  width: 155px!important;
}
.el-checkbox+.el-checkbox {
  margin-left: 0!important;
}
</style>

