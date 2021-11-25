<template>
  <div id="page-demo" class="unipass-page">
    <i class="background-logo iconfont icon-logo"></i>
    <div class="head">UniPass Demo</div>
    <div v-if="username">
      <div>
        <br />
        <h3>{{ username }}</h3>
        <br />
      </div>
      <el-button class="transfer" type="primary" @click="logout">
        logout
      </el-button>
    </div>
    <div v-else>
      <el-button type="primary" class="transfer login" @click="connect">
        login
      </el-button>
    </div>
    <el-tabs v-model="activeTab" class="body" type="border-card">
      <el-tab-pane label="CKB Transaction" name="first">
        <el-form
          ref="form"
          class="body-input"
          label-position="top"
          :model="form"
          @submit.native.prevent
        >
          <el-form-item label="Your Address:" prop="address">
            <el-input v-model="myAddress" disabled readonly />
          </el-form-item>
          <el-form-item label="Your Balance:" prop="address">
            <el-input v-model="myBalanceFormat" disabled readonly />
          </el-form-item>
          <el-form-item label="Transfer CKB To:" prop="address">
            <el-input v-model="toAddress" clearable />
          </el-form-item>
          <el-form-item label="Amount:" prop="address">
            <el-input v-model="toAmount" clearable />
          </el-form-item>
        </el-form>

        <br />
        <div>
          <el-button type="primary" class="transfer" @click="sendCKB"
            >send</el-button
          >
        </div>

        <div>{{ txHash }}</div>
      </el-tab-pane>
      <el-tab-pane label="Sign Message" name="second">
        <div>
          <br />
          <h3 class="input">Message:</h3>
          <el-input
            v-model="message"
            type="textarea"
            :autosize="{ minRows: 8, maxRows: 10 }"
            resize="none"
          >
          </el-input>
          <br />
          <div class="message">
            <el-button type="primary" class="message-button" @click="authorize"
              >authorize</el-button
            >
            <el-button type="primary" class="message-button" @click="verifySig"
              >verify</el-button
            >
          </div>
          <br />
          <div v-if="sig">
            <h3 class="input">Signature:</h3>
            <el-input
              v-model="sig"
              type="textarea"
              :autosize="{ minRows: 8, maxRows: 10 }"
              resize="none"
            >
            </el-input>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import UP, { UPAuthMessage, UPAuthResponse } from 'up-core-test'
import UPCKB from 'up-ckb-alpha-test'
import {
  Address,
  IndexerCollector,
  ChainID,
  DepType,
  CellDep,
  OutPoint,
  AddressType,
  Amount,
} from '@lay2/pw-core'
import { UPCoreSimpleProvier } from '~/assets/js/up-core-simple-provider'
const NodeRSA = require('node-rsa')

const AGGREGATOR_URL = 'https://t.aggregator.unipass.id/dev/snapshot/'
// const ASSET_LOCK_CODE_HASH =
//   '0xd3f6d12ac220b3f7e104f3869e72487f8940adb13a526a2abd775c2cd5040f77'
// const ASSET_LOCK_DEP_TX_HASH =
//   '0x30eaed1d7609cffe7a3074a6216117693308f1324ded3bc74ba9c57ffe968f8b'
const ASSET_LOCK_CODE_HASH =
  '0x3e1eb7ed4809b2d60650be96a40abfbdafb3fb942b7b37ec7709e64e2cd0a783'
const ASSET_LOCK_DEP_TX_HASH =
  '0x2e243c7e0fdbfba4e66bdf28c8a26fbfdfe4493c25df5995874625b288f6d74d'

const CKB_NODE_URL = 'https://testnet.ckb.dev'
const CKB_INDEXER_URL = 'https://testnet.ckb.dev/indexer'

function getPubkeyFromUPKey(upPubkey: string) {
  const key = new NodeRSA()

  const pubkeyBuffer = Buffer.from(upPubkey.replace('0x', ''), 'hex')
  const e = pubkeyBuffer.slice(0, 4).readUInt32BE(0)
  const n = pubkeyBuffer.slice(4)

  key.importKey(
    {
      e,
      n,
    },
    'components-public',
  )
  key.setOptions({ signingScheme: 'pkcs1-sha256' })

  return key
}

function verifyUniPassSig(msg: string, authResp: UPAuthResponse): boolean {
  const { keyType, pubkey, sig } = authResp
  if (keyType === 'RsaPubkey') {
    const key = getPubkeyFromUPKey(pubkey)

    // prefix message for plain msg
    let messageBuffer = Buffer.from(msg)
    const prefix = Buffer.from(
      `\u0018UniPass Signed Message:\n${messageBuffer.length.toString()}`,
      'utf-8',
    )
    messageBuffer = Buffer.concat([prefix, messageBuffer])

    const ret = key.verify(
      messageBuffer,
      Buffer.from(sig.replace('0x', ''), 'hex'),
    )

    return ret
  } else {
    throw new Error(`UnSupported keyType ${keyType}`)
  }
}

