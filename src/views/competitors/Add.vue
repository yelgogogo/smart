<template v-if="product">
  <el-form :label-position="labelPosition" label-width="80px" class="product-form">
    <el-form-item label="产品ASIN">
      {{product.asin}}
    </el-form-item>
    <!-- <el-form-item label="图片">
      <el-upload
        class="avatar-uploader"
        action=""
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload">
        <img v-if="product.imgUrl" :src="product.imgUrl" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
    </el-form-item> -->
    <el-form-item label="产品名称">
      {{product.name}}
    </el-form-item>
    <el-form-item label="关键字">
      <div v-for="(kw, index) in keywords" :key="kw + '_' + index">
        {{kw.keyword}} <i class="el-icon-delete" @click="deleteKeyword(kw)"></i>
      </div>
      <div v-if="showAddKwButton === false">
        <el-input v-model="gKeyword.keyword" placeholder="关键字"></el-input>
      </div>
      <el-button size="mini" icon="el-icon-plus" v-if="showAddKwButton === true" @click="addKeyword" round>增加关键字</el-button>
      <el-button size="mini" v-if="showAddKwButton === false" @click="saveKeyword" round>保存关键字</el-button>
    </el-form-item>
    <el-form-item label="竞品">
      <div v-for="cp in competitors" :key="cp.competitorId">
        {{cp.competitorId}} <i class="el-icon-delete" @click="deleteCompetitor(cp.competitorId)"></i>
      </div>
      <div v-if="showAddCpButton === false">
        <el-input v-model="competitor.competitorId" placeholder="竞品ASIN"></el-input>
      </div>
      <div v-if="competitors.length < 2">
        <el-button size="mini" icon="el-icon-plus" v-if="showAddCpButton === true" @click="addCompetitor" round>增加竞品</el-button>
        <el-button size="mini" v-if="showAddCpButton === false" @click="saveCompetitor" round>保存竞品</el-button>
      </div>
      <div v-else>
        <el-alert type="warning" :closable="closable" show-icon title="竞品最多为2个"></el-alert>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import api from '@/utils/api'
import { MessageBox, Message } from 'element-ui'

export default {
  data () {
    return {
      product: {},
      competitors: [],
      keywords: [],
      closable: false,
      labelPosition: 'right',
      showAddCpButton: true,
      showAddKwButton: true,
      competitor: {
        productId: '',
        competitorId: '',
        shopId: ''
      },
      gKeyword: {
        productId: '',
        keyword: '',
        shopId: ''
      }
    }
  },
  created () {
    let self = this
    if (self.$route.query && self.$route.query.name) {
      self.product = self.$route.query
      console.log(self.product)
      self.listCompetitor()
    }
  },
  methods: {
    // 测试图片上传
    handleAvatarSuccess (res, file) {
      this.product.imgUrl = URL.createObjectURL(file.raw)
    },
    // 图片上传前检查
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
    // 增加竞品
    addCompetitor () {
      this.competitor.shopId = this.product.shopId
      this.competitor.productId = this.product.asin
      this.showAddCpButton = false
    },
    // 增加关键字
    addKeyword () {
      this.gKeyword.shopId = this.product.shopId
      this.gKeyword.productId = this.product.asin
      this.showAddKwButton = false
    },
    // 查找关键字
    assignKeywords (data) {
      let self = this
      self.keywords = data.map(kw => {
        return {
          keywordId: kw.keywordId,
          keyword: kw.keyword
        }
      })
      console.log(self.keywords)
    },
    // 清除竞品
    clearCompetitor () {
      this.competitor.competitorId = undefined
      this.competitor = Object.assign({}, this.competitor)
      this.showAddCpButton = true
    },
    // 清除关键字
    clearGKeywork () {
      this.gKeyword.keyword = undefined
      this.gKeyword = Object.assign({}, this.gKeyword)
      this.showAddCpButton = true
    },
    // 保存竞品
    saveCompetitor () {
      let self = this
      api.post(`/api/product/competitor`, self.competitor).then(res => {
        self.listCompetitor()
      })
    },
    // 保存关键字
    saveKeyword () {
      let self = this
      api.post(`/api/product/keyword`, self.gKeyword).then(res => {
        self.listKeywords()
      })
    },
    // 竞品列表
    listCompetitor () {
      let self = this
      api.get(`/api/product/competitor/${self.product.shopId}/${self.product.asin}`).then(res => {
        self.competitors = res.data
        self.listKeywords()
        self.clearCompetitor()
      })
    },
    // 关键字列表
    listKeywords () {
      let self = this
      api.get(`/api/product/keyword/${self.product.shopId}/${self.product.asin}`).then(res => {
        self.assignKeywords(res.data)
        self.clearGKeywork()
      })
    },
    // 删除竞品
    deleteCompetitor (id) {
      let self = this
      MessageBox.confirm('确定删除竞品?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api.delete(`/api/product/competitor/${self.product.shopId}/${self.product.asin}/${id}`).then(res => {
          self.listCompetitor()
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
      // if (confirm('Do you want to delete the competitor product?')) {
      //   let self = this
      //   api.delete(`/api/product/competitor/${self.product.shopId}/${self.product.asin}/${id}`).then(res => {
      //     self.listCompetitor()
      //   })
      // }
    },
    // 删除关键字
    deleteKeyword (kw) {
      let self = this
      MessageBox.confirm('确定删除关键字?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api.delete(`/api/product/keyword/${self.product.shopId}/${kw.keywordId}`).then(res => {
          self.listKeywords()
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
      // if (confirm('Do you want to delete the keyword?')) {
      //   let self = this
      //   api.delete(`/api/product/keyword/${self.product.shopId}/${kw.keywordId}`).then(res => {
      //     self.listKeywords()
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
.products-keywords-select {
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


