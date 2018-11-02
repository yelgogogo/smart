<template>
  <el-row>
      <el-col :span="6">
        <!-- 时间单位单选框 -->
        <el-form-item label="单位">
          <el-radio-group size="mini" v-model="unit" @change="unitChange">
            <el-radio :label="PERIOD_UNIT.DAY">日</el-radio>
            <el-radio :label="PERIOD_UNIT.WEEK">周</el-radio>
            <el-radio :label="PERIOD_UNIT.MONTH">月</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="18">
        <!-- 引入时间周期选择组件 -->
        <period :periodSelect='31' @onChange="periodChange"></period>
      </el-col>
  </el-row>
</template>

<script>
import period from '@/components/period/period'
import {PERIOD_UNIT} from '@/utils/enum'

export default {
  components: {
    period
  },
  data () {
    return {
      PERIOD_UNIT: PERIOD_UNIT,
      unit: PERIOD_UNIT.DAY,
      filter: {
        period: {},
        unit: PERIOD_UNIT.DAY
      }
    }
  },
  props: [
  ],
  methods: {
    // 改变时间周期
    periodChange (period) {
      this.filter.period = period
      console.log('onChange', this.filter)
      this.$emit('onChange', this.filter)
    },
    // updateDateRangeValue () {
    //   this.updateDateRange(this.dr)
    // },
    // 改变日期单位
    unitChange (unit) {
      this.filter.unit = unit
      this.$emit('onChange', this.filter)
    }
  },
  created () {
  },
  computed: {
  }
}
</script>
<style scoped>
</style>