export default Vue.extend({
  data() {
    return {
      username: '',
      message: 'TO BE SIGNED MESSAGE abc',
      sig: '',
      activeTab: 'first',
      myAddress: '',
      myBalance: '0.00',
      toAddress: '',
      toAmount: '0.00',
      txHash: '',
      form: {},
    }
  },
  computed: {
    myBalanceFormat(): string {
      return this.myBalance + ' CKB'
    },
  },
  mounted() {
    UP.config({
      domain: 't.app.unipass.id',
    })

    UPCKB.config({
      aggregatorUrl: AGGREGATOR_URL,
      chainID: ChainID.ckb_testnet,
      ckbNodeUrl: CKB_NODE_URL,
      upLockCodeHash: ASSET_LOCK_CODE_HASH,
      upLockDep: new CellDep(
        DepType.code,
        new OutPoint(ASSET_LOCK_DEP_TX_HASH, '0x0'),
      ),
    })
  },
  methods: {
    async connect() {
      console.log('connect clicked')
      try {
        const account = await UP.connect({ email: false, evmKeys: true })
        this.username = account.username
        console.log('account', account)
        const address: Address = UPCKB.getCKBAddress(this.username)
        this.myAddress = address.toCKBAddress()

        const indexerCollector = new IndexerCollector(CKB_INDEXER_URL)
        const balance = await indexerCollector.getBalance(address as Address)
        console.log('balance', balance)
        this.myBalance = balance.toString()
      } catch (err) {
        this.$message.error(err as string)
        console.log('connect err', err)
      }
    },
    logout() {
      console.log('connect clicked')
      UP.disconnect()
      this.username = ''
    },
    async authorize() {
      console.log('authorize clicked')
      this.sig = ''
      console.log({
        username: this.username,
        message: this.message,
      })
      try {
        const resp = await UP.authorize(
          new UPAuthMessage('PLAIN_MSG', this.username, this.message),
        )
        console.log('resp', resp)
        this.sig = JSON.stringify(resp)
      } catch (err) {
        this.$message.error(err as string)
        console.log('auth err', err)
      }
    },

    verifySig() {
      try {
        const ret = verifyUniPassSig(
          this.message,
          JSON.parse(this.sig) as UPAuthResponse,
        )
        if (ret === true) {
          this.$message.success('verify signature success')
        } else {
          this.$message.error('verify signature failed')
        }
      } catch (err) {
        this.$message.error(err as string)
        console.log('auth err', err)
      }
    },
    async sendCKB() {
      try {
        UP.initPop()
        const toAddress = new Address(this.toAddress, AddressType.ckb)
        const toAmount = new Amount(this.toAmount)
        console.log('send ckb target', toAddress, toAmount)

        // send ckb tx
        const txHash = await UPCKB.sendCKB(
          toAddress,
          toAmount,
          new UPCoreSimpleProvier(this.username, ASSET_LOCK_CODE_HASH),
        )

        this.txHash = txHash

        console.log('send ckb success', txHash)
      } catch (err) {
        this.$message.error(err as string)
        console.log('err', err)
      }
    },
  },
})
</script>

<style lang="stylus">
#page-demo {
  max-width: 480px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  background: #F5F5FF;

  > * {
    z-index: 1;
  }

  > .background-logo {
    font-size: 237px;
    position: absolute;
    top: 16px;
    right: -40px;
    color: #5575ff;
    opacity: 0.14;
    z-index: 0;
  }

  .head {
    text-align: left;
    font-family: Helvetica;
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 20px;
    color: black;
  }

  .transfer {
    width: 100%;
    font-size: 20px;
  }

  .login {
    margin-top: 50px;
    font-size: 20px;
  }

  .body {
    border-radius: 24px;
    margin: 30px auto 0px;
    width: 100%;
    background: #FFFFFF;
    padding: 0px 0 21px;
    overflow: hidden;

    .body-input {
      margin-top: -20px;
    }

    .input {
      text-align: left;
      margin-bottom: 20px;
    }
  }

  .message {
    display: flex;
    justify-content: space-between;

    .message-button {
      margin-top: 30px;
      width: 48%;
      font-size: 20px;
    }
  }
}

.unipass-page {
  padding: 24px;
  padding-top: 29px;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  text-align: center;
}
</style>
