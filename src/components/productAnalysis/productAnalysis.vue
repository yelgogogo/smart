<template>
  <div>
    <!-- 销量报表分析组件 -->
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <!-- 本产品标签页 -->
      <el-tab-pane label="本产品" name="sales">
        <el-row>
          <el-col :span="24" style="padding-top: 0;">
            <a :href="this.$route.query.productUrl" target="_blank" style="font-size:19px"><b>&nbsp;{{ this.productName }}</b></a>
            <chart 
              :options="statisticsBar"
              :init-options="initOptions"
              @legendselectchanged="onClick($event)"
              auto-resize
              />
            </el-col>
          </el-row>         
        </el-tab-pane>
        <!-- QA比较标签页 -->
        <el-tab-pane label="QA比较" name="QA">
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
        <!-- 反馈比较标签页 -->
        <el-tab-pane label="反馈比较" name="Review">
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
        <!-- category标签页 -->
        <el-tab-pane v-for="ca of categories" :key="ca.name" :label="getTabName(ca.name)" :name="ca.name">
          <el-row v-if="showChartCategory">
            <el-col :span="24" style="padding-top: 0">
              <a :href="ca.url" target="_blank" style="font-size:19px"><b>&nbsp;{{ ca.name }}</b></a>
              <chart 
              :options="categoryBar(ca.name)"
              :init-options="initOptions"
              auto-resize
            />
          </el-col>
        </el-row>
      </el-tab-pane>
      <!-- Keyword标签页 -->
      <el-tab-pane v-for="kw of keywords" :key="kw.name" :label="getTabName(kw.name)" :name="kw.name">
        <el-row v-if="showChartKeyword">
          <el-col :span="24" style="padding-top: 0;">
            <a :href="kw.url" target="_blank" style="font-size:19px"><b>&nbsp;{{ kw.name }}</b></a>
            <chart 
              :options="categoryBar(kw.name)"
              :init-options="initOptions"
              auto-resize
            />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <el-row class="analysis-table-header">
      <!-- 显示/隐藏列弹出框 -->
      <el-popover
        ref="showHideColumns"
        trigger="hover">
        <el-checkbox-group v-model="checkedList" @change="updateVisibleColumns">
          <el-checkbox v-for="(header, index) of headers" :key="index" :label="header" style="width: 100%;" name="123"></el-checkbox>
        </el-checkbox-group>
      </el-popover>
      <!-- 引入产品查询组件（包括日/周/月， 时间选择） -->
      <el-col :span="20">
        <el-form>
          <product-search 
            @onChange="onSearchChange"
          ></product-search>
        </el-form>
      </el-col>
      <el-col :span="4" class="text-right">
      </el-col>
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
      <!-- 显示/隐藏列 和 下载按钮 -->
      <el-col :span="8" class="text-right">      
        <el-button size="mini" v-popover:showHideColumns>显示/隐藏列</el-button>
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
    <!-- 销量报表分析页面表格 -->
    <el-table 
      border
      height="500"
      :data="gridData"
      @sort-change="changeSortItem">
      <el-table-column 
        v-for="(headerName, index) in dynamicHeaders" 
        :width="headerWidth[headerName.fieldName]?headerWidth[headerName.fieldName]:'100'"
        :key="headerName.fieldName + '_' + index" 
        :label="headerName.en"
        :prop="headerName.fieldName"
        :fixed="headerName.fieldName === 'label' || headerName.fieldName === 'Price' || headerName.fieldName === 'Orders' 
        || headerName.fieldName === 'Sessions' || headerName.fieldName === 'Order Session Percentage'? 'left' : false"
        sortable>
        <template slot-scope="scope" v-if="scope.row[headerName.fieldName]">
          {{scope.row[headerName.fieldName]}}
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
import VueCsvDownload from '@/components/csvDownload/csvDownload'
import {PERIOD_UNIT} from '@/utils/enum'
import moment from 'moment'

