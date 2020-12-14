// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TFunction } from 'i18next';
import { Routes } from './types';

import extrinsics from './extrinsics';
import accounts from './accounts';
import addresses from './addresses';
import calendar from './calendar';
import claims from './claims';
import contracts from './contracts';
import council from './council';
import democracy from './democracy';
import explorer from './explorer';
import genericAsset from './generic-asset';
import js from './js';
import nftWallet from './nft-wallet';
import nftMint from './nft-mint';
import nftStore from './nft-store';
import parachains from './parachains';
import poll from './poll';
import rpc from './rpc';
import settings from './settings';
import signing from './signing';
import society from './society';
import staking from './staking';
import storage from './storage';
import sudo from './sudo';
import techcomm from './techcomm';
import transfer from './transfer';
import treasury from './treasury';

export default function create (t: TFunction): Routes {
  return [
    nftWallet(t),
    nftMint(t),
    nftStore(t),
    settings(t),
    extrinsics(t),
    accounts(t),
    addresses(t),
    explorer(t),
    claims(t),
    poll(t),
    transfer(t),
    genericAsset(t),
    staking(t),
    democracy(t),
    council(t),
    treasury(t),
    techcomm(t),
    parachains(t),
    society(t),
    calendar(t),
    contracts(t),
    storage(t),
    rpc(t),
    signing(t),
    sudo(t),
    js(t),
  ];
}
