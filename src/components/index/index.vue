<style scoped>
  .layout{
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
  }
  .layout-logo{
    width: 100px;
    height: 30px;
    background: #5b6270;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 15px;
    left: 20px;
  }
  .layout-nav{
    width: 420px;
    margin: 0 auto;
    margin-right: 20px;
  }
</style>
<template>
  <div class="layout">
    <Layout>
      <Header>
        <Menu mode="horizontal" theme="dark"  active-name="1">
          <div class="layout-logo"></div>
          <div class="layout-nav">
            <MenuItem name="1">
              <Icon type="ios-navigate"></Icon>
              Item 1
            </MenuItem>
            <MenuItem name="2">
              <Icon type="ios-keypad"></Icon>
              Item 2
            </MenuItem>
            <MenuItem name="3">
              <Icon type="ios-analytics"></Icon>
              Item 3
            </MenuItem>
            <MenuItem name="4">
              <Icon type="ios-paper"></Icon>
              Item 4
            </MenuItem>
          </div>
        </Menu>
      </Header>
      <Layout>
        <Sider hide-trigger :style="{background: '#fff'}">
          <user-panel></user-panel>
          <div>
            <Menu width="200px" active-name="1-2" :open-names="['1']">
              <MenuItem name="1" @click.native ="mapWindowAutoLeft">
                <Icon type="ios-paper" />
                图层管理
              </MenuItem>
              <Submenu name="1">
                <template slot="title">
                  <Icon type="ios-paper" />
                  内容管理
                </template>
                <MenuItem name="1-1">文章管理</MenuItem>
                <MenuItem name="1-2">评论管理</MenuItem>
                <MenuItem name="1-3">举报管理</MenuItem>
              </Submenu>
              <Submenu name="2">
                <template slot="title">
                  <Icon type="ios-people" />
                  用户管理
                </template>
                <MenuItem name="2-1">新增用户</MenuItem>
                <MenuItem name="2-2">活跃用户</MenuItem>
              </Submenu>
            </Menu>
          </div>
        </Sider>
        <Layout :style="{padding: '0 5px 5px'}">
          <Content :style="{padding: '5px', minHeight: '480px', background: '#fff'}">
            <!-- 渲染组件 -->
            <MapWindow v-bind:is-active="isActive"></MapWindow>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  </div>
</template>
<script>
import MapWindow from './MapWindow.vue'
import UserPanel from './UserPanel.vue'
import Two from './two.vue'
export default {
  components: {MapWindow, UserPanel, Two},
  data: function () {
    return {
      isActive: true
    }
  },
  methods: {
    mapWindowAutoLeft () {
      this.isActive = !this.isActive
    }
  }
}
</script>
