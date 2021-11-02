<template>
  <div>
    <b>UniPass Demo</b>
    <br />
    <div>
      <br />
      <h3>{{ username }}</h3>
      <br />
    </div>
    <div v-if="username">
      <el-button type="info" @click="logout">logout</el-button>
      <!-- <el-button type="primary">home</el-button> -->
    </div>
    <div v-else>
      <el-button type="primary" @click="connect">login</el-button>
    </div>
    <br />
    <div>
      <br />
      <h3>hash message</h3>
      <el-input v-model="message" type="textarea" :rows="2"> </el-input>
      <div>
        <h3>hash way</h3>
        <el-radio v-model="hash" label="sha256">sha256</el-radio>
        <el-radio v-model="hash" label="sha3">sha3</el-radio>
        <el-radio v-model="hash" label="blake2b">blake2b</el-radio>
      </div>
      <br />
      <div>
        <el-button type="primary" @click="authorize">authorize</el-button>
      </div>
      <br />
      <div v-if="signData">
        <h3>sign data</h3>
        <el-input v-model="signData" type="textarea" :rows="8"> </el-input>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import UP from 'up-core'
import { UPAuthMessage, AUTH_HASH } from '~/assets/js/up-types'

export default Vue.extend({
  data() {
    return {
      username: '',
      message: 'TO BE SIGNED MESSAGE abc',
      signData: '',
      hash: 'sha256' as AUTH_HASH,
    }
  },
  mounted() {
    UP.config(
      'http://localhost:3000/login',
      'http://localhost:3000/login',
      'http://localhost:3000/sign',
    )
  },
  methods: {
    async connect() {
      console.log('connect clicked')
      try {
        const account = await UP.connect()
        this.username = account.username
        console.log('account', account)
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
      this.signData = ''
      console.log({
        username: this.username,
        message: this.message,
        hash: this.hash,
      })
      try {
        const resp = await UP.authorize(
          new UPAuthMessage(
            'PLAIN_MSG',
            this.username,
            this.message,
            this.hash,
          ),
        )
        console.log('resp', resp)
        this.signData = JSON.stringify(resp)
      } catch (err) {
        this.$message.error(err as string)
        console.log('auth err', err)
      }
    },
  },
})
</script>
