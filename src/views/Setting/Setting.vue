<template>
    <div>
      <el-row class="search-bar">
          <!-- 搜索栏 -->
          <el-col :span="6">
          <el-input
            placeholder="请输入姓名或者工号"
            v-model="searchFullName"
            @clear="searchFullNameChange"
            @change="inputChange"
            :size="SELECT_SIZE"
            clearable>
            <el-button slot="append" icon="el-icon-search" @click="searchFullNameChange">搜索</el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          &nbsp;
        </el-col>
        <el-col :span="2" class="header-content">
            用户角色:
          </el-col>
          <el-col :span="4" class="header-content">
            <el-select size="mini" style="width: 150px;" v-model="roleId" @change="selectRole" :size="SELECT_SIZE">
                <el-option
                  v-for="item in roleList"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId">
                </el-option>
              </el-select>
          </el-col>
        <el-col :span="2" class="header-content">
          用户状态:
        </el-col>
        <el-col :span="4" class="header-content">
          <el-checkbox-group v-model="userStatusSelected" @change="userStatusChange" :min="1" :size="SELECT_SIZE">
            <el-checkbox v-for="status of userStatusList" :label="status.id" :key="status.id" >{{status.value}}</el-checkbox>
          </el-checkbox-group>
        </el-col>
        <el-col :span="4" class="add-user">
          <el-button type="primary" icon="el-icon-plus" round @click="add" :size="SELECT_SIZE">新增用户</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24" class="text-left">
          <!-- 分页器 -->
          <el-pagination
            @size-change="sizeChange"
            @current-change="updatePageUsers"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="sizes, total, prev, pager, next"
            :total="total">
          </el-pagination>
        </el-col>
        <el-col :span="24">
          <!-- 数据表格 -->
          <el-table
            :height="tableHeight"
            border 
            :data="users">
              <el-table-column
                label="工号"
                width="60"
                prop="userName">
              </el-table-column>
              <el-table-column
                label="用户">
                <template slot-scope="scope">
                    <el-row>
                      <el-col :span="6">
                        <img :src="scope.row.wechatImage" class="privateImage" v-if="scope.row.wechatImage">
                      </el-col>
                      <el-col :span="18">
                        <h6>{{ scope.row.fullName }}</h6>
                        <span v-if="scope.row.wechatName">昵称 {{ scope.row.wechatName }}</span>
                      </el-col>
                    </el-row>
                  </template>              
              </el-table-column>
              <el-table-column
                label="邮件"
                prop="email">
              </el-table-column>
              <el-table-column
                label="电话"
                width="100"
                prop="phone">
              </el-table-column>
              <el-table-column
                label="角色"
                prop="role">
                <template slot-scope="scope">
                  <span v-for="role in scope.row.roles">
                      <span class="role-txt">{{ role.roleName }}</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                label="状态"
                width="80"
                prop="userStatus">
                <template slot-scope="scope">
                  <span v-if="scope.row.userStatus==='active'">
                    <el-tag size="mini" :hit="false" type="success">正常</el-tag>
                  </span>
                  <span v-if="scope.row.userStatus==='disabled'">
                    <el-tag size="mini" :hit="false" type="danger">禁用</el-tag>
                  </span>
                  <span v-if="scope.row.userStatus==='visit'">
                    
                    <el-button type="primary" icon="el-icon-check" size="mini" round></el-button>
                    <el-button icon="el-icon-close" size="mini" round></el-button>
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="300">
                <template slot-scope="scope">
                  <el-button size="mini" round @click="edit(scope.row)" icon="el-icon-edit">编辑</el-button>
                  <el-button size="mini" round icon="el-icon-view" @click="changePassWord(scope.row)">修改密码</el-button>
                  <el-button v-show="scope.row.userName !== 'admin'" v-if="scope.row.userStatus==='disabled'"  icon="el-icon-check" size="mini" round @click="switchStatus(scope.row.userId, 'active')">激活</el-button>
                  <el-button v-show="scope.row.userName !== 'admin'" v-else size="mini" round icon="el-icon-close" @click="switchStatus(scope.row.userId, 'disabled')" >禁用</el-button>
                </template>
              </el-table-column>
            </el-table>
        </el-col>
      </el-row>
      <el-dialog :title="modalType === 'edit' ? '用户详情' : '新增用户'" :visible.sync="dialogFormVisible">
          <el-form :model="form">
            <el-form-item v-if="modalType === 'edit'" label="工号" :label-width="formLabelWidth">
              {{form.userName}}
            </el-form-item>
            <el-form-item label="姓名" :label-width="formLabelWidth">
              <el-row>
                <el-col :span="12">
                  <el-input v-model="form.fullName" auto-complete="off"></el-input>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="电话" :label-width="formLabelWidth">
                <el-row>
                    <el-col :span="12">
              <el-input v-model="form.phone" auto-complete="off"></el-input>
              </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="邮件" :label-width="formLabelWidth">
                <el-row>
                    <el-col :span="12">
              <el-input v-model="form.email" auto-complete="off"></el-input>
              </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="角色" :label-width="formLabelWidth">
              <el-checkbox-group v-model="roleSelected" >
                <el-checkbox v-for="role of roleList" :label="role.roleId" :key="role.roleId" :disabled="hasSales(role.roleId)">{{role.roleName}}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="所属店铺" :label-width="formLabelWidth">
              <el-checkbox-group v-model="shopSelected" >
                <el-checkbox v-for="shop of shopList" :label="shop.shopId" :key="shop.shopId">{{shop.shopName}}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveUser">确 定</el-button>
          </div>
        </el-dialog>
    </div>
