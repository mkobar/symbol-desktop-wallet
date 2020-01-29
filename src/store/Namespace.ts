/**
 * Copyright 2020 NEM Foundation (https://nem.io)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {NamespaceInfo, NamespaceId, QueryParams, Transaction, TransactionType} from 'nem2-sdk'
import Vue from 'vue'

// internal dependencies
import {RESTService} from '@/services/RESTService'
import {AwaitLock} from './AwaitLock';
const Lock = AwaitLock.create();

export default {
  namespaced: true,
  state: {
    initialized: false,
    namespacesInfoByHex: {},
    namespacesNamesByHex: {},
  },
  getters: {
    getInitialized: state => state.initialized,
    namespacesInfo: state => state.namespacesInfoByHex,
    namespacesInfoList: state => Object.keys(state.namespacesInfoByHex).map(hex => state.namespacesInfoByHex[hex]),
    namespacesNames: state => state.namespacesNamesByHex,
  },
  mutations: {
    setInitialized: (state, initialized) => { state.initialized = initialized },
    addNamespaceInfo: (state, namespaceInfo: NamespaceInfo) => {
      let info = state.namespacesInfoByHex
      let hex = info.id.toHex()

      // register mosaic info
      info[hex] = namespaceInfo
      Vue.set(state, 'namespacesInfoByHex', info)
    },
    addNamespaceName: (state, payload: {hex: string, name: string}) => {
      let names = state.namespacesNamesByHex
      let hex = payload.hex

      // register mosaic name
      names[hex] = payload.name
      Vue.set(state, 'namespacesNamesByHex', names)
    },
  },
  actions: {
    async initialize({ commit, dispatch, getters }) {
      const callback = async () => {
        // update store
        commit('setInitialized', true)
      }

      // aquire async lock until initialized
      await Lock.initialize(callback, {commit, dispatch, getters})
    },
    async uninitialize({ commit, dispatch, getters }) {
      const callback = async () => {
        commit('setInitialized', false)
      }
      await Lock.uninitialize(callback, {commit, dispatch, getters})
    },
/// region scoped actions
    async REST_FETCH_INFO({commit, rootGetters}, namespaceId: NamespaceId) {
      const nodeUrl = rootGetters['network/currentPeer'].url
      const namespaceHttp = RESTService.create('NamespaceHttp', nodeUrl)
      const mosaicInfo = await namespaceHttp.getNamespace(namespaceId).toPromise()

      commit('addNamespaceInfo', mosaicInfo)
      return mosaicInfo
    },
    async REST_FETCH_NAMES({commit, rootGetters}, namespaceIds: NamespaceId[]) {
      const nodeUrl = rootGetters['network/currentPeer'].url
      const namespaceHttp = RESTService.create('NamespaceHttp', nodeUrl)
      const namespaceNames = await namespaceHttp.getNamespacesName(namespaceIds).toPromise()

      // map by hex if names available
      const mappedNames = namespaceNames.filter(
        entry => entry.name.length >= 1
      ).map(
        ({namespaceId, name}) => { return {
          hex: namespaceId.toHex(),
          name: name
        }})

      // update store
      mappedNames.map(mappedEntry => commit('addNamespaceName', mappedEntry))
      return namespaceIds.length === 1 ? mappedNames.shift().name : mappedNames
    },
/// end-region scoped actions
  }
}