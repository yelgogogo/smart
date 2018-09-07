<template>
  <div>
    <div class="mail-title">邮件群发</div>
    <el-form :model="serverForm" :size="SELECT_SIZE" v-if="userInfo.userName==='admin'">
      <el-form-item label="服务器设置"/>
        <el-row>
          <el-col :span="22">
            <el-pagination
            @size-change="sizeChange"
            @current-change="currentChange"
            :current-page="pagination.currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="sizes, total, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
          </el-col>
          <el-col :span="2"><el-button type="primary" round :size="SELECT_SIZE" @click='dialogServerSettingVisible = true'>添加</el-button></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-table v-if="gridData.length>0"
              :height="tableHeight" 
              stripe
              border
              :data="gridData">
              <el-table-column 
                v-for="(headerName, index) in serverSettingHeaders" 
                :width="headerWidth[headerName]?headerWidth[headerName]:'80'"
                :key="headerName + '_' + index" 
                :label="dictCn[headerName]"
                v-if="serverSettingHeaders.includes(headerName)"
                :prop="headerName"
                align="center">
                <template slot-scope="scope" v-if="scope.row[headerName]">
                  {{ scope.row[headerName] }}
                </template>
              </el-table-column>
              <el-table-column
                header-align="center"
                align="center"
                width="100"
                label="操作">
                <template slot-scope="scope">
                  <a href="#" @click="modifyRow(scope.row)">
                    <i title="修改" class="el-icon-edit large-icon"></i>
                    &nbsp;
                  </a>
                  <a href="#" @click="delRow(scope.row)">
                    <i title="删除" class="el-icon-delete large-icon"></i>
                    &nbsp;
                  </a>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-row>
    </el-form>
    <el-dialog title="服务器设置" :center="true" :visible.sync="dialogServerSettingVisible" width="40%">
      <el-form :model="serverForm" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="店铺: " :label-width="serverFormLabelWidth">
              <el-select clearable v-model="serverForm.shopId" placeholder="选择店铺" class="shop-select" :size="SELECT_SIZE">
                <el-option
                  v-for="shop in shopList"
                  :key="shop.value"
                  :label="shop.shopName"
                  :value="shop.shopId">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="国家: " :label-width="serverFormLabelWidth">
              <el-select clearable v-model="serverForm.countryCode" placeholder="选择国家" class="nation-select" :size="SELECT_SIZE">
                <el-option
                  v-for="nation in nationList"
                  :key="nation.countryCode"
                  :label="nation.countryCode"
                  :value="nation.countryCode">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="发件邮箱: " :label-width="serverFormLabelWidth">
          <el-col :span="10"><el-input v-model="serverForm.sendEmail" clearable></el-input></el-col>
        </el-form-item>
        <el-form-item label="服务器: " :label-width="serverFormLabelWidth">
          <el-col :span="10"><el-input v-model="serverForm.emailServer" clearable></el-input></el-col>
        </el-form-item>
        <el-form-item label="账号: " :label-width="serverFormLabelWidth">
          <el-col :span="10"><el-input v-model="serverForm.emailAccount" clearable></el-input></el-col>
        </el-form-item>
        <el-form-item label="密码: " :label-width="serverFormLabelWidth">
          <el-col :span="10"><el-input v-model="serverForm.emailPassword" clearable type="password"></el-input></el-col>
        </el-form-item>
        <el-form-item label="配额限制: " :label-width="serverFormLabelWidth">
          <el-col :span="10"><el-input v-model="serverForm.quotaLimit"></el-input></el-col>
        </el-form-item>
        <el-form-item label="频率限制: " :label-width="serverFormLabelWidth">
          <el-col :span="10"><el-input v-model="serverForm.rateLimit"></el-input></el-col>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogServerSettingVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveServerSetting">保 存</el-button>
      </div>
    </el-dialog>
    <el-form  :size="SELECT_SIZE" v-if="isSalesManager(userInfo.roles)">
    <br><br>
      <el-form-item label="自动群发设置"/>
      <el-col :span="12">
        <el-button type="" round icon="el-icon-upload2" @click="uploadDialogDisplay = true" size="mini">上传</el-button>
        <el-button type="" round icon="el-icon-download" @click="getDownload" size="mini">下载</el-button>
      </el-col>
    </el-form>
    <el-dialog title="上传" width="30%" :visible.sync="uploadDialogDisplay">
      <el-upload
        name="template"
        :on-success="onSuccess"
        :on-error="onError"
        :headers="getAuthHeaders()"
        :action="getUploadUrl()">
        <el-button size="mini" icon="el-icon-upload">自动群发模板上传</el-button>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogDisplay = false">取 消</el-button>
        <el-button type="primary" @click="uploadDialogDisplay = false">完 成</el-button>      
      </div>
    </el-dialog>
    <br><br><br><br>
    <el-form :model="manualSendForm" :size="SELECT_SIZE" label-position="left">
      <el-form-item label="手动群发设置"/>
      <el-form-item label="主题" :label-width="manualSendFormLabelWidth">
        <el-col :span="8"><el-input v-model="manualSendForm.subject"/></el-col>
      </el-form-item>
      <el-form-item label="内容" :label-width="manualSendFormLabelWidth">
        <el-col :span="14">
          <el-input v-model="manualSendForm.content" type="textarea" rows="6" placeholder="请输入邮件模板内容"></el-input>
        </el-col>
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="1.5"><el-form-item label="选择店铺"/></el-col>
        <el-col :span="3">
          <el-select clearable v-model="manualSendForm.shopId" placeholder="选择店铺" class="shop-select" :size="SELECT_SIZE">
            <el-option
              v-for="shop2 in shopList"
              :key="shop2.value"
              :label="shop2.shopName"
              :value="shop2.shopId">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1.5"><el-form-item label="选择国家"/></el-col>
        <el-col :span="2">
          <el-select clearable v-model="manualSendForm.countryCode" placeholder="选择国家" class="nation-select" :size="SELECT_SIZE">
            <el-option
              v-for="nation2 in nationList"
              :key="nation2.countryCode"
              :label="nation2.countryCode"
              :value="nation2.countryCode">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1.5"><el-form-item label="选择产品"/></el-col>
        <el-col :span="3">
          <el-input v-model="manualSendForm.asins" type="textarea" rows="4" placeholder="All"></el-input>
        </el-col>
        <el-col :span="1.5"><el-form-item label="选择订单日期"/></el-col>
        <el-col :span="8">
          <el-col :span="8">
            <el-date-picker
              v-model="manualSendForm.dateFrom"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              placeholder="from"
              @change="updateDateFrom"
              :size="SELECT_SIZE"
              style="width: 100%;">
            </el-date-picker>
          </el-col>
          <el-col :span="1">-</el-col>
          <el-col :span="8">
            <el-date-picker
              v-model="manualSendForm.dateTo"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              placeholder="to"
              @change="updateDateTo"
              :size="SELECT_SIZE"
              style="width: 100%;">
            </el-date-picker>
          </el-col>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="2">
          <el-button round icon="el-icon-search" :size="SELECT_SIZE" @click="searchOrders">显示订单数</el-button>
        </el-col>
        <el-col :span="2">
          &nbsp;&nbsp;&nbsp;&nbsp;{{ manualSendForm.ordersNum }}
        </el-col>
      </el-row>
      <br>
      <el-button round icon="el-icon-message" :size="SELECT_SIZE" @click="sendMails">发送</el-button>
    </el-form>
  </div>
