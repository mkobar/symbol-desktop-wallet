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
import {Component, Vue} from 'vue-property-decorator'
import {mapGetters} from 'vuex'

// internal dependencies
import {AccountsModel} from '@/core/database/models/AppAccount'
import routes from '@/router/routes'

@Component({
  computed: {
    ...mapGetters({
      currentAccount: 'account/currentAccount',
    }),
  },
})
export class PageNavigatorTs extends Vue {
  /**
   * Currently active account
   * @see {Store.Account}
   * @var {string}
   */
  public currentAccount: AccountsModel

/// region computed properties getter/setter
  get routes() {
    return routes.shift().children
      .filter(({meta}) => meta.clickable)
      .map(({path, meta}) => ({path, meta}))
  }
/// end-region computed properties getter/setter

  /**
   * Executes action of logout
   * @return {void}
   */
  public logout() {
    this.$store.dispatch('account/LOG_OUT')
    this.$router.push({name: 'login'})
  }
}
