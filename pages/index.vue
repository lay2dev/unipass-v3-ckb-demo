<template>
  <div id="page-index">
    <h1>UniPass L3 Demo</h1>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      helloAven: 'Aven',
    }
  },
  created() {
    console.log('🌊', 'evan')
  },
})
</script>
<style lang="stylus">
#page-index {
}
</style>