</template>

<script>
import api from '@/utils/api'
import { Message } from 'element-ui'
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import {SERVER_HEADER_WIDTH} from '../../utils/enum'

export default {
  data () {
    return {
      SELECT_SIZE: 'mini',
      tableHeight: window.innerHeight - 475,
      headerWidth: SERVER_HEADER_WIDTH,
      shopList: [],
      nationList: [],
      uploadDialogDisplay: false,
      dialogServerSettingVisible: false,
      total: 0,
      gridData: [],
      pagination: {
        pageSize: 20,
        currentPage: 1
      },
      dictCn: {
        'shopName': '店铺',
        'countryCode': '国家',
        'senderEmail': '发件邮箱',
        'emailSMTPServer': '服务器',
        'emailAccount': '账号',
        'emailPassword': '密码',
        'quotaLimit': '配额限制',
        'rateLimit': '频率限制'
      },
      serverSettingHeaders: ['shopName', 'countryCode', 'senderEmail', 'emailSMTPServer', 'emailAccount', 'emailPassword', 'quotaLimit', 'rateLimit'],
      serverForm: {
        shopId: '',
        countryCode: '',
        sendEmail: '',
        emailServer: '',
        emailAccount: '',
        emailPassword: '',
        quotaLimit: '0',
        rateLimit: '0'
      },
      manualSendForm: {
        subject: '',
        content: '',
        shopId: '',
        countryCode: '',
        asins: 'all',
        dateFrom: '',
        dateTo: '',
        ordersNum: '?'
      },
      serverFormLabelWidth: '120px',
      manualSendFormLabelWidth: '80px'
    }
  },
  created () {
    this.getShopList()
    this.getNationList()
    this.getEmailServerList()
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  methods: {
    ...mapActions({ setUserInfo: 'setUserInfo' }),
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
    isSalesManager (roles) {
      const finder = roles.findIndex(r => r.roleId === 6)
      return finder !== -1
    },
    saveServerSetting () {
      api.post('/api/email/set_server', {...this.serverForm}).then(res => {
        if (res.status === 200 && res.data) {
          if (res.data === 'ok') {
            this.$message({
              type: 'success',
              message: '保存成功!'
            })
            this.getEmailServerList()
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
    },
    getEmailServerList () {
      let pagination = this.pagination
      api.post('/api/email/list_server', {pagination}).then(res => {
        if (res.status === 200 && res.data) {
          this.gridData = res.data.grid
          this.total = res.data.pagination.totalCount
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
    modifyRow (row) {
      this.dialogServerSettingVisible = true
      const {shopId, countryCode, senderEmail, emailSMTPServer, emailAccount, emailPassword, quotaLimit, rateLimit} = row
      this.serverForm.shopId = shopId
      this.serverForm.countryCode = countryCode
      this.serverForm.sendEmail = senderEmail
      this.serverForm.emailServer = emailSMTPServer
      this.serverForm.emailAccount = emailAccount
      this.serverForm.emailPassword = emailPassword
      this.serverForm.quotaLimit = quotaLimit
      this.serverForm.rateLimit = rateLimit
    },
    delRow (row) {
      console.log(row)
      const {shopId, marketplaceId} = row
      // this.$confirm('是否确定删除该行数据?', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(() => {
      api.post('/api/email/delete_server', {shopId, marketplaceId}).then(res => {
        if (res.status === 200 && res.data) {
          if (res.data === 'ok') {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.getEmailServerList()
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
      // })
    },
    getUploadUrl () {
      return api.baseURL + '/api/email/upload_email_template'
    },
    getAuthHeaders () {
      let headers = {}
      headers[api.tokenKey] = api.getToken()
      return headers
    },
    onSuccess (response, file, fileList) {
      console.log(response, file, fileList)
      if (response.errstr === 'ok') {
        this.$message({
          type: 'success',
          message: '上传邮件模板成功!'
        })
      } else {
        this.$message({
          type: 'info',
          message: '上传邮件模板失败'
        })
      }
    },
    onError (err, file, fileList) {
      switch (err.status) {
        case 400: this.$message.error('400 ERROR')
          break
        case 500: this.$message.error('500 ERROR')
          break
      }
    },
    getDownload () {
      api.post('/api/email/download_email_template', '', {responseType: 'blob'}).then(res => {
        if (res.status === 200 && res.data) {
          var filename = 'email_templates'
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
      this.$sendDownloadHistory('邮件模板')
    },
    updateDateFrom () {
      if (this.manualSendForm.dateTo !== '' && moment(this.manualSendForm.dateFrom) > moment(this.manualSendForm.dateTo)) {
        this.$message('开始日期必须小于结束日期')
      }
    },
    updateDateTo () {
      if (this.manualSendForm.dateFrom === '') {
        this.$message('请输入开始日期')
      } else if (moment(this.manualSendForm.dateFrom) > moment(this.manualSendForm.dateTo)) {
        this.manualSendForm.dateTo = ''
        this.$message('结束日期必须大于开始日期')
      }
    },
    searchOrders () {
      const shopId = this.manualSendForm.shopId
      const countryCode = this.manualSendForm.countryCode
      const asins = this.manualSendForm.asins
      const dateStart = this.manualSendForm.dateFrom
      const dateEnd = this.manualSendForm.dateTo
      console.log(this.manualSendForm)
      api.post('/api/email/get_orders_to_email', {shopId, countryCode, asins, dateStart, dateEnd}).then(res => {
        if (res.status === 200 && res.data) {
          this.manualSendForm.ordersNum = res.data.emailCount
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
    sendMails () {
      const shopId = this.manualSendForm.shopId
      const countryCode = this.manualSendForm.countryCode
      const asins = this.manualSendForm.asins
      const dateStart = this.manualSendForm.dateFrom
      const dateEnd = this.manualSendForm.dateTo
      const testemail = '19610645@qq.com'
      const subject = this.manualSendForm.subject
      const content = this.manualSendForm.content
      api.post('/api/email/send_email', {shopId, countryCode, asins, dateStart, dateEnd, testemail, subject, content}).then(res => {
        if (res.status === 200 && res.data) {
          console.log(res.data.successList)
          console.log(res.data.failList)
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
    sizeChange (e) {
      this.pagination.pageSize = e
      this.getEmailServerList()
    },
    currentChange (e) {
      this.pagination.currentPage = e
      this.getEmailServerList()
    }
  }
}
</script>

<style>
.mail-title {
  font-weight: 550;
  font-size: 20px;
  line-height: 50px;
}
</style>