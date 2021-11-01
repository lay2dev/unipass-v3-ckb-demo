import { Context } from '@nuxt/types'
export default function ({ $axios }: Context) {
  $axios.setHeader('Content-Type', 'application/json', ['post'])
  $axios.interceptors.response.use((res: any) => {
    return res.data
  })
}
