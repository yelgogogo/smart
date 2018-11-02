<template v-if="product">
    <el-form :label-position="labelPosition" label-width="80px" class="product-form">
      <!-- 优化类型表单 -->
      <el-form-item label="优化类型">
        <div v-if="showAddKwButton === false">
          <el-input v-model="gSuggestType.suggestType" placeholder="优化类型"></el-input>
        </div>
        <el-button size="mini" icon="el-icon-plus" v-if="showAddKwButton === true" @click="addSuggestType" round>增加优化类型</el-button>
        <el-button size="mini" v-if="showAddKwButton === false" @click="saveSuggestType" round>保存优化类型</el-button>
        <el-row>
          <el-col :span="12" v-for="(kw, index) in suggestTypes" :key="kw + '_' + index">
            <div>
              {{kw}} <i class="el-icon-delete" @click="deleteSuggestType(kw)"></i>
            </div>
          </el-col>
        </el-row>
      </el-form-item>
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
      // 增加优化类型
      addSuggestType () {
        this.gSuggestType.shopId = this.product.shopId
        this.gSuggestType.productId = this.product.asin
        this.showAddKwButton = false
      },
      // 清空优化类型
      clearGKeywork () {
        this.gSuggestType.typeName = undefined
        this.gSuggestType = Object.assign({}, this.gSuggestType)
        this.showAddCpButton = true
      },
      // 保存优化类型
      saveSuggestType () {
        let self = this
        api.post(`/api/suggest_type`, self.gSuggestType).then(res => {
          self.listSuggestTypes()
        })
      },
      // 获取优化类型列表
      listSuggestTypes () {
        let self = this
        api.get(`/api/suggest_type`).then(res => {
          self.suggestTypes = res.data
          self.clearGKeywork()
        })
      },
      // 删除优化类型 kw [String] 删除名为kw的优化类型
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
  
  
  