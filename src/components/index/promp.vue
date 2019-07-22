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
        title: '请输入图层名称：',
        render: (h) => {
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
