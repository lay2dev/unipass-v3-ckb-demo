<template>
  <div id="page-demo">
    <b>UniPass Demo</b>
    <br />
    <div v-if="username">
      <div>
        <br />
        <h3>{{ username }}</h3>
        <br />
      </div>
      <el-button type="info" @click="logout">logout</el-button>
      <!-- <el-button type="primary">home</el-button> -->
    </div>
    <div v-else>
      <el-button type="primary" @click="connect">login</el-button>
    </div>
    <br />
    <el-tabs v-model="activeTab">
      <el-tab-pane label="CKB Transaction" name="first">
        <div>Your Address: {{ myAddress }}</div>
        <div>Your Balance: {{ myBalance }} CKB</div>
        <br />
        <div class="demo-input-suffix">
          Transfer CKB To: <el-input v-model="toAddress"></el-input>
        </div>
        <br />
        <div>Amount: <el-input v-model="toAmount"></el-input></div>
        <br />
        <div><el-button type="primary" @click="sendCKB">send</el-button></div>

        <div>{{ txHash }}</div>
      </el-tab-pane>
      <el-tab-pane label="Sign Message" name="second">
        <div>
          <br />
          <h3>Message:</h3>
          <el-input v-model="message" type="textarea" :rows="2"> </el-input>
          <br />
          <div>
            <el-button type="primary" @click="authorize">authorize</el-button>
            <el-button type="primary" @click="verifySig">verify</el-button>
          </div>
          <br />
          <div v-if="sig">
            <h3>Signature:</h3>
            <el-input v-model="sig" type="textarea" :rows="8"> </el-input>
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
    }
  },
  mounted() {
    UP.config(
      't.app.unipass.id',
      'https://t.app.unipass.id/connect',
      'https://t.app.unipass.id/authorize',
      // 'localhost:3000',
      // 'http://localhost:3000/connect',
      // 'http://localhost:3000/authorize',
    )

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
        const account = await UP.connect()
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
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
