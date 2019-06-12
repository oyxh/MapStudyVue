<template>
  <div>
    <br>
    <Button type="success" long ="true">新建图层</Button>
    <br><br>
    <Button type="primary" long="true">导入数据</Button>
    <br><br>
    <single-layer></single-layer>
  </div>
</template>

<script>
import SingleLayer from './SingleLayer'
export default {
  name: 'LayerItems',
  components: {SingleLayer}
}
</script>

<style scoped>

</style>
