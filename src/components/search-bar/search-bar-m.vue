<template>
  <el-row class="first-search">
    <el-col :span="24" style="padding-right: 5px;">
      <!-- 店铺选择框 -->
      <el-form-item label="店铺">
        <el-select clearable v-model="shopIdIn" placeholder="选择店铺" class="shop-select" @change="updateShop" :size="SELECT_SIZE">
          <el-option
            v-for="shop in shopList"
            :key="shop.value"
            :label="shop.shopName"
            :value="shop.shopId">
          </el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="24" style="padding-right: 5px;">
      <el-form-item label="国家">
        <!-- 国家选择框 -->
        <el-select clearable v-model="nationIdIn" placeholder="选择国家" class="nation-select" @change="updateNation" :size="SELECT_SIZE">
          <el-option
            v-for="nation in nationListIn"
            :key="nation.countryCode"
            :label="nation.countryCode"
            :value="nation.countryCode">
          </el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="24" :offset="0">
      <!-- 时间周期选择框 -->
      <period :periodSelect="periodSelect" @onChange="periodChange($event)"></period>
      </el-col>   
  </el-row>
</template>

<script>
import { PERIOD_OPTIONS, SELECT_SIZE } from '../../utils/enum'
import period from '@/components/period/period-m'
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
      SELECT_SIZE: SELECT_SIZE,
      filter: {
        shopId: null,
        countryCode: null,
        period: {}
      },
      nationListIn: [],
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
  watch: {
    nationList () {
      this.nationListIn = this.nationList
    }
  },
  mounted () {
    this.nationListIn = this.nationList
    this.periodSelectIn = this.periodSelect
  },
  methods: {
    // 改变店铺选择
    updateShop () {
      const shopFinder = this.shopList.find(s => s.shopId === this.shopIdIn)
      let shopList
      if (shopFinder) {
        shopList = shopFinder.countryCode.map(f => this.nationList.find(n => n.countryCode === f))
        this.nationListIn = shopList
      } else {
        this.nationListIn = this.nationList
      }
      this.filter.shopId = this.shopIdIn
      this.$emit('onChange', this.filter)
      console.log('shopChange', this.filter)
    },
    // 改变国家选择
    updateNation () {
      this.filter.countryCode = this.nationIdIn
      this.$emit('onChange', this.filter)
      console.log('nationChange', this.filter)
    },
    // 改变时间选择
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
  width: 120px!important;
}

.shop-select {
  width: 160px!important;
}

.nation-select {
  width: 110px!important;
}
</style>


