<template>
  <div>
  <Button type="success" long  @click="handleRender">新建图层</Button>
  </div>
</template>
<script>
export default {
  data () {
    return {
      value: ''
    }
  },
  methods: {
    handleRender () {
      var that = this
      that.value = ''
      this.$Modal.confirm({
        title: '请输入网格名称：',
        render: (h) => {
          /* const menuItems = ['首页', '搜索', '分类', '系统']
          return h('ul',
            {
              class: {'uk-nav': true}
            },
            menuItems.map(item => h('li', item)))
        } */
          return h('Input', {
            props: {
              value: this.value,
              autofocus: true,
              placeholder: 'Please enter your name...'
            },
            on: {
              input: (val) => {
                this.value = val
              }
            }
          })
        },
        onOk: function () {
          that.$emit('sendName', that.value)
        }
      })
    }
  }
}
</script>
