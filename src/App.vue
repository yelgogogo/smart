<template>
  <div id="app">
    <main>
      <v-loading v-show="loading"></v-loading>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import loading from '@/components/loading/loading'
import { mapGetters } from 'vuex'

export default {
  name: 'app',
  components: {
    'v-loading': loading
  },
  computed: {
    ...mapGetters([
      'loading'
    ])
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
}

* {
  margin: 0;
  padding: 0;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.product-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.el-header,
.el-footer {
  /* background-color: #b3c0d1; */
  /* color: #333; */
  /* text-align: center; */
  /* line-height: 60px; */
}

.el-aside {
  /* background-color: #d3dce6; */
  /* color: #333; */
}

.el-main {
  /* background-color: #e9eef3; */
  /* color: #333; */
  /* text-align: center; */
  /* line-height: 160px; */
}

body > .el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}

.el-tabs__content {
  padding: 15px 15px;
}

.el-table th>.cell {
  font-size: 10px;
}

.el-table .cell {
  font-size: 10px;
}

.el-row {
  margin-bottom: 0px;
}

.download {
  color: #FF6600;
  font-size: 24px;
}

.el-row:last-child {
  margin-bottom: 0;
}
.echarts {
  width: 100% !important;
}
a {
  text-decoration: none;
}
.text-white {
  color: #fff;
}
.text-center {
  text-align: center;
}
.text-left {
  text-align: left;
}
.text-right {
  text-align: right;
}
.el-popover {
  max-width: 450px;
  min-width: 300px;
}

.header-logo {
	display: inline-block;
	vertical-align: middle;
	color: #fff;
	height: 40px;
	width: 40px;
	font-weight: 800;
	line-height: 40px;
	text-align: center;
	font-size: 30px;
	border-radius: 50%;
	background: #89b846;
}
.logo-txt {
	color: #fff;
  position: relative;
  top: 6px;
  left: -8px;
	font-size: 24px;
	font-style: italic;
	font-weight: 600;
}
.split-line {
  border: none;
  margin-top: 10px;
  margin-bottom: 10px;
}
.large-icon {
  font-size: 18px;
}

.el-table th, .el-table td {
  padding: 1px 0!important;
}

.mini-class{
  .el-form-item {
    margin-bottom: 2px; 
  }
} 
</style>