export default {
  components: {
    VueCsvDownload,
    productSearch
  },
  data () {
    return {
      download: [],
      fieldsCn: [],
      checkedList: [],
      dailyQa: [],
      dailyFeedback: [],
      competitionList: [],
      headersDownload: [],
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
        unit: PERIOD_UNIT.DAY,
        sortParam: '',
        high2low: ''
      },
      salesUnit: 5,
      showChartCategory: false,
      showChartKeyword: false,
      statisticsQuery: null,
      productName: this.$route.query.productName,
      productId: this.$route.query.productId,
      shopId: this.$route.query.shopId,
      comFields: [],
      categories: [],
      keywords: [],
      headers: [],
      dateRange: [],
      legends: [],
      dynamicHeaders: [],
      fields: [ ],
      dictCn: {
        'label': 'Date',
        'Price': 'Price',
        'Orders': 'Orders',
        'Sessions': 'Sessions',
        'Order Session Percentage': 'Order Session Percentage',
        'Units': 'Units',
        'Page Views': 'Page Views',
        'Review Score': 'Review Score',
        'Reviews': 'Reviews',
        'Daily Reviews': 'Daily Reviews',
        'QAs': 'QAs',
        'Daily QAs': 'Daily QAs',
        'Reviews & QA': 'Reviews & QA',
        'Ranking': 'Ranking',
        'Impressions': 'Impressions',
        'Clicks': 'Clicks',
        'CTR': 'CTR',
        'Spend': 'Spend',
        'CPC': 'CPC',
        'Ads Sales': 'Ads Sales',
        'Ads Orders': 'Ads Orders',
        'ACoS': 'ACoS',
        'Advertising': 'Advertising'
      },
      headersArray: [],
      commonHeadersArray: [
        {fieldName: 'label', en: 'Date', cn: '日期', show: true},
        {fieldName: 'Price', en: 'Price', cn: '价格', show: true},
        {fieldName: 'Orders', en: 'Orders', cn: '订单', show: true},
        {fieldName: 'Sessions', en: 'Sessions', cn: 'Sessions', show: true},
        {fieldName: 'Order Session Percentage', en: 'Order Session Percentage', cn: 'session率', show: true},
        {fieldName: 'Units', en: 'Units', cn: 'Units', show: true},
        {fieldName: 'Page Views', en: 'Page Views', cn: '浏览量', show: true}
      ],
      commonHeadersArray2: [
        {fieldName: 'label', en: 'Date', cn: '日期', show: true},
        {fieldName: 'Orders', en: 'Orders', cn: '订单', show: true},
        {fieldName: 'Sessions', en: 'Sessions', cn: 'Sessions', show: true},
        {fieldName: 'Order Session Percentage', en: 'Order Session Percentage', cn: 'session率', show: true},
        {fieldName: 'Units', en: 'Units', cn: 'Units', show: true},
        {fieldName: 'Page Views', en: 'Page Views', cn: '浏览量', show: true}
      ],
      briefArray: [
        {fieldName: 'Reviews & QA', en: 'Reviews & QA', cn: 'Reviews & QA', show: true},
        {fieldName: 'Ranking', en: 'Ranking', cn: 'Ranking', show: true},
        {fieldName: 'Advertising', en: 'Advertising', cn: 'Advertising', show: true}
      ],
      briefArray2: [
        {fieldName: 'Advertising', en: 'Advertising', cn: 'Advertising', show: true}
      ],
      reviewQAArray: [
        {fieldName: 'Review Score', en: 'Review Score', cn: '评分', show: true},
        {fieldName: 'Reviews', en: 'Reviews', cn: '反馈', show: true},
        {fieldName: 'Daily Reviews', en: 'Daily Reviews', cn: '每日反馈', show: true},
        {fieldName: 'QAs', en: 'QAs', cn: 'QAs', show: true},
        {fieldName: 'Daily QAs', en: 'Daily QAs', cn: 'Daily QAs', show: true}
      ],
      competitionArray: [],
      adsArray: [
        {fieldName: 'Impressions', en: 'Impressions', cn: 'Impressions', show: true},
        {fieldName: 'Clicks', en: 'Clicks', cn: 'Clicks', show: true},
        {fieldName: 'CTR', en: 'CTR', cn: 'CTR', show: true},
        {fieldName: 'Spend', en: 'Spend', cn: 'Spend', show: true},
        {fieldName: 'CPC', en: 'CPC', cn: 'CPC', show: true},
        {fieldName: 'Ads Sales', en: 'Ads Sales', cn: 'Ads Sales', show: true},
        {fieldName: 'Ads Orders', en: 'Ads Orders', cn: 'Ads Orders', show: true},
        {fieldName: 'ACoS', en: 'ACoS', cn: 'ACoS', show: true}
      ],
      competitionHearders: [],
      compChecklist: [],
      headerWidth: HEADER_WIDTH,
      gridData: [],
      tmpGridData: [],
      currentStatistics: [],
      adStatistics: [],
      competitionStatistics: [],
      chartTitle: '',
      curTabName: '',
      initOptions: {
        renderer: 'svg'
      },
      workFlow: [],
      workFlowTmp: [],
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
      },
      showDownload: true
    }
  },
  computed: {
    // adBar () {
    //   var self = this
    //   if (Array.isArray(self.adStatistics) && self.adStatistics.length > 0) {
    //     var selected = {}
    //     this.adStatistics.forEach((dt, index) => {
    //       if (index < 3) {
    //         selected[dt.name] = true
    //       } else {
    //         selected[dt.name] = false
    //       }
    //     })
    //     return {
    //       title: {
    //         text: this.productName
    //       },
    //       tooltip: {
    //         trigger: 'axis',
    //         formatter: (params) => {
    //           let res = '' + params[0].name + '</br>'
    //           params.forEach(param => {
    //             if (param.seriesName.startsWith('Ad')) {
    //               res = res + param.seriesName + ': ' + self.adStatistics[param.seriesIndex].info[param.dataIndex].value + '</br>'
    //             }
    //           })
    //           return res
    //         }
    //       },
    //       legend: {
    //         data: self.adStatistics.map(dt => dt.name).filter(f => f.startsWith('Ad')),
    //         top: 30,
    //         selected: selected
    //       },
    //       grid: {
    //         top: 150
    //       },
    //       toolbox: self.toolBoxOptions,
    //       xAxis: {
    //         type: 'category',
    //         boundaryGap: false,
    //         minInterval: 1,
    //         data: self.adStatistics[0].info.map(dt => dt.label)
    //       },
    //       yAxis: {
    //         type: 'value'
    //       },
    //       series: self.adStatistics.map(dt => {
    //         let name = dt.name
    //         let type = 'line'
    //         let markPoint = {
    //           clickable: true,
    //           data: this.workFlow.map(m => {
    //             return {
    //               name: m.suggestTitle, value: m.suggestTitle, xAxis: m.date, yAxis: 0
    //             }
    //           })
    //         }
    //         let data = dt.info.map(i => i.rate)
    //         return {name, type, markPoint, data}
    //       })
    //     }
    //   }
    // },
    // 本产品折线图数据展示
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
            text: ''
          },
          tooltip: {
            trigger: 'axis',
            formatter: (params) => {
              let res = '' + params[0].name + '</br>'
              params.forEach(param => {
                res = res + param.seriesName + ': ' + self.currentStatistics[param.seriesIndex].info[param.dataIndex].value + '</br>'
              })
              // let findSuggestion = this.workFlow.findIndex(w => w.date === params[0].name && w.operation === 'issued')
              // if (findSuggestion !== -1) {
              //   res = res + '建议' + this.workFlow[findSuggestion].suggestId + '开始 -' + this.workFlow[findSuggestion].operator + '</br>' + this.workFlow[findSuggestion].suggestTitle + '</br>'
              // }
              let findSuggestion = this.workFlow.findIndex(w => w.date === params[0].name && w.operation === 'finished')
              if (findSuggestion !== -1) {
                res = res + '建议' + this.workFlow[findSuggestion].suggestId + '完成 -' + this.workFlow[findSuggestion].operator + '</br>' + this.workFlow[findSuggestion].suggestTitle + '</br>'
              }
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
            this.workFlowTmp = this.workFlow.filter(m => moment(m.date).isBetween(moment(this.filter.period.start), moment(this.filter.period.end)))
            let markPoint = {
              clickable: true,
              data: this.workFlowTmp.map(m => {
                return {
                  name: m.suggestTitle, value: m.suggestId, xAxis: m.date, yAxis: 0
                }
              })
            }
            let data = dt.info.map(i => i.rate)
            return {name, type, markPoint, data}
          })
        }
      }
    },
    dictEn () {
      let dictEn = {}
      for (let prop in this.dictCn) {
        dictEn[this.dictCn[prop]] = prop
      }
      return dictEn
    }
  },
  created () {
    this.statisticsQuery = this.$route.query
    this.statisticsQuery.shopId = parseInt(this.statisticsQuery.shopId)
    this.getSuggestion()
  },
  methods: {
    // 生成分析页面表格表头
    createHeader () {
      this.dynamicHeaders = this.headersArray.filter(h => h.show)
      // this.headers = this.headersArray.map(e => e.en)
      // this.checkedList = this.dynamicHeaders.map(e => e.en)
      if (this.filter.unit === 5) {
        this.headers = this.briefArray.map(e => e.en)
        this.checkedList = this.briefArray.map(e => e.en)
      } else {
        this.headers = this.briefArray2.map(e => e.en)
        this.checkedList = this.briefArray2.map(e => e.en)
      }
      this.headersDownload = this.headersArray.map(e => e.en)
    },
    // 改变排序方式
    changeSortItem (val) {
      this.filter.sortParam = val.prop
      if (val.order === 'descending') {
        this.filter.high2low = true
      } else {
        this.filter.high2low = false
      }
      if (this.showChartCategory === true || this.showChartKeyword === true ||
       this.curTabName === 'QA' || this.curTabName === 'Review') {
        this.showCompareData()
      } else {
        this.getPageData()
      }
    },
    // 显示/隐藏列 根据不同的标签页更新表格表头
    updateVisibleColumns () {
      if (this.showChartCategory === true || this.showChartKeyword === true ||
       this.curTabName === 'QA' || this.curTabName === 'Review') {
        const checkList = this.checkedList
        this.competitionHearders.forEach(h => {
          if (checkList.includes(h.en)) {
            h.show = true
          } else {
            h.show = false
          }
        })
        this.dynamicHeaders = this.competitionHearders.filter(h => h.show)
      } else {
        const checkList = this.checkedList.map(c => this.dictEn[c])
        this.headersArray.forEach(h => {
          if (checkList.includes(h.fieldName)) {
            h.show = true
          } else {
            h.show = false
          }
          if (checkList.includes('Reviews & QA')) {
            this.reviewQAArray.forEach(r => {
              if (r.fieldName === h.fieldName) {
                h.show = true
              }
            })
          }
          if (checkList.includes('Ranking')) {
            this.competitionArray.forEach(r => {
              if (r.fieldName === h.fieldName) {
                h.show = true
              }
            })
          }
          if (checkList.includes('Advertising')) {
            this.adsArray.forEach(r => {
              if (r.fieldName === h.fieldName) {
                h.show = true
              }
            })
          }
          this.commonHeadersArray.forEach(r => {
            if (r.fieldName === h.fieldName) {
              h.show = true
            }
          })
        })
        this.dynamicHeaders = this.headersArray.filter(h => h.show)
      }
    },
    // 页面大小改变后更新数据
    sizeChange (pageSize) {
      this.pageSize = pageSize
      if (this.showChartCategory === true || this.showChartKeyword === true ||
       this.curTabName === 'QA' || this.curTabName === 'Review') {
        this.showCompareData()
      } else {
        this.getPageData()
      }
    },
    // 页面改变后更新数据
    currentChange (currentPage) {
      this.currentPage = currentPage
      if (this.showChartCategory === true || this.showChartKeyword === true ||
       this.curTabName === 'QA' || this.curTabName === 'Review') {
        this.showCompareData()
      } else {
        this.getPageData()
      }
    },
    onClick (evnet, e) {
      console.log(event, e, window.VueECharts)
      console.log(event.componentType)
    },
    showHideColumns (newHeaders) {
    },
    // 标签页改变后操作
    handleClick (tab, event) {
      // console.log('tab===' + tab.name)
      this.pageSize = 20
      this.currentPage = 1
      this.filter.unit = 5
      this.showChartCategory = false
      this.showChartKeyword = false
      this.curTabName = tab.name
      if (tab.name.indexOf('Category:') !== -1) {
        setTimeout(() => { this.showChartCategory = true }, 0)
        this.showCompareData()
      } else if (tab.name.indexOf('Keyword:') !== -1) {
        setTimeout(() => { this.showChartKeyword = true }, 0)
        this.showCompareData()
      } else if (tab.name === 'QA' || tab.name === 'Review') {
        this.showCompareData()
      } else {
        this.gridData = this.tmpGridData
        this.createHeader()
      }
      console.log(tab, event)
    },
    // 显示竞品数据
    showCompareData () {
      const period = this.filter.period
      const tab = this.curTabName
      api.post('/api/product/competitionChart', {period, tab, ...this.filter}).then(res => {
        this.competitionList = res.data.info
        this.gridData = res.data.info
        this.dynamicHeaders = []
        this.headers = []
        this.checkedList = []
        let tmpHeader = []
        for (let subComField in this.competitionList[0]) {
          if (subComField.indexOf('QA') !== -1) {
            this.dynamicHeaders.unshift({fieldName: subComField, en: 'QA', cn: subComField, show: true})
            this.compChecklist.push('QA')
          } else if (subComField.indexOf('Review') !== -1) {
            this.dynamicHeaders.unshift({fieldName: subComField, en: 'Review', cn: subComField, show: true})
            this.compChecklist.push('Review')
          } else if (subComField.indexOf('Category') !== -1) {
            this.dynamicHeaders.unshift({fieldName: subComField, en: this.getTabName(subComField), cn: subComField, show: true})
            this.compChecklist.push(this.getTabName(subComField))
          } else if (subComField.indexOf('Keyword') !== -1) {
            this.dynamicHeaders.unshift({fieldName: subComField, en: this.getTabName(subComField), cn: subComField, show: true})
            this.compChecklist.push(this.getTabName(subComField))
          } else {
            tmpHeader.push({fieldName: subComField, en: subComField, cn: subComField, show: true})
            this.compChecklist.push(this.getTabName(subComField))
          }
        }
        tmpHeader = tmpHeader.sort((a, b) => {
          return a.en < b.en ? 1 : -1
        })
        this.dynamicHeaders = this.dynamicHeaders.concat(tmpHeader)
        // console.log('compChecklist===', this.compChecklist)
        this.headers = this.dynamicHeaders.map(e => e.en)
        this.checkedList = this.compChecklist
        this.competitionHearders = this.dynamicHeaders
      }).catch(err => {
        Message({
          showClose: true,
          message: err.response.statusText,
          type: 'error'
        })
      })
    },
    // getShortHeader (headerName) {
    //   let shortHeader = ''
    //   if (headerName.indexOf('Category') !== -1) {
    //     shortHeader = headerName.substring(0, 10) + '  ' + this.getTabName(headerName.substring(headerName.indexOf('Category')))
    //   } else if (headerName.indexOf('Keyword') !== -1) {
    //     shortHeader = headerName.substring(0, 10) + '  ' + this.getTabName(headerName.substring(headerName.indexOf('Keyword')))
    //   } else {
    //     shortHeader = headerName
    //   }
    //   return shortHeader
    // },
    // 获取标签页名
    getTabName (name) {
      // console.log('getTabName', name)
      const arr = name.split(' > ')
      let txt1 = ''
      if (name.substring(0, 8) === 'Category') {
        if (name.indexOf('>') === -1) {
          txt1 = '(C)' + name.substring(9)
        } else {
          txt1 = '(C) ' + arr[arr.length - 1]
        }
      } else if (name.substring(0, 7) === 'Keyword') {
        txt1 = '(K)' + name.substring(8)
      } else {
        txt1 = name
      }
      return txt1
    },
    // 获取工作流建议
    getSuggestion () {
      api.get(`/api/suggestion/all/${this.shopId}/${this.productId}`).then(res => {
        this.$store.dispatch('setLoadingState', false)
        if (res.status === 200 && res.data) {
          console.log('suggestion', res)
          this.workFlow = res.data.filter(r => (r.operation === 'finished'))
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
    // 产品筛选时间改变后的操作
    onSearchChange (filter) {
      console.log('onSearchChange', filter, this.filter)
      this.filter = {...this.filter, ...filter}
      this.filter.unit = filter.unit
      this.getGridData()
      if (this.showChartCategory === true || this.showChartKeyword === true ||
       this.curTabName === 'QA' || this.curTabName === 'Review') {
        this.showCompareData()
      } else {
        this.getPageData()
      }
    },
    // 获取产品chart数据
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
          this.tmpGridData = res.data.grid
          this.total = res.data.pagination.total
          this.competitionArray = []
          for (let subField in this.gridData[0]) {
            if (subField.startsWith('Category:')) {
              this.competitionArray.push({fieldName: subField, en: this.getTabName(subField), cn: this.getTabName(subField), show: true})
              this.$set(this.dictCn, subField, this.getTabName(subField))
            }
          }
          for (let subField in this.gridData[0]) {
            if (subField.startsWith('Keyword:')) {
              this.competitionArray.push({fieldName: subField, en: this.getTabName(subField), cn: this.getTabName(subField), show: true})
              this.$set(this.dictCn, subField, this.getTabName(subField))
            }
          }
          if (this.filter.unit === 5) {
            this.headersArray = this.commonHeadersArray.concat(this.reviewQAArray).concat(this.competitionArray).concat(this.adsArray)
          } else {
            this.headersArray = this.commonHeadersArray2.concat(this.adsArray)
          }
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
      this.showDownload = true
    },
    // 下载产品数据
    getDownload () {
      let pagination = {
        pageSize: 99999,
        currentPage: 1
      }
      const period = this.filter.period
      api.post('/api/product/chart', {pagination, ...this.filter, period}).then(res => {
        if (res.status === 200 && res.data) {
          this.download = res.data.grid.map(d => {
            let download = {}
            for (let prop in d) {
              download[this.dictCn[prop]] = d[prop]
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
      this.$sendDownloadHistory('产品分析')
      this.showDownload = false
    },
    // 改变下载状态
    changeDownloadStatus () {
      this.showDownload = true
      this.download = []
    },
    // 获取产品分析表格数据
    getGridData () {
      let self = this
      this.$store.dispatch('setLoadingState', true)
      api.post('/api/product/statistics', this.filter).then(res => {
        if (res.status === 200 && res.data) {
          this.currentStatistics = res.data
          this.adStatistics = self.currentStatistics.filter(f => f.name.startsWith('Ad'))
          api.post('/api/product/competition', this.filter).then(res1 => {
            this.$store.dispatch('setLoadingState', false)
            if (res1.status === 200 && res1.data) {
              self.competitionStatistics = res1.data
              this.dailyQa = []
              this.dailyFeedback = []
              self.competitionStatistics.forEach(c => {
                // c.name = c.id
                const finderQa = c.info.find(i => i.name === 'QAs')
                this.dailyQa.push({
                  name: c.name,
                  info: finderQa.info
                })
                const finderFeedback = c.info.find(i => i.name === 'QAs')
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
    // 解析类目
    parseCategories () {
      const statistics = this.competitionStatistics[0].info
      let self = this

      if (Array.isArray(statistics) && statistics.length > 0) {
        self.categories = []
        self.keywords = []
        statistics.map((dt, index) => {
          if (dt.name &&
            typeof dt.name === 'string') {
            self.legends.push(dt.name)
            if (dt.name.startsWith('Category:') === true) {
              // dt.name.substr(10)
              // self.categories.push(dt.name)
              self.categories.push({name: dt.name, url: dt.url})
              self.categories.sort((a, b) => a.name.split(' > ').length > b.name.split(' > ').length ? 1 : -1)
            }
            if (dt.name.startsWith('Keyword:') === true) {
              // dt.name.substr(9)
              // self.keywords.push(dt.name)
              self.keywords.push({name: dt.name, url: dt.url})
            }
          }
        })
      }
    },
    // 处理本产品标签页数据
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
    // 类目chart数据展示
    categoryBar (tabName) {
      // only process active tab
      if (this.activeName === tabName) {
        let composedArry = []
        this.competitionStatistics.map(pro => {
          let params = pro.info.filter(param => param.name === tabName)
          composedArry.push({
            id: pro.id,
            data: params.length === 0 ? [] : params[0].info,
            name: pro.name
          })
        })
        composedArry.forEach(c => {
          c.data.forEach(d => {
            delete d.rate
          })
        })
        return {
          title: {
            text: ''
          },
          legend: {
            top: 90,
            data: composedArry.map(dt => dt.name)
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
            let name = dt.name
            let type = 'line'
            // let markPoint = {
            //   clickable: true,
            //   data: this.workFlow.map(m => {
            //     return {
            //       name: m.suggestTitle, value: m.suggestTitle, xAxis: m.date, yAxis: composedArry[0].data.find(dt => dt.label === m.date).value
            //     }
            //   })
            // }
            let data = dt.data.map(i => i.value)
            return {name, type, data}
          })
        }
      }
      return {}
    },
    // QA比较chart数据展示
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
            // let markPoint = {
            //   clickable: true,
            //   data: this.workFlow.map(m => {
            //     return {
            //       name: m.suggestTitle, value: m.suggestTitle, xAxis: m.date, yAxis: 0
            //     }
            //   })
            // }
            let data = dt.info.map(i => i.value)
            return {name, type, data}
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
.el-checkbox+.el-checkbox {
  margin-left: 0!important;
}
</style>
