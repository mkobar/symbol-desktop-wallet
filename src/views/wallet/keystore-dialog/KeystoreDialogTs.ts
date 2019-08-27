import {Message} from "@/config/index.ts"
import {decryptKey, encryptKeystore} from "@/core/utils/wallet.ts"
import {copyTxt, localRead} from "@/core/utils/utils.ts"
import {Component, Vue, Prop, Watch} from 'vue-property-decorator'

@Component
export class KeystoreDialogTs extends Vue {
    stepIndex = 0
    show = false
    QRCode = ''
    keystoreText = ''
    wallet = {
        password: ''
    }

    @Prop()
    showKeystoreDialog: boolean


    get getWallet() {
        return this.$store.state.account.wallet
    }

    saveQRCode() {

    }

    keystoreDialogCancel() {
        this.$emit('closeKeystoreDialog')
        setTimeout(() => {
            this.stepIndex = 0
        }, 300)
    }

    exportKeystore() {
        switch (this.stepIndex) {
            case 0 :
                this.checkWalletPassword()
                break;
            case 1 :
                this.generateKeystore()
                break;
            case 2 :
                this.stepIndex = 3
                break;
        }
    }

    async generateKeystore() {
        const walletList = localRead('wallets') ? JSON.parse(localRead('wallets')) : []
        const address = this.getWallet.address
        let walletInfo: any
        walletList.every((item) => {
            if (item.address === address) {
                walletInfo = item
                return false
            }
            return true
        })
        this.keystoreText = encryptKeystore(JSON.stringify(walletInfo))
        this.stepIndex = 2
    }

    checkWalletPassword() {
        if (!this.checkInput()) return
        this.stepIndex = 1
    }

    checkInput() {
        const {password} = this.wallet
        if (!password || password == '') {
            this.$Notice.destroy()
            this.$Notice.error({
                title: this.$t(Message.PLEASE_SET_WALLET_PASSWORD_INFO) + ''
            })
            return false
        }
        const privatekey = decryptKey(this.getWallet, this.wallet.password) + ''
        if (privatekey.length !== 64) {
            this.$Notice.destroy()
            this.$Notice.error({
                title: this.$t(Message.WRONG_PASSWORD_ERROR) + ''
            })
            return false
        }
        return true
    }

    toPrevPage() {
        this.stepIndex = 2
    }

    copyKeystore() {
        copyTxt(this.keystoreText).then((data) => {
            this.$Notice.success({
                title: this.$t(Message.COPY_SUCCESS) + ''
            });
        })
    }


    @Watch('showKeystoreDialog')
    onShowKeystoreDialogChange() {
        this.show = this.showKeystoreDialog
    }
}