</template>
<script>
  // import { ROLE } from '../../../static/enum.js'
  import api from '../../utils/api'
  import { Message } from 'element-ui'
  import {SELECT_SIZE} from '../../utils/enum'
  export default {
    data () {
      return {
        SELECT_SIZE: SELECT_SIZE,
        tableHeight: window.innerHeight - 240,
        users: [],
        pageSize: 20,
        total: 0,
        currentPage: 1,
        search_val: '',
        showLiked: false,
        searchFullName: '',
        options: [],
        dialogFormVisible: false,
        productType: '',
        roleSelected: [],
        shopList: [],
        changePasswordFlag: true,
        shopSelected: [],
        formLabelWidth: '200px',
        filter: {
          userName: '',
          fullName: '',
          userRoleId: [],
          userStatus: ''
        },
        roleId: null,
        roleList: [
          // { roleId: 4, roleName: '项目执行人' },
          // { roleId: 3, roleName: '项目创建人' },
          { roleId: 5, roleName: '销售' },
          { roleId: 6, roleName: '销售主管' }
        ],
        userStatusList: [
          { id: 'active', value: '正常' },
          { id: 'disabled', value: '禁用' }
        ],
        userStatusSelected: ['active', 'disabled'],
        modalType: 'edit',
        account: {
          userId: '',
          userName: '',
          fullName: '',
          passWord: ''
        },
        passwordDialog: false,
        form: {
          userId: '',
          userName: '',
          fullName: '',
          phone: '',
          email: '',
          roles: [],
          shops: []
        }
      }
    },
    created () {
      this.getUserData()
      this.getShopList()
    },
    mounted () {
    },
    methods: {
      // 修改密码
      changePassWord (user) {
        this.account.userId = user.userId
        this.account.userName = user.userName
        this.account.fullName = user.fullName
        this.passwordDialog = true
        this.$prompt('请输入密码', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          this.account.password = value
          this.confirmChangePassword()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          })
        })
      },
      // 监控change
      inputChange (value) {
        // console.log(value)
      },
      // 解绑微信Id
      unbind (userId) {
        const wechatId = null
        const wechatName = ''
        const wechatImage = ''
        const force = 1
        api.post('/api/wechat/bind', {userId, wechatId, wechatName, wechatImage, force}).then(res => {
          this.setUserInfo(res.data)
        })
      },
      // 页面条数变更
      sizeChange (pageSize) {
        this.pageSize = pageSize
        this.getUserData()
      },
      // 选择角色
      selectRole () {
        this.filter.userRoleId = [this.roleId]
        this.getUserData()
      },
      // 布尔值转换
      getBoolen (value) {
        return value
      },
      // 修改密码弹窗出现
      changePassword (row) {
        row.changePasswordFlag = true
      },
      // 确认修改密码
      confirmChangePassword () {
        const userId = this.account.userId
        const passWord = this.account.password
        api.post(`/api/user/password`, {userId, passWord}).then(res => {
          Message({
            showClose: true,
            message: '操作成功!',
            type: 'success'
          })
          this.passwordDialog = false
          this.unbind(userId)
        }).catch(err => {
          Message({
            showClose: true,
            message: err.response.statusText,
            type: 'error'
          })
        })
      },
      // 按姓名查找用户
      searchFullNameChange () {
        const isNumber = /^[0-9]+$/
        if (isNumber.test(this.searchFullName)) {
          this.filter.fullName = ''
          this.filter.userName = this.searchFullName
        } else {
          this.filter.userName = ''
          this.filter.fullName = this.searchFullName
        }
        this.getUserData()
        console.log('searchFullNameChange', this.searchFullName)
      },
      // 用户状态变更
      userStatusChange () {
        console.log(this.userStatusSelected)
        this.filter.userStatus = this.userStatusSelected.length === 1 ? this.userStatusSelected[0] : ''
        this.getUserData()
      },
      // 用户状态提交
      switchStatus (userId, status) {
        api.post(`/api/user/status`, {userId, status}).then(res => {
          Message({
            showClose: true,
            message: '操作成功!',
            type: 'success'
          })
          this.getUserData()
        }).catch(err => {
          Message({
            showClose: true,
            message: err.response.statusText,
            type: 'error'
          })
        })
      },
      // 保存用户设置
      saveUser () {
        this.dialogFormVisible = false
        const fullName = this.form.fullName
        const email = this.form.email || ''
        const phone = this.form.phone || ''
        const userName = this.form.userName
        const role = this.roleSelected ? this.roleSelected[0] : null
        const shops = this.shopSelected
        const body = this.modalType === 'edit' ? {fullName, email, phone, role, shops} : {userName, fullName, email, phone, role, shops}
        const url = this.modalType === 'edit' ? `/${this.form.userId}` : ''
        api.post(`/api/user${url}`, body).then(res => {
          Message({
            showClose: true,
            message: '操作成功!',
            type: 'success'
          })
          this.getUserData()
        }).catch(err => {
          console.log(err)
          Message({
            showClose: true,
            message: err.response.statusText,
            type: 'error'
          })
        })
      },
      // 取店铺列表
      getShopList () {
        api.get('/api/shop').then(res => {
          this.shopList = res.data
        })
      },
      // 是否是销售
      hasSales (id) {
        let res = false
        switch (id) {
          case 5:
            res = (this.roleSelected.indexOf(6) > -1)
            break
          case 6:
            res = (this.roleSelected.indexOf(5) > -1)
            break
        }
        return res
      },
      // 编辑用户
      edit (user) {
        this.modalType = 'edit'
        this.form = user
        this.roleSelected = user.roles.map(u => u.roleId)
        this.shopSelected = user.shops.map(u => u.shopId)
        console.log(user)
        this.dialogFormVisible = true
      },
      // 新增用户
      add () {
        this.modalType = 'add'
        this.form = {
          userId: '',
          userName: '',
          fullName: '',
          phone: '',
          email: '',
          roles: [],
          shops: []
        }
        this.roleSelected = []
        this.dialogFormVisible = true
      },
      // 去重函数
      unique (array) {
        let jsonArray = array.map(a => JSON.stringify(a))
        jsonArray = Array.from(new Set(jsonArray))
        return jsonArray.map(j => JSON.parse(j))
      },
      // 取用户数据
      getUserData () {
        const pagination = {
          pageSize: this.pageSize,
          currentPage: this.currentPage,
          filter: this.filter
        }
        api.post('/api/user/pagination', {pagination}).then(res => {
          this.users = res.data.grid
          this.users.forEach(u => {
            u.roles = this.unique(u.roles)
          })
          this.total = res.data.pagination.total
        })
      },
      // 更新当前页面
      updatePageUsers (currentPage) {
        this.currentPage = currentPage
        this.getUserData()
      }
    }
  }
</script>
<style>
.search-bar {
  margin-bottom: 10px;
}
.privateImage{
	display:inline-block;
	border-radius:50%;
	height: 40px;
	vertical-align:middle;
}
.add-user {
  text-align: right;
}
.role-txt {
  margin: 5px;
}
.header-content {
  height: 40px;
  line-height: 40px;
}

.el-checkbox {
  margin-right: 30px;
}

.el-checkbox+.el-checkbox{
  margin-left: 0px;
  margin-right: 30px;

}
</style>
  
  