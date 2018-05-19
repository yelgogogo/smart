import * as types from '../types'

const state = {
  loading: false
}

const actions = {
  setLoadingState ({ commit }, status) {
    commit(types.COM_LOADING_STATUS, status)
  }
}

const getters = {
  loading: state => state.loading
}

const mutations = {
  [types.COM_LOADING_STATUS] (state, status) {
    state.loading = status
  }
}

export default {
  state,
  actions,
  getters,
  mutations
}
