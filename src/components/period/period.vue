<template>
  <el-row class="first-search">
    <el-col :span="10">
        <el-form-item label="选择时间">
          <el-select class="period-select" v-model="periodSelectIn" @change="updatePerid">
            <el-option
            v-for="item in periodOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="14">
        <el-form-item v-if="periodSelectIn===0">
          <!-- <el-date-picker
            v-model="periodCustomize"
            @change="updatePeriodCustomize"
            type="daterange"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            range-separator="~"
            start-placeholder="开始时间"
            end-placeholder="结束时间">
          </el-date-picker> -->
          <div class="block">
            <el-date-picker
              v-model="periodCustomizeStart"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              placeholder="选择开始日期"
              @change="updatePeriodStart">
            </el-date-picker>
          </div>
          <div class="block">
            <el-date-picker
              v-model="periodCustomizeEnd"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              placeholder="选择结束日期"
              @change="updatePeriodEnd">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item v-else>&nbsp;</el-form-item>
      </el-col>   
  </el-row>
</template>

<script>
import { PERIOD_OPTIONS } from '@/utils/enum.js'
import moment from 'moment'
export default {
  props: [
    'periodSelect'
  ],
  data () {
    return {
      period: {},
      periodCustomize: [],
      periodCustomizeStart: '',
      periodCustomizeEnd: '',
      periodSelectIn: 0,
      periodOptions: PERIOD_OPTIONS
    }
  },
  mounted () {
    this.periodSelectIn = this.periodSelect
    this.updatePerid()
  },
  methods: {
    updatePerid () {
      if (this.periodSelectIn === 0) {
        this.period = {start: '', end: '', select: this.periodSelectIn}
        this.periodCustomizeStart = ''
        this.periodCustomizeEnd = ''
        return
      }
      let format = 'YYYY-MM-DD'
      this.period.start = moment().subtract(this.periodSelectIn - 1, 'days').format(format)
      this.period.end = moment().format(format)
      this.period.select = this.periodSelectIn
      console.log('onChange', this.period)
      this.$emit('onChange', this.period)
    },
    updatePeriodCustomize () {
      this.period.start = this.periodCustomize[0]
      this.period.end = this.periodCustomize[1]
      this.period.select = this.periodSelectIn
      this.$emit('onChange', this.period)
    },
    updatePeriodStart () {
      this.period.start = this.periodCustomizeStart
      if (this.period.end !== '' && moment(this.period.start) > moment(this.period.end)) {
        this.$message('开始日期必须小于结束日期')
      }
    },
    updatePeriodEnd () {
      this.period.end = this.periodCustomizeEnd
      if (this.period.start === '') {
        this.$message('请输入开始日期')
      } else if (moment(this.period.start) > moment(this.period.end)) {
        this.$message('开始日期必须小于结束日期')
      } else {
        this.$emit('onChange', this.period)
      }
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
</style>


