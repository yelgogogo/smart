<template>
  <div>
    <el-form ref="form" class="search-bar mini-class">
      <!-- 通用搜索组件 -->
      <search-bar :shopList="shopList" :nationList="nationList" :periodSelect="7" @onChange="searchBarChange($event)" ></search-bar>
      <!-- 搜索栏 -->
      <el-row>
        <el-col :span="6" >
            <el-form-item label="ASIN">
                <el-input
                  placeholder="请输入产品ASIN"
                  clearable
                  @clear="searchWorkflow"
                  :size="SELECT_SIZE"
                  class="shop-select"
                  v-model="searchField.productId">
                </el-input>
              </el-form-item>
        </el-col>    
        <el-col :span="4" :offset="0">
          <el-form-item label="建议人">
              <el-input
                placeholder="输入建议人"
                clearable
                @clear="searchWorkflow"
                :size="SELECT_SIZE"
                class="nation-select"
                v-model="searchField.proposer">
              </el-input>
            </el-form-item>
        </el-col>    
        <el-col :span="5" :offset="1">
          <el-form-item label="审批人">
            <el-input
              placeholder="输入审批人"
              clearable
              class="period-select"
              @clear="searchWorkflow"
              :size="SELECT_SIZE"
              v-model="searchField.auditor">
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="2" :offset="2">
            <el-button type="primary" round icon="el-icon-search" @click="searchWorkflow" :size="SELECT_SIZE">搜索</el-button>
        </el-col>
      </el-row>
    </el-form>
  <el-row>
    <!-- 显示隐藏列 -->
    <el-popover
      ref="showHideColumns"
      trigger="hover">
      <el-checkbox-group v-model="checkedList" @change="updateVisibleColumns" :size="SELECT_SIZE">
        <el-checkbox v-for="(header, index) of headers" :key="index" :label="header" style="width: 100%;" name="123"></el-checkbox>
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
      <el-button size="mini" v-popover:showHideColumns>显示/隐藏列</el-button>
      <vue-csv-download
        :data="download"
        :fields="fieldsCn"
        class="download"
        >
        <el-button size="mini" icon="el-icon-document">下载</el-button>
      </vue-csv-download>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <!-- 底部数据表格 -->
        <el-table v-if="gridData.length>0"
            ref="table"
            border
            :height="tableHeight" 
            @expand-change="getSugHistory"
            :data="gridData">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-form label-position="right">
                  <el-row>
                    <el-col  :md="16" :lg="12">
                      <el-form-item label="备注" :label-width="formLabelWidth">                    
                        <el-input
                          type="textarea"
                          :maxlength="maxlength"
                          :autosize="{ minRows: 3, maxRows: 5}"
                          :placeholder="'添加注释..., 最大字数' + maxlength"
                          v-model="scope.row.comments">
                        </el-input>
                        <el-button icon="el-icon-edit" round size="mini" @click="addComment(scope.row.suggestionId, scope.row.comments, scope.row.sn)">保存注释</el-button>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label="附件" :label-width="formLabelWidth">
                    <el-upload
                      name="attachment"
                      :file-list="scope.row.attachment"
                      :on-preview="downloadFile"
                      :before-remove="beforeRemove"
                      :on-remove="removeFile"
                      :on-change="handlerUploader"
                      :headers="getAuthHeaders()"
                      :action="getUploadUrl(scope.row.suggestionId)">
                      <i class="el-icon-upload"></i>
                      点击上传
                    </el-upload>
                  </el-form-item>
                  <el-form-item label="历史" :label-width="formLabelWidth">
                      <div v-if="scope.row.history" v-for="(his, index) in scope.row.history" :key="'his_' + index">
                        <span><i class="el-icon-time"></i>{{ his.date }}</span>
                        <span>{{ his.operator }}</span>
                        <i class="el-icon-arrow-right"></i>
                        <el-tag>{{ typeReverseMapping[his.operation] }}</el-tag>
                        <span>{{ his.message }}</span>   
                      </div>
                      <div v-else>
                        Loading...
                      </div>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column 
              v-for="(headerName, index) in dynamicHeaders" 
              :width="headerWidth[headerName.en]?headerWidth[headerName.en]:'65'"
              :key="headerName.en + '_' + index" 
              :label="headerName.cn" 
              :align="headerName.en === 'suggestionId' || headerName.en === 'status' || headerName.en === 'countryCode'
               || headerName.en === 'proposer' || headerName.en === 'auditor'?'center': 'left'"
              header-align="center">
                <template slot-scope="scope" >
                  <span v-if="headerName.en==='productId'">
                    <!-- <router-link :to="{path: '/main/products', query: {shopId: scope.row.shopId, productId: scope.row.productId}}">
                      {{scope.row.productId}}
                    </router-link> -->
                    <a :href="scope.row.ProductURL" target="_blank">{{ scope.row.productId }}</a>
                  </span>
                  <span v-else-if="headerName.en==='suggestionId'">
                      <i v-if="scope.row.specialStatus ==='high'" class="el-icon-warning"></i>&nbsp;&nbsp;{{scope.row.suggestionId}}
                  </span>
                  <span v-else-if="headerName.en==='status'">
                      <el-tag :type="getTagType(scope.row.status)">{{typeReverseMapping[scope.row.status]}}</el-tag>
                  </span>
                  <span v-else-if="headerName.en==='title'" :title="scope.row.title" class="product-name" >{{scope.row.title}}</span>
                  <span v-else-if="scope.row[headerName.en]">{{scope.row[headerName.en]}}</span>
                </template>
              </el-table-column>
              <el-table-column
              width="240"
              label="操作"
              header-align="center">
              <template slot-scope="scope">
                <router-link :to="{path: '/main/analysis', query: {countryCode: scope.row.countryCode,marketplaceId: getMarketplaceId(scope.row.countryCode),shopId: scope.row.shopId, productId: scope.row.productId}}">
                  <el-button size="mini" round>
                    分析
                  </el-button>
                </router-link>
                <el-button v-if="scope.row.status === 'issued' || scope.row.status === 'reissued'" size="mini" @click="edit(scope.row)" round>编辑</el-button>
                <el-button v-if="scope.row.status !== 'closed'" size="mini" icon="el-icon-edit-outline" @click="doWorkflowUpdate(scope.row)" round>工作流</el-button>
              </template>
            </el-table-column>
            </el-table>
      </el-col>
    </el-row>
    <el-dialog title="工作流" :visible.sync="dialogWorkflowVisible">
      <el-card shadow="never">
        <div slot="header" class="text-center">
          <el-steps direction="vertical" :active="getActiveStep(wf.status)" align-center :space="120" finish-status="success">
            <el-step v-for="(step, index) in getAllSteps(wf.status)" :key="'wf_step_' + index" :description="getDescription(wf, step)" :title="typeReverseMapping[step]"></el-step>
          </el-steps>
          <el-form size="mini" :model="wf" style="margin-top: 15px;" v-if="wf.status !== 'summed' && wf.status !== 'closed' && (isSalesManager(userInfo.roles) || wf.status === 'permitted' || wf.status === 'finished')">
            <el-form-item label="意见" :label-width="formLabelWidth">
              <el-row>
                <el-col :span="10" v-if="wf.status !== 'closed'">
                  <el-input type="textarea" :maxlength="maxlength" :autosize="{ minRows: 3, maxRows: 5}" :placeholder="'输入描述文字, 最大字数' +  maxlength" v-model="sugDescription" ></el-input>
                </el-col>
                <el-col :span="10">
                  <el-button v-for="(oper,index) of getNextOpers(wf.status)" :key="'oper_' + index" size="mini" @click="processSuggest(wf, oper)" round>{{operMapping[oper]}}</el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
        </div>
        <el-form size="mini" :model="wf" style="margin-top: 15px;">        
          <el-form-item label="ASIN" :label-width="formLabelWidth">
            <small>{{wf.productId}}</small>
          </el-form-item>
          <el-form-item label="产品名称" :label-width="formLabelWidth">
            <small>{{wf.productName}}</small>
          </el-form-item>
          <el-form-item label="优化类型" :label-width="formLabelWidth">
            <small>{{wf.optimizationType}}</small>
          </el-form-item>
          <el-form-item label="所属店铺" :label-width="formLabelWidth">
            <el-select v-model="wf.shopId" disabled placeholder="选择店铺">
              <el-option
                v-for="shop in shopList"
                :key="shop.value"
                :label="shop.shopName"
                :value="shop.shopId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="建议主题" :label-width="formLabelWidth">
            <small>{{wf.title}}</small>
          </el-form-item>
          <el-form-item label="建议" :label-width="formLabelWidth">
            <small>{{wf.suggestion}}</small>
          </el-form-item>
        </el-form>
      </el-card>      
    </el-dialog>
    <el-dialog :title="modalType === 'add' ? '工作流' : '工作流: ' + currentSugId" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="ASIN" :label-width="formLabelWidth">
          &nbsp;&nbsp;&nbsp;&nbsp;{{form.productId}}
            <!-- <el-row>
                <el-col :span="10">
                  <el-input v-model="form.productId"></el-input>
                </el-col>
              </el-row> -->
        </el-form-item>
        <el-form-item label="产品名称" :label-width="formLabelWidth">
            &nbsp;&nbsp;&nbsp;&nbsp;{{form.productName}}
        </el-form-item>
        <el-form-item label="优化类型" :label-width="formLabelWidth">
          <el-select v-model="form.optimizationType" placeholder="选择优化类型">
            <el-option
              v-for="option in optimizationTypes"
              :key="option.typeId"
              :label="option.typeName"
              :value="option.typeName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属店铺" :label-width="formLabelWidth">
          <el-select v-model="form.shopId" placeholder="选择店铺">
            <el-option
              v-for="shop in shopList"
              :key="shop.value"
              :label="shop.shopName"
              :value="shop.shopId">
            </el-option>
          </el-select>
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
        <el-button type="primary" @click="updateWork" v-else>重新提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { Message } from 'element-ui'
  import api from '../../utils/api'
  import json2csv from 'json2csv'
  import VueCsvDownload from '@/components/csvDownload/csvDownload'
  import searchBar from '@/components/search-bar/search-bar'
  import { PERIOD_OPTIONS, SELECT_SIZE } from '../../utils/enum'

  export default {
    watch: {
      // 如果路由有变化，会再次执行该方法
      '$route': 'getPageWorkflows'
    },
    components: {
      VueCsvDownload, searchBar
    },
    data () {
      return {
        SELECT_SIZE: SELECT_SIZE,
        tableHeight: window.innerHeight - 240,
        dr: null,
        maxlength: 200,
        headerWidth: {
          createDate: 75,
          finishDate: 75,
          shopName: 120,
          name: 200,
          productId: 100,
          title: 220,
          lastUpdateTime: 160,
          'Session Percentage': 90,
          status: 80,
          suggestType: 120,
          countryCode: 45
        },
        nationList: ['US', 'UK', 'DE', 'FR', 'IT', 'ES', 'JP'],
        nationListBK: [],
        gridData: [],
        gridDataBackup: [],
        pageSize: 20,
        currentPage: 1,
        total: 0,
        searchField: {
          productId: '',
          auditor: '',
          proposer: ''
        },
        sugComment: undefined,
        sugDescription: undefined,
        formLabelWidth: '120px',
        showLiked: false,
        dialogFormVisible: false,
        dialogWorkflowVisible: false,
        options: [],
        productType: '',
        shopList: [],
        headersArray: [
          {en: 'suggestionId', cn: '提议编号', show: true},
          {en: 'createDate', cn: '提议时间', show: true},
          {en: 'productId', cn: 'ASIN', show: true},
          {en: 'status', cn: '提议状态', show: true},
          {en: 'suggestType', cn: '优化类型', show: true},
          {en: 'shopName', cn: '店铺', show: true},
          {en: 'countryCode', cn: '国家', show: true},
          {en: 'name', cn: '产品名称', show: true},
          {en: 'title', cn: '标题', show: true},
          {en: 'proposer', cn: '提议人', show: true},
          {en: 'auditor', cn: '审批人', show: true},
          {en: 'finishDate', cn: '完成时间', show: true}
        ],
        dynamicHeaders: [],
        headers: [],
        checkedList: [],
        download: [],
        currentSugId: undefined,
        modalType: undefined,
        dictEn: {
          '提议编号': 'suggestionId',
          '标题': 'title',
          '店铺': 'shopName',
          '国家': 'countryCode',
          '提议状态': 'status',
          '提议时间': 'createDate',
          '产品名称': 'name',
          'ASIN': 'productId',
          '提议人': 'proposer',
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
        fields: [
          'suggestionId', 'status', 'createDate', 'name', 'productId', 'proposer', 'suggestType',
          'suggestion', 'auditor', 'reply', 'auditDate', 'finishDate', 'sumup', 'sumupDate', 'comments'
        ],
        fieldsCn: [
        ],
        STAGES: [
          {value: 'issued', name: '待审核'},
          {value: 'permitted', name: '待执行'},
          {value: 'finished', name: '待总结'},
          {value: 'summed', name: '完结'},
          {value: 'rejected', name: '被拒绝'},
          {value: 'closed', name: '已关闭'}
        ],
        typeMapping: {
          '待审核': 'issued',
          '待执行': 'permitted',
          '待总结': 'finished',
          '完结': 'summed',
          '被拒绝': 'rejected',
          '已关闭': 'closed',
          '重新提交': 'reissued'
        },
        typeReverseMapping: {
          'issued': '待审核',
          'permitted': '待执行',
          'finished': '待总结',
          'summed': '完结',
          'rejected': '被拒绝',
          'closed': '已关闭',
          'comments': '备注',
          'attach_upload': '附件上传',
          'reissued': '重新提交'
        },
        operMapping: {
          'issued': '提议',
          'permitted': '审批',
          'finished': '完成',
          'summed': '完结',
          'rejected': '拒绝',
          'closed': '关闭工作',
          'reissued': '重新提交'
        },
        optimizationTypes: [
        ],
        periodOptions: PERIOD_OPTIONS,
        chains: {
          issued: {
            permitted: {
              manager: true
            },
            rejected: {
              manager: true
            },
            closed: {
              sales: false
            }
          },
          permitted: {
            finished: {
              manager: true,
              sales: true
            },
            closed: {
              manager: false
            }
          },
          finished: {
            summed: {
              manager: true,
              sales: true
            },
            closed: {
              manager: false
            }
          },
          summed: {
            closed: {
              manager: false
            }
          },
          rejected: {
            reissued: {
              manager: true
            },
            closed: {
              manager: false
            }
          },
          reissued: {
            permitted: {
              manager: true
            },
            rejected: {
              manager: true
            },
            closed: {
              manager: false
            }
          },
          closed: {}
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
        wf: {
          suggestionId: 0,
          productId: '',
          shopId: undefined,
          productName: '',
          optimizationType: '',
          suggestion: '',
          title: '',
          status: undefined,
          history: [],
          sn: 1
        }
      }
    },
    created () {
      this.createHeader()
      this.getShopList()
      this.getNationList()
      // this.getPageWorkflows()
      // this.getAllWorkflows()
      this.listSuggestTypes()
      this.fieldsCn = this.fields.map(f => this.dictCn[f])
    },
    mounted () {
    },
    computed: {
      ...mapGetters(['userInfo']),
      // 取传入状态
      getStatus () {
        if (this.$route.query.status) {
          return this.$route.query.status.split('_')
        }
        return []
      },
      // 取店铺列表
      getShops () {
        if (Array.isArray(this.shopList) && this.shopList.length > 0) {
          return this.shopList.reduce((res, cur) => {
            if (!res[cur.shopId]) {
              res[cur.shopId] = cur.shopName
            }
            return res
          }, {})
        }
        return {}
      }
    },
    methods: {
      // 是否是销售经理
      isSalesManager (roles) {
        const finder = roles.findIndex(r => r.roleId === 6)
        return finder !== -1
      },
      // 创建header
      createHeader () {
        this.dynamicHeaders = this.headersArray.filter(h => h.show)
        this.headers = this.headersArray.map(e => e.cn)
        this.checkedList = this.dynamicHeaders.map(e => e.cn)
      },
      // 搜索框改变
      searchBarChange (filter) {
        this.filter = {...this.filter, ...filter}
        this.getPageWorkflows()
        this.getAllWorkflows()
      },
      // 更新可见列
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
      // 取店铺名字
      getShopName (shopId) {
        const finder = this.shopList.find(s => s.shopId === shopId)
        return finder ? finder.shopName : ''
      },
      // 删除前确认
      beforeRemove (file, fileList) {
        const reg = new RegExp(/ment\/.*/)
        const path = reg.exec(file.url)[0]
        if (this.userInfo.roles.findIndex(r => r.roleId === 6) >= 0) {
          return this.$confirm(`确定移除 ${file.name}？`).then(() => {
            api.delete(`/api/suggestion/attach${path}`).then(res => {
              this.$message({
                type: 'success',
                message: '更新成功'
              })
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '更新失败'
            })
          })
        } else {
          this.$alert('无权限删除附件', '注意', {confirmButtonText: '确定'})
          return false
        }
      },
      // 删除
      removeFile (suggestionId, file, fileList) {
        console.log(suggestionId, file, fileList)
        // api.delete('/suggestion/attachment/' + suggestionId)
      },
      // 文件下载
      downloadFile (file) {
        let eleLink = document.createElement('a')
        eleLink.download = file.name
        eleLink.style.display = 'none'
        eleLink.href = file.url
        // 触发点击
        document.body.appendChild(eleLink)
        eleLink.click()
        // 然后移除
        document.body.removeChild(eleLink)
      },
      // 改变页面条数
      sizeChange (pageSize) {
        this.pageSize = pageSize
        this.getPageWorkflows()
      },
      // 建议类型列表
      listSuggestTypes () {
        api.get(`/api/suggest_type`).then(res => {
          this.optimizationTypes = res.data
        })
      },
      // 取一行
      GetRow (row, columns) {
        let obj = {}

        columns.forEach(col => {
          let val = row[col.prop]

          if (col.formatter) {
            val = col.formatter(row, col, val)
          }

          obj[col.prop] = val
        })

        return obj
      },
      // 导出csv
      ExportCsv (data, columns, fileName) {
        // console.log(json2csv)
        // const rows = data.map(t => this.GetRow(t, columns))
        const fields = this.fieldsCn
        console.log('fields', fields)
        // const fieldNames = columns.map(t => t.label)

        try {
          const result = json2csv.parse(this.download, { fields })
          console.log(result)
          const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + result
          const link = document.createElement('a')
          link.href = encodeURI(csvContent)
          link.download = `${fileName}.csv`
          document.body.appendChild(link) // Required for FF
          link.click() // This will download the data file named 'my_data.csv'.
          document.body.removeChild(link) // Required for FF
        } catch (err) {
          // Errors are thrown for bad options, or if the data is empty and no fields are provided.
          // Be sure to provide fields if it is possible that your data array will be empty.
          console.error(err)
        }
      },
      // 导出csv
      exportCsv (filename = '列表') {
        // const columns = this.$refs.table.$children.filter(t => t.prop != null)
        // this.ExportCsv(this.gridData, columns, filename)
      },
      // 增加建议
      add () {
        this.modalType = 'add'
        this.dialogFormVisible = true
        this.form.productId = undefined
        this.form.shopId = undefined
        this.form.productName = undefined
        this.form.optimizationType = undefined
        this.form.suggestion = undefined
        this.form.title = undefined
      },
      // 编辑建议
      edit (row) {
        this.modalType = 'edit'
        this.dialogFormVisible = true
        this.currentSugId = row.suggestionId

        this.form.productId = row.productId
        this.form.shopId = row.shopId
        this.form.productName = row.name
        this.form.optimizationType = row.suggestType
        this.form.suggestion = row.suggestion
        this.form.sn = row.sn
        this.form.title = row.title
      },
      // 工作流更新
      doWorkflowUpdate (row) {
        this.wf.suggestionId = row.suggestionId
        this.wf.productId = row.productId
        this.wf.shopId = row.shopId
        this.wf.productName = row.name
        this.wf.optimizationType = row.suggestType
        this.wf.suggestion = row.suggestion
        this.wf.sn = row.sn
        this.wf.title = row.title
        this.wf.status = row.status
        this.wf.history = row.history

        this.dialogWorkflowVisible = true
      },
      // 保存工作
      saveWork () {
        this.form.sn = undefined
        api.post(`/api/suggestion`, this.form).then(res => {
          Message({
            showClose: true,
            message: '更新成功!',
            type: 'success'
          })
          this.dialogFormVisible = false
          this.getPageWorkflows(true)
        }).catch(err => {
          this.errorHandler(err, {code: 404, message: '产品未找到'})
        })
      },
      // 更新工作
      updateWork () {
        api.put(`/api/suggestion/${this.currentSugId}`, this.form).then(res => {
          Message({
            showClose: true,
            message: '更新成功!',
            type: 'success'
          })
          this.dialogFormVisible = false
          this.getPageWorkflows(true)
        }).catch(err => {
          this.errorHandler(err)
        })
      },
      // 改变页面
      currentChange (currentPage) {
        this.currentPage = currentPage
        this.getPageWorkflows()
      },
      // 搜索工作流
      searchWorkflow () {
        this.getPageWorkflows()
      },
      // 国家列表
      getNationList () {
        api.get('/api/country').then(res => {
          this.nationList = res.data.grid
          this.nationListBK = this.nationList
        })
      },
      // 取国家ID
      getMarketplaceId (countryCode) {
        const finder = this.nationList.find(s => s.countryCode === countryCode)
        return finder ? finder.marketplaceId : ''
      },
      // 取店铺列表
      getShopList () {
        api.get('/api/shop').then(res => {
          this.shopList = res.data
        })
      },
      // 取工作流
      getPageWorkflows (hideWorkingDialog) {
        const params = {
          pagination: {
            pageSize: this.pageSize,
            currentPage: this.currentPage,
            filter: {
              shopId: this.filter.shopId,
              status: this.getStatus,
              countryCode: this.filter.nationId,
              ...this.searchField
            }
          },
          period: this.filter.period
        }
        console.log('params', params, this.getStatus)
        this.$store.dispatch('setLoadingState', !hideWorkingDialog && true)
        api.post(`/api/suggestion/pagination`, params).then(res => {
          if (res.status === 200 && res.data) {
            this.gridData = res.data.grid
            this.gridData.forEach(w => {
              api.get(`/api/suggestion/${w.suggestionId}/history`).then(res => {
                w.history = res.data
              })
              api.get(`/api/suggestion/attachment/${w.suggestionId}`).then(attachment => {
                console.log(attachment)
                w.attachment = attachment.data.map(a => {
                  return {
                    name: '<' + this.typeReverseMapping[a.status] + '>' + a.fileName,
                    url: api.baseURL + a.fileUrl
                  }
                })
              })
            })
            this.gridDataBackup = this.gridData
            this.total = res.data.pagination.total
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
      // 取所有的工作流 为下载做准备
      getAllWorkflows (hideWorkingDialog) {
        const params = {
          pagination: {
            pageSize: 9999,
            currentPage: 1,
            filter: {
              shopId: this.filter.shopId,
              status: this.getStatus,
              countryCode: this.filter.nationId,
              ...this.searchField
            }
          },
          period: this.filter.period
        }
        console.log(this.getStatus)
        this.$store.dispatch('setLoadingState', !hideWorkingDialog && true)
        api.post(`/api/suggestion/pagination`, params).then(res => {
          if (res.status === 200 && res.data) {
            this.download = res.data.grid.map(dt => {
              let reformat = {}
              for (let key in dt) {
                if (key === 'status') {
                  reformat[this.dictCn[key]] = this.typeReverseMapping[dt[key]]
                } else {
                  reformat[this.dictCn[key]] = dt[key]
                }
              }
              return reformat
            })
            console.log('this.download', this.download)
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
        this.$sendDownloadHistory('工作流')
      },
      // 建议状态转换
      getActiveStep (name) {
        switch (name) {
          case 'issued': return 0
          case 'permitted': return 1
          case 'finished': return 2
          case 'summed': return 4
          case 'rejected': return 4
          case 'closed': return 4
        }
        return 1
      },
      // 建议状态转换
      getTagType (name) {
        switch (name) {
          case 'permitted': return 'info'
          case 'finished': return 'primary'
          case 'summed': return 'success'
          case 'rejected': return 'danger'
          case 'close': return 'default'
        }
        return 'warning'
      },
      // 取所有的建议状态
      getAllSteps (name) {
        switch (name) {
          case 'rejected': return ['issued', 'rejected']
          case 'closed': return ['closed']
        }
        return ['issued', 'permitted', 'finished', 'summed']
      },
      // 取操作人
      getNextOpers (name) {
        let userName
        if (this.userInfo.roles.findIndex(r => r.roleId === 6) >= 0) {
          userName = 'manager'
        } else if (this.userInfo.roles.findIndex(r => r.roleId === 5) >= 0) {
          userName = 'sales'
        }
        // const userName = this.userInfo.userName
        let currentNode = this.chains[name]
        let opers = []
        for (let c in currentNode) {
          if (currentNode[c][userName] === true) {
            opers.push(c)
          }
        }
        return opers
      },
      // 取历史记录
      getSugHistory (row, expandedRows) {
        // const self = this
        // expandedRows.map((eRow) => {
        //   console.log(eRow)
        //   let currentIndex
        //   let copied = self.gridData
        //   self.gridData.map((wf, index) => {
        //     if (wf.suggestionId === eRow.suggestionId) {
        //       currentIndex = index
        //     }
        //   })
        //   if (currentIndex !== undefined) {
        //     (function (activeRow, activeIndex) {
        //       api.get(`/api/suggestion/${activeRow.suggestionId}/history`).then(res => {
        //         copied[activeIndex].history = res.data
        //         self.$nextTick(() => {
        //           self.gridData = copied
        //         })
        //       })
        //     })(eRow, currentIndex)
        //   }
        // })
      },
      // 取描述
      getDescription (row, step) {
        let description = ''
        row.history.forEach(h => {
          if (step === h.operation) {
            description += ('(' + h.date + ') ' + h.operator + ': ' + h.message)
          }
        })
        return description === '' ? '(流程中)' : description
      },
      // 执行建议
      processSuggest (row, nextStatus) {
        this.dialogWorkflowVisible = false
        const params = {
          suggestionId: row.suggestionId,
          status: nextStatus,
          sn: row.sn,
          message: this.sugDescription || nextStatus
        }
        api.post(`/api/suggestion/status`, params).then(res => {
          Message({
            showClose: true,
            message: '操作成功!',
            type: 'success'
          })
          this.getPageWorkflows()
          this.sugDescription = undefined
        }).catch(err => {
          this.errorHandler(err)
        })
      },
      // 增加注释
      addComment (id, message, sn) {
        const params = {
          suggestionId: id,
          message: message,
          sn: sn
        }

        api.post(`/api/suggestion/comments`, params).then(res => {
          Message({
            showClose: true,
            message: '操作成功!',
            type: 'success'
          })
          this.sugComment = ''
          this.getPageWorkflows()
        }).catch(err => {
          this.sugComment = ''
          this.errorHandler(err)
        })
      },
      // 取token
      getAuthHeaders () {
        let headers = {}
        headers[api.tokenKey] = api.getToken()
        return headers
      },
      // 取上传地址
      getUploadUrl (suggestionId) {
        return api.baseURL + '/api/suggestion/attachment/' + suggestionId
      },
      // 上传处理器
      handlerUploader (file, fileList) {
        console.log(api, file, fileList)
      },
      // 错误处理
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
          if (confirm('系统检测到其他人正在修改此记录，点击确定重新加载数据')) {
            this.getPageWorkflows()
          }
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

<style scoped lang="scss">
.first-search {
  margin-bottom: 0px;
}
.btn-sug-group {
  margin-top: 20px;
}
.suggestion {
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.sug-description {
  padding: 15px 10px 2px 10px;
}

.download {
  color: #FF6600;
  font-size: 24px;
}
.search-bar {
  margin-bottom: 20px;  
  .el-form-item {
    margin-bottom: 0px!important;
  }
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
.el-checkbox + .el-checkbox {
    margin-left: 0px;
}

.el-icon-warning {
  color: #FF6600;
}
</style>

 
  