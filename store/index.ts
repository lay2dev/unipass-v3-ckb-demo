const store = {
  strict: false,
  state() {
    return {}
  },
  getters: {},
  mutations: {
    setUser(state: any, user: any) {
      state.user = user
    },
    resetUser(state: any, user: any) {
      state.user = user
    },
  },
  actions: {},
  modules: {},
}
export default store
