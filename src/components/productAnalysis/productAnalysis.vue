<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="本产品" name="sales">
        <el-row>
          <el-col :span="24" style="padding-top: 0;">
            <chart 
              :options="statisticsBar"
              :init-options="initOptions"
              @legendselectchanged="onClick($event)"
              auto-resize
              />
            </el-col>
          </el-row>         
        </el-tab-pane>
        <el-tab-pane label="广告" name="advertising">
          <el-row>
            <el-col :span="24" style="padding-top: 0;">
              <chart 
                :options="adBar"
                :init-options="initOptions"
                @legendselectchanged="onClick($event)"
                auto-resize
                />
            </el-col>
          </el-row>         
        </el-tab-pane>
        <el-tab-pane label="每日QA" name="qaDaily">
          <el-row>
            <el-col :span="24" style="padding-top: 0;">
              <chart 
                :options="optionCreate(dailyQa)"
                :init-options="initOptions"
                auto-resize
                />
            </el-col>
          </el-row>         
        </el-tab-pane>
        <el-tab-pane label="每日反馈" name="feedbackDaily">
          <el-row>
            <el-col :span="24" style="padding-top: 0;">
              <chart 
                :options="optionCreate(dailyFeedback)"
                :init-options="initOptions"
                auto-resize
                />
            </el-col>
          </el-row>         
        </el-tab-pane>
        <el-tab-pane v-for="ca of categories" :key="ca" :label="getTabName(ca)" :name="ca">
          <el-row v-if="showChartCategory">
            <el-col :span="24" style="padding-top: 0">
              <chart 
              :options="categoryBar(ca)"
              :init-options="initOptions"
              auto-resize
            />
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane v-for="kw of keywords" :key="kw" :label="getTabName(kw)" :name="kw">
        <el-row v-if="showChartKeyword">
          <el-col :span="24" style="padding-top: 0;">
            <chart 
              :options="categoryBar(kw)"
              :init-options="initOptions"
              auto-resize
            />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <el-row class="analysis-table-header">
      <el-popover
        ref="showHideColumns"
        trigger="hover">
        <el-checkbox-group v-model="checkedList" @change="updateVisibleColumns">
          <el-checkbox v-for="(header, index) of headers" :key="index" :label="header" style="width: 100%;" name="123"></el-checkbox>
        </el-checkbox-group>
      </el-popover>
      <el-col :span="20">
        <el-form>
          <product-search 
            @onChange="onSearchChange"
          ></product-search>
        </el-form>
      </el-col>
      <el-col :span="4" class="text-right">
          <el-button size="mini" v-popover:showHideColumns>显示/隐藏列</el-button>
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

    <el-pagination
      @size-change="sizeChange"
      @current-change="currentChange"
      :current-page="currentPage"
      :page-sizes="[20, 50, 100]"
      :page-size="pageSize"
      layout="sizes, total, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <el-table 
      border
      stripe
      :data="gridData">
      <el-table-column 
        v-for="(headerName, index) in dynamicHeaders" 
        :width="headerWidth[headerName.en]?headerWidth[headerName.en]:'100'"
        :key="headerName.en + '_' + index" 
        :label="headerName.cn">
        <template slot-scope="scope" v-if="scope.row[headerName.en]">
          {{scope.row[headerName.en]}}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChange"
      @current-change="currentChange"
      :current-page="currentPage"
      :page-sizes="[20, 50, 100]"
      :page-size="pageSize"
      layout="sizes, total, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>

<script>
import 'echarts/lib/component/markPoint'
import 'echarts/lib/component/markLine'
import 'echarts/lib/component/markArea'
import api from '@/utils/api'
import productSearch from '@/components/productSearch/productSearch'
import { Message } from 'element-ui'
import {HEADER_WIDTH} from '../../utils/enum'
import VueCsvDownloader from 'vue-csv-downloader'
import {PERIOD_UNIT} from '@/utils/enum'

