<template>
  <el-row class="first-search">
    <el-col :span="6" style="padding-right: 5px;">
      <el-form-item label="店铺">
        <el-select clearable v-model="shopIdIn" placeholder="选择店铺" class="shop-select" @change="updateShop">
          <el-option
            v-for="shop in shopList"
            :key="shop.value"
            :label="shop.shopName"
            :value="shop.shopId">
          </el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="4" style="padding-right: 5px;">
      <el-form-item label="国家">
        <el-select clearable v-model="nationIdIn" placeholder="选择国家" class="nation-select" @change="updateNation">
          <el-option
            v-for="nation in nationList"
            :key="nation.countryCode"
            :label="nation.countryCode"
            :value="nation.countryCode">
          </el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="13" :offset="1">
      <period :periodSelect="periodSelect" @onChange="periodChange($event)"></period>
      </el-col>   
  </el-row>
</template>

<script>
import { PERIOD_OPTIONS } from '../../utils/enum'
import period from '@/components/period/period'
export default {
  components: {
    period
  },
  props: [
    'shopList',
    'nationList',
    'shopId',
    'nationId',
    'periodSelect'
  ],
  data () {
    return {
      filter: {
        shopId: null,
        countryCode: null,
        period: {}
      },
      periodCustomize: [],
      shopIdIn: this.shopId,
      nationIdIn: this.nationId,
      periodSelectIn: 0,
      // shopId: null,
      // shopList: [],
      // nationId: null,
      // nationList: [],
      // periodSelect: 7,
      periodOptions: PERIOD_OPTIONS
    }
  },
  mounted () {
    this.periodSelectIn = this.periodSelect
  },
  methods: {
    updateShop () {
      this.filter.shopId = this.shopIdIn
      this.$emit('onChange', this.filter)
      console.log('shopChange', this.filter)
    },
    updateNation () {
      this.filter.countryCode = this.nationIdIn
      this.$emit('onChange', this.filter)
      console.log('nationChange', this.filter)
    },
    periodChange (period) {
      // if (this.periodSelectIn === 0) {
      //   return
      // }
      // let format = 'YYYY-MM-DD'
      // this.filter.period.start = moment().subtract(this.periodSelectIn, 'days').format(format)
      // this.filter.period.end = moment().format(format)
      this.filter.period = period
      this.$emit('onChange', this.filter)
      console.log('periodChange', this.filter)
    }
  }
}
</script>

<style lang="scss" scoped>
.first-search {
  margin-bottom: 0px;
}

.period-select {
  width: 150px!important;
}

.shop-select {
  width: 160px!important;
}

.nation-select {
  width: 110px!important;
}
</style>


