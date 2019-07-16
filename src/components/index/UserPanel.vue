<template>
    <div id="userpanel">
        <div class="circlepicture">
          <img src="../../assets/img/user02.png" alt="">
        </div>
        <div class="usertext">
          <Icon type="ios-contact" />{{username}}
        </div>
        <a href="javascript:;" class="userlink"> <Icon type="ios-settings" />账号设置</a>
    </div>
</template>

<script>
export default {
  name: 'UserPanel',
  data: function () {
    return {
      username: '匿名用户'
    }
  },
  mounted: function () {
    // GET /someUrl
    var that = this
    this.axios({
      method: 'get',
      url: 'api/user'
    }).then(response => {
      that.username = response.data.user
    }, response => {
      console.log('error')
    })
  }
}
</script>

<style scoped>
  #userpanel{
    padding: 32px;
    padding-top: 28px;
    padding-bottom: 10px;
  }
  .circlepicture{
    border-radius: 50%;
    width: 90px;
    height: 90px;
    margin: auto;
    margin-bottom: 10px;
    overflow: hidden;
  }
  .usertext{
    display: block;
    color: #2ecf7c;
    font-size: 14px;
    margin-left: 23px;
    text-align: left;
  }
  .userlink{
    color: #6d787c;
    font-size: 14px;
    margin-left: 23px;
    margin-top: 5px;
    text-align: left;
    display: block;
  }
</style>
