<template v-if="product">
    <el-form :label-position="labelPosition" label-width="80px" class="product-form">
      <el-form-item label="优化类型">
        <div v-for="(kw, index) in suggestTypes" :key="kw + '_' + index">
          {{kw}} <i class="el-icon-delete" @click="deleteSuggestType(kw)"></i>
        </div>
        <div v-if="showAddKwButton === false">
          <el-input v-model="gSuggestType.suggestType" placeholder="优化类型"></el-input>
        </div>
        <el-button size="mini" icon="el-icon-plus" v-if="showAddKwButton === true" @click="addSuggestType" round>增加优化类型</el-button>
        <el-button size="mini" v-if="showAddKwButton === false" @click="saveSuggestType" round>保存优化类型</el-button>
      </el-form-item>
      <!-- <el-form-item label="广告上传">
        <el-upload
          name="advertise"
          :file-list="adList"
          :on-preview="downloadFile"
          :before-remove="beforeRemove"
          :on-remove="removeFile"
          :on-change="handlerUploader"
          :headers="getAuthHeaders()"
          :action="getUploadUrl()">
          <i class="el-icon-upload"></i>
          点击上传
        </el-upload>
      </el-form-item> -->
    </el-form>
  </template>
  
  <script>
  import api from '@/utils/api'
  import { MessageBox, Message } from 'element-ui'
  
  export default {
    data () {
      return {
        adList: [],
        product: {},
        competitors: [],
        suggestTypes: [],
        closable: false,
        labelPosition: 'right',
        showAddCpButton: true,
        showAddKwButton: true,
        competitor: {
          productId: '',
          competitorId: '',
          shopId: ''
        },
        gSuggestType: {
          productId: '',
          suggestType: '',
          shopId: ''
        }
      }
    },
    created () {
      this.listSuggestTypes()
    },
    methods: {
      getUploadUrl () {
        return api.baseURL + '/api/advertisement_data'
      },
      handlerUploader (file, fileList) {
        console.log(api, file, fileList)
      },
      getAuthHeaders () {
        let headers = {}
        headers[api.tokenKey] = api.getToken()
        return headers
      },
      removeFile (suggestionId, file, fileList) {
        console.log(suggestionId, file, fileList)
        // api.delete('/suggestion/attachment/' + suggestionId)
      },
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
      handleAvatarSuccess (res, file) {
        this.product.imgUrl = URL.createObjectURL(file.raw)
      },
      beforeAvatarUpload (file) {
        const isJPG = file.type === 'image/jpeg'
        const isLt2M = file.size / 1024 / 1024 < 2
  
        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!')
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!')
        }
        return isJPG && isLt2M
      },
      addSuggestType () {
        this.gSuggestType.shopId = this.product.shopId
        this.gSuggestType.productId = this.product.asin
        this.showAddKwButton = false
      },
      clearCompetitor () {
        this.competitor.competitorId = undefined
        this.competitor = Object.assign({}, this.competitor)
        this.showAddCpButton = true
      },
      clearGKeywork () {
        this.gSuggestType.typeName = undefined
        this.gSuggestType = Object.assign({}, this.gSuggestType)
        this.showAddCpButton = true
      },
      saveSuggestType () {
        let self = this
        api.post(`/api/suggest_type`, self.gSuggestType).then(res => {
          self.listSuggestTypes()
        })
      },
      listCompetitor () {
        let self = this
        api.get(`/api/product/competitor/${self.product.shopId}/${self.product.asin}`).then(res => {
          self.competitors = res.data
          self.listSuggestTypes()
          self.clearCompetitor()
        })
      },
      listSuggestTypes () {
        let self = this
        api.get(`/api/suggest_type`).then(res => {
          self.suggestTypes = res.data
          self.clearGKeywork()
        })
      },
      deleteSuggestType (kw) {
        let self = this
        MessageBox.confirm('确定删除优化类型?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          api.delete(`/api/suggest_type/${kw}`).then(res => {
            self.listSuggestTypes()
            Message({
              type: 'success',
              message: '删除成功!'
            })
          })
        }).catch(() => {
          Message({
            type: 'info',
            message: '已取消删除'
          })
        })
        // if (confirm('Do you want to delete the suggestType?')) {
        //   let self = this
        //   api.delete(`/api/product/suggestType/${self.product.shopId}/${kw.suggestTypeId}`).then(res => {
        //     self.listSuggestTypes()
        //   })
        // }
      }
    }
  }
  </script>
  <style>
  .product-form {
    width: 500px;
  }
  .products-suggestTypes-select {
    width: 100%;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 108px;
    height: 108px;
    line-height: 108px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  </style>
  
  
  