export default {
  components: {
    VueCsvDownloader,
    productSearch
  },
  data () {
    return {
      download: [],
      fieldsCn: [],
      checkedList: [],
      dailyQa: [],
      dailyFeedback: [],
      activeName: 'sales',
      currentPage: 1,
      pageSize: 20,
      total: 0,
      filter: {
        period: {
          start: '',
          end: ''
        },
        productId: this.$route.query.productId,
        shopId: parseInt(this.$route.query.shopId),
        countryCode: this.$route.query.countryCode,
        marketplaceId: this.$route.query.marketplaceId,
        unit: PERIOD_UNIT.DAY
      },
      salesUnit: 5,
      showChartCategory: false,
      showChartKeyword: false,
      statisticsQuery: null,
      productName: this.$route.query.productName,
      productId: this.$route.query.productId,
      shopId: this.$route.query.shopId,
      categories: [],
      keywords: [],
      headers: [],
      dateRange: [],
      legends: [],
      dynamicHeaders: [],
      fields: [ ],
      dictEn: {
        '日期': 'label',
        '订单': 'orders',
        'adSalsesByAdDivSale': 'Ad_SalesByAd_Div_Sales',
        'adSpend': 'Ad_Spend',
        'adSpendDivSales': 'Ad_Spend_Div_Sales',
        '广告总数量': 'Ad_TotalQuantity',
        '广告总销量': 'Ad_TotalSales',
        '广告总带动销量': 'Ad_TotalSalesByAd',
        '浏览量': 'Page Views',
        '浏览率': 'Page Views Percentage',
        'QA': 'QA',
        'session率': 'Session Percentage',
        'Sessions': 'Sessions',
        'unitSessionPercentage': 'Unit Session Percentage',
        '评分': 'score',
        '价格': 'price',
        '订单量': 'quantity_ordered',
        '反馈': 'reviews'
      },
      dictCn: {
        'label': '日期',
        'orders': '订单',
        'Ad_SalesByAd_Div_Sales': 'adSalsesByAdDivSale',
        'Ad_Spend': 'adSpend',
        'Ad_Spend_Div_Sales': 'adSpendDivSales',
        'Ad_TotalQuantity': '广告总数量',
        'Ad_TotalSales': '广告总销量',
        'Ad_TotalSalesByAd': '广告总带动销量',
        'Page Views': '浏览量',
        'Page Views Percentage': '浏览率',
        'QA': 'QA',
        'Session Percentage': 'session率',
        'Sessions': 'Sessions',
        'Unit Session Percentage': 'unitSessionPercentage',
        'score': '评分',
        'price': '价格',
        'quantity_ordered': '订单量',
        'reviews': '反馈'
      },
      headersArray: [
        {en: 'label', cn: '日期', show: true},
        {en: 'orders', cn: '订单', show: true},
        {en: 'Ad_SalesByAd_Div_Sales', cn: 'adSalsesByAdDivSale', show: false},
        {en: 'Ad_Spend', cn: 'adSpend', show: false},
        {en: 'Ad_Spend_Div_Sales', cn: 'adSpendDivSales', show: false},
        {en: 'Ad_TotalQuantity', cn: '广告总数量', show: false},
        {en: 'Ad_TotalSales', cn: '广告总销量', show: false},
        {en: 'Ad_TotalSalesByAd', cn: '广告总带动销量', show: false},
        {en: 'Page Views', cn: '浏览量', show: true},
        {en: 'Page Views Percentage', cn: '浏览率', show: true},
        {en: 'QA', cn: 'QA', show: true},
        {en: 'Session Percentage', cn: 'session率', show: true},
        {en: 'Sessions', cn: 'Sessions', show: true},
        {en: 'Unit Session Percentage', cn: 'unitSessionPercentage', show: true},
        {en: 'score', cn: '评分', show: true},
        {en: 'price', cn: '价格', show: true},
        {en: 'quantity_ordered', cn: '订单量', show: true},
        {en: 'reviews', cn: '反馈', show: true}
      ],
      headerWidth: HEADER_WIDTH,
      gridData: [],
      currentStatistics: [],
      competitionStatistics: [],
      chartTitle: '',
      initOptions: {
        renderer: 'svg'
      },
      workFlow: [],
      toolBoxOptions: {
        show: true,
        top: 0,
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          // dataView: {readOnly: false},
          magicType: {type: ['line', 'bar']},
          restore: {}
        }
      }
    }
  },
  created () {
    this.statisticsQuery = this.$route.query
    this.statisticsQuery.shopId = parseInt(this.statisticsQuery.shopId)
    // this.getSuggestion()
  },
  methods: {
    updateVisibleColumns () {
      const checkList = this.checkedList.map(c => this.dictEn[c])
      this.headersArray.forEach(h => {
        if (checkList.includes(h.en)) {
          h.show = true
        } else {
          h.show = false
        }
      })
      this.dynamicHeaders = this.headersArray.filter(h => h.show)
    },
    createHeader () {
      this.dynamicHeaders = this.headersArray.filter(h => h.show)
      this.headers = this.headersArray.map(e => e.cn)
      this.checkedList = this.dynamicHeaders.map(e => e.cn)
    },
    sizeChange (pageSize) {
      this.pageSize = pageSize
      this.getPageData()
    },
    currentChange (currentPage) {
      this.currentPage = currentPage
      this.getPageData()
    },
    onClick (evnet, e) {
      console.log(event, e, window.VueECharts)
      console.log(event.componentType)
    },
    showHideColumns (newHeaders) {
    },
    handleClick (tab, event) {
      this.showChartCategory = false
      this.showChartKeyword = false
      this.chartTitle = tab.name
      if (tab.name.indexOf('category:') !== -1) {
        setTimeout(() => { this.showChartCategory = true }, 0)
      } else if (tab.name.indexOf('keyword:') !== -1) {
        setTimeout(() => { this.showChartKeyword = true }, 0)
      }
      console.log(tab, event)
    },
    getTabName (name) {
      console.log('getTabName', name)
      const arr = name.split(' > ')
      let txt1 = ''
      if (name.substring(0, 8) === 'category') {
        txt1 = '类目' + arr.length
      } else {
        txt1 = '关键字'
      }
      return txt1
    },
    getSuggestion () {
      api.get(`/api/suggestion/all/${this.shopId}/${this.productId}`).then(res => {
        this.$store.dispatch('setLoadingState', false)
        if (res.status === 200 && res.data) {
          console.log('suggestion', res)
          this.workFlow = res.data.filter(r => r.operation === 'finished')
        }
      }).catch(err => {
        this.$store.dispatch('setLoadingState', false)
        Message({
          showClose: true,
          message: err.response.statusText,
          type: 'error'
        })
      })
    },
    onSearchChange (filter) {
      console.log('onSearchChange', filter, this.filter)
      this.filter = {...this.filter, ...filter}
      this.getGridData()
      this.getPageData()
    },
    getPageData () {
      let pagination = {
        pageSize: this.pageSize,
        currentPage: this.currentPage
      }
      const period = this.filter.period
      this.$store.dispatch('setLoadingState', true)

      api.post('/api/product/chart', {pagination, ...this.filter, period}).then(res => {
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
          message: err.response,
          type: 'error'
        })
      })
    },
    getGridData () {
      let self = this
      this.$store.dispatch('setLoadingState', true)
      api.post('/api/product/statistics', this.filter).then(res => {
        if (res.status === 200 && res.data) {
          this.currentStatistics = res.data
          api.post('/api/product/competition', this.filter).then(res1 => {
            this.$store.dispatch('setLoadingState', false)
            if (res1.status === 200 && res1.data) {
              self.competitionStatistics = res1.data
              this.dailyQa = []
              this.dailyFeedback = []
              self.competitionStatistics.forEach(c => {
                c.name = c.id
                const finderQa = c.info.find(i => i.name === 'QA')
                this.dailyQa.push({
                  name: c.name,
                  info: finderQa.info
                })
                const finderFeedback = c.info.find(i => i.name === 'QA')
                this.dailyFeedback.push({
                  name: c.name,
                  info: finderFeedback.info
                })
              })
              self.parseCategories()
              self.parseStatisticsTableData()
            }
          }).catch(err => {
            this.$store.dispatch('setLoadingState', false)
            Message({
              showClose: true,
              message: err.response,
              type: 'error'
            })
          })
        }
      }).catch(err => {
        Message({
          showClose: true,
          message: err.response,
          type: 'error'
        })
        this.$store.dispatch('setLoadingState', false)
      })
    },
    getDownload () {

    },
    parseCategories () {
      console.log('parseCategories')
      const statistics = this.competitionStatistics[0].info
      console.log(this.competitionStatistics, Array.isArray(statistics), statistics.length)
      let self = this
      if (Array.isArray(statistics) && statistics.length > 0) {
        self.categories = []
        self.keywords = []
        console.log('parseCategories', statistics)
        statistics.map((dt, index) => {
          console.log(dt.name)
          if (dt.name &&
            typeof dt.name === 'string') {
            self.legends.push(dt.name)
            if (dt.name.startsWith('category:') === true) {
              // dt.name.substr(10)
              self.categories.push(dt.name)
              self.categories.sort((a, b) => a.split(' > ').length > b.split(' > ').length ? 1 : -1)
            }
            if (dt.name.startsWith('keyword:') === true) {
              // dt.name.substr(9)
              self.keywords.push(dt.name)
            }
          }
        })
      }
    },
    parseStatisticsTableData () {
      var self = this
      if (Array.isArray(self.currentStatistics) && self.currentStatistics.length > 0) {
        var productsData = {}

        self.currentStatistics.map(dt => {
          dt.info.map((io, index) => {
            if (!productsData[io.label]) {
              productsData[io.label] = {}
            }
            if (!self.dynamicHeaders[dt.name]) {
              self.dynamicHeaders[dt.name] = true
            }
            productsData[io.label][dt.name] = Object.create(io)
          })
        })

        // transform object to array
        self.productsData = []
        for (let x in productsData) {
          var item = productsData[x]
          // console.log(item)
          for (let prop in item) {
            // console.log(prop, item[prop])
            item[prop] = item[prop].value
          }
          self.productsData.push({
            date: x,
            ...item
          })
        }
        self.productsData.sort((a, b) => {
          if (a.date > b.date) return -1
          if (a.date < b.date) return 1
          return 0
        })
        return productsData
      }
    },
    categoryBar (tabName) {
      // only process active tab
      if (this.activeName === tabName) {
        let composedArry = []
        this.competitionStatistics.map(pro => {
          let params = pro.info.filter(param => param.name === tabName)
          composedArry.push({
            id: pro.id,
            data: params.length === 0 ? [] : params[0].info
          })
        })
        composedArry.forEach(c => {
          c.data.forEach(d => {
            delete d.rate
          })
        })
        return {
          title: {
            text: this.chartTitle,
            top: 40
          },
          legend: {
            top: 90,
            data: composedArry.map(dt => dt.id)
          },
          grid: {
            top: 140
          },
          toolbox: this.toolBoxOptions,
          xAxis: {
            type: 'category',
            boundaryGap: false,
            minInterval: 1,
            data: composedArry[0].data.map(dt => dt.label)
          },
          yAxis: {
            // inverse: true,
            type: 'value'
          },
          tooltip: {
            trigger: 'axis'
          },
          series: composedArry.map(dt => {
            let name = dt.id
            let type = 'line'
            let markPoint = {
              clickable: true,
              data: this.workFlow.map(m => {
                return {
                  name: m.suggestTitle, value: m.suggestTitle, xAxis: m.date, yAxis: composedArry[0].data.find(dt => dt.label === m.date).value
                }
              })
            }
            let data = dt.data.map(i => i.value)
            return {name, type, markPoint, data}
          })
        }
      }
      return {}
    },
    optionCreate (inArray) {
      var self = this
      if (Array.isArray(inArray) && inArray.length > 0) {
        return {
          tooltip: {
            trigger: 'axis',
            formatter: (params) => {
              let res = '' + params[0].name + '</br>'
              params.forEach(param => {
                res = res + param.seriesName + ': ' + inArray[param.seriesIndex].info[param.dataIndex].value + '</br>'
              })
              return res
            }
          },
          legend: {
            data: inArray.map(dt => dt.name),
            top: 30
          },
          grid: {
            top: 150
          },
          toolbox: self.toolBoxOptions,
          xAxis: {
            type: 'category',
            boundaryGap: false,
            minInterval: 1,
            data: inArray[0].info.map(dt => dt.label)
          },
          yAxis: {
            type: 'value'
          },
          series: inArray.map(dt => {
            let name = dt.name
            let type = 'line'
            let markPoint = {
              clickable: true,
              data: this.workFlow.map(m => {
                return {
                  name: m.suggestTitle, value: m.suggestTitle, xAxis: m.date, yAxis: 0
                }
              })
            }
            let data = dt.info.map(i => i.value)
            return {name, type, markPoint, data}
          })
        }
      }
    }
  },
  computed: {
    adBar () {
      var self = this
      if (Array.isArray(self.currentStatistics) && self.currentStatistics.length > 0) {
        var selected = {}
        self.currentStatistics.filter(f => f.name.startsWith('Ad')).map((dt, index) => {
          if (index < 3) {
            selected[dt.name] = true
          } else {
            selected[dt.name] = false
          }
        })
        return {
          tooltip: {
            trigger: 'axis',
            formatter: (params) => {
              let res = '' + params[0].name + '</br>'
              params.forEach(param => {
                res = res + param.seriesName + ': ' + self.currentStatistics[param.seriesIndex].info[param.dataIndex].value + '</br>'
              })
              return res
            }
          },
          legend: {
            data: self.currentStatistics.map(dt => dt.name).filter(f => f.startsWith('Ad')),
            top: 30,
            selected: selected
          },
          grid: {
            top: 150
          },
          toolbox: self.toolBoxOptions,
          xAxis: {
            type: 'category',
            boundaryGap: false,
            minInterval: 1,
            data: self.currentStatistics[0].info.map(dt => dt.label)
          },
          yAxis: {
            type: 'value'
          },
          series: self.currentStatistics.map(dt => {
            let name = dt.name
            let type = 'line'
            let markPoint = {
              clickable: true,
              data: this.workFlow.map(m => {
                return {
                  name: m.suggestTitle, value: m.suggestTitle, xAxis: m.date, yAxis: 0
                }
              })
            }
            let data = dt.info.map(i => i.rate)
            return {name, type, markPoint, data}
          })
        }
      }
    },
    statisticsBar () {
      var self = this
      if (Array.isArray(self.currentStatistics) && self.currentStatistics.length > 0) {
        var selected = {}
        self.currentStatistics.map((dt, index) => {
          if (index < 3) {
            selected[dt.name] = true
          } else {
            selected[dt.name] = false
          }
        })
        return {
          title: {
            text: this.productName
          },
          tooltip: {
            trigger: 'axis',
            formatter: (params) => {
              let res = '' + params[0].name + '</br>'
              params.forEach(param => {
                res = res + param.seriesName + ': ' + self.currentStatistics[param.seriesIndex].info[param.dataIndex].value + '</br>'
              })
              return res
            }
          },
          legend: {
            data: self.currentStatistics.map(dt => dt.name),
            top: 30,
            selected: selected
          },
          grid: {
            top: 150
          },
          toolbox: self.toolBoxOptions,
          xAxis: {
            type: 'category',
            boundaryGap: false,
            minInterval: 1,
            data: self.currentStatistics[0].info.map(dt => dt.label)
          },
          yAxis: {
            type: 'value'
          },
          series: self.currentStatistics.map(dt => {
            let name = dt.name
            let type = 'line'
            let markPoint = {
              clickable: true,
              data: this.workFlow.map(m => {
                return {
                  name: m.suggestTitle, value: m.suggestTitle, xAxis: m.date, yAxis: 0
                }
              })
            }
            let data = dt.info.map(i => i.rate)
            return {name, type, markPoint, data}
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.br {
  margin-bottom: 15px;
  height: 15px;
  width: 100%;
}
.header-row-class-name> th> .cell {
  font-size: 12px;
}
.cell-class-name {
  font-size: 12px;
}
.analysis-table-header {
  margin-bottom: 0;
}
.download {
  color: #FF6600;
  font-size: 24px
}
</style>
