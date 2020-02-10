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
// external dependencies
import {UInt64, NamespaceRegistrationTransaction, NamespaceRegistrationType, TransactionType, Transaction, NamespaceInfo} from 'nem2-sdk'
import {Component, Vue, Prop} from 'vue-property-decorator'
import {mapGetters} from 'vuex'

// internal dependencies
import {ViewNamespaceRegistrationTransaction, NamespaceRegistrationFormFieldsType} from '@/core/transactions/ViewNamespaceRegistrationTransaction'
import {FormTransactionBase} from '@/views/forms/FormTransactionBase/FormTransactionBase'
import {TransactionFactory} from '@/core/transactions/TransactionFactory'

// configuration
import feesConfig from '@/../config/fees.conf.json'

// child components
import {ValidationObserver, ValidationProvider} from 'vee-validate'
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue'
// @ts-ignore
import FormLabel from '@/components/FormLabel/FormLabel.vue'
// @ts-ignore
import SignerSelector from '@/components/SignerSelector/SignerSelector.vue'
// @ts-ignore
import NamespaceSelector from '@/components/NamespaceSelector/NamespaceSelector.vue'
// @ts-ignore
import NamespaceNameInput from '@/components/NamespaceNameInput/NamespaceNameInput.vue'
// @ts-ignore
import DurationInput from '@/components/DurationInput/DurationInput.vue'
// @ts-ignore
import MaxFeeSelector from '@/components/MaxFeeSelector/MaxFeeSelector.vue'
// @ts-ignore
import ModalTransactionConfirmation from '@/views/modals/ModalTransactionConfirmation/ModalTransactionConfirmation.vue'

@Component({
  components: {
    ValidationObserver,
    ValidationProvider,
    FormLabel,
    FormWrapper,
    SignerSelector,
    NamespaceNameInput,
    NamespaceSelector,
    DurationInput,
    MaxFeeSelector,
    ModalTransactionConfirmation,
  },
  computed: {...mapGetters({
    ownedNamespaces: 'wallet/currentWalletOwnedNamespaces'
  })}
})
export class FormNamespaceRegistrationTransactionTs extends FormTransactionBase {
  /**
   * Current wallet's owned namespaces
   * @var {NamespaceInfo[]}
   */
  public ownedNamespaces: NamespaceInfo[]

  /**
   * Root namespace type exposed to view
   * @var {NamespaceRegistrationType}
   */
  public typeRootNamespace = NamespaceRegistrationType.RootNamespace

  /**
   * Sub namespace type exposed to view
   * @var {NamespaceRegistrationType}
   */
  public typeSubNamespace = NamespaceRegistrationType.SubNamespace

  /**
   * Form items
   * @var {Record<string, any>}
   */
  public formItems = {
    signerPublicKey: '',
    registrationType: NamespaceRegistrationType.RootNamespace,
    newNamespaceName: null,
    parentNamespaceName: '',
    duration: 172800,
    maxFee: 0,
  }

  /**
   * Reset the form with properties
   * @return {void}
   */
  protected resetForm() {
    // - re-populate form if transaction staged
    if (this.stagedTransactions.length) {
      const transaction = this.stagedTransactions.find(staged => staged.type === TransactionType.REGISTER_NAMESPACE)
      this.transactions = [transaction as NamespaceRegistrationTransaction]
      this.isAwaitingSignature = true
      return ;
    }

    // - set default form values
    this.formItems.signerPublicKey = this.currentWallet.values.get('publicKey')
    this.formItems.registrationType = NamespaceRegistrationType.RootNamespace
    this.formItems.newNamespaceName = ''
    this.formItems.parentNamespaceName = ''
    this.formItems.duration = 10000

    // - maxFee must be absolute
    const defaultFee = feesConfig['single'].find(s => s.speed === 'NORMAL')
    this.formItems.maxFee = this.getAbsoluteFee(defaultFee.value)
  }

/// region computed properties getter/setter
  /**
   * Getter for MOSAIC DEFINITION and SUPPLY CHANGE transactions that will be staged
   * @see {FormTransactionBase}
   * @return {TransferTransaction[]}
   */
  protected get transactions(): Transaction[] {
    this.factory = new TransactionFactory(this.$store)
    try {
      // - read form for definition
      const data: NamespaceRegistrationFormFieldsType = {
        registrationType: this.formItems.registrationType,
        rootNamespaceName: NamespaceRegistrationType.RootNamespace === this.formItems.registrationType 
                         ? this.formItems.newNamespaceName
                         : this.formItems.parentNamespaceName,
        subNamespaceName: NamespaceRegistrationType.SubNamespace === this.formItems.registrationType 
                        ? this.formItems.newNamespaceName
                        : '',
        duration: this.formItems.duration,
        maxFee: UInt64.fromUint(this.formItems.maxFee),
      }

      // - prepare mosaic definition transaction
      const view = new ViewNamespaceRegistrationTransaction(this.$store)
      view.parse(data)

      // - prepare mosaic definition and supply change
      return [
        this.factory.build(view),
      ]
    } catch (error) {
      console.error('Error happened in FormNamespaceRegistrationTransaction.transactions(): ', error)
    }
  }

  /**
   * Setter for TRANSFER transactions that will be staged
   * @see {FormTransactionBase}
   * @param {TransferTransaction[]} transactions
   * @throws {Error} If not overloaded in derivate component
   */
  protected set transactions(transactions: Transaction[]) {
    // - this form creates 2 transaction
    const transaction = transactions.shift() as NamespaceRegistrationTransaction

    // - populate from transaction
    this.formItems.registrationType = transaction.registrationType
    this.formItems.newNamespaceName = transaction.namespaceName
    this.formItems.parentNamespaceName = transaction.parentId ? transaction.parentId.toHex() : ''
    this.formItems.duration = transaction.duration ? transaction.duration.compact() : 0

    // - populate maxFee
    this.formItems.maxFee = transaction.maxFee.compact()
  }
/// end-region computed properties getter/setter
}