import Vue from 'vue'
import Clipboard from 'v-clipboard'

declare module 'vue/types/vue' {
  interface Vue {
    $clipboard: any
  }
}
// copy
Vue.use(Clipboard)
