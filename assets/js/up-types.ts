/* eslint-disable no-useless-constructor */
export class UPAccount {
  constructor(public username: string, public email?: string) {}
}
export type keyType = 'Secp256k1Pubkey' | 'Secp256r1Pubkey' | 'RsaPubkey'

export class UPAuthResponse {
  constructor(
    public keyType: keyType,
    public pubkey: string,
    public sig: string,
  ) {}
}

// ---------- AUTHORIZE ----------
type AUTH_TYPE = 'PLAIN_MSG' | 'CKB_TX' | 'EVM_TX' | 'FLOW_TX'
export type AUTH_HASH = 'sha256' | 'sha3' | 'blake2b'

export class UPAuthMessage {
  constructor(
    public readonly type: AUTH_TYPE,
    public readonly username: string,
    public readonly payload: string,
    public readonly hash: AUTH_HASH = 'sha256',
  ) {
    console.log(hash)
  }
}

type RESPONSE_TYPE = 'APPROVE' | 'DECLINE'
export class UPResponse {
  constructor(
    public readonly type: RESPONSE_TYPE,
    public readonly data: UPAccount | UPAuthResponse | string,
  ) {}
}
export type UPMessageType =
  | 'UP_READY'
  | 'UP_RESPONSE'
  | 'UP_CLOSE'
  | 'UP_AUTH'
  | 'UP_LOGIN'
  | 'UP_ERROR'

// ------------ CONNECT ------------
export class UPMessage {
  constructor(
    public type: UPMessageType,
    public payload?: string, // public resolve?: any, // public reject?: any
  ) {}
}

export type UPConnectOptions = {
  email: boolean
}
