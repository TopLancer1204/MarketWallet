// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './NftCollectionCard.scss';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button/Button';

import { Expander } from '@polkadot/react-components';
import { NftCollectionInterface, useCollections, useDecoder } from '@polkadot/react-hooks';

import NftTokenCard from '../NftTokenCard';

interface Props {
  account: string | null;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  removeCollection: (collection: string) => void;
  openTransferModal: (collection: NftCollectionInterface, tokenId: string, balance: number) => void;
  shouldUpdateTokens: string | undefined;
}

function NftCollectionCard ({ account, canTransferTokens, collection, openTransferModal, removeCollection, shouldUpdateTokens }: Props): React.ReactElement<Props> {
  const [opened, setOpened] = useState(false);
  const [tokensOfCollection, setTokensOfCollection] = useState<Array<string>>([]);
  const { getTokensOfCollection } = useCollections();
  const currentAccount = useRef<string | null | undefined>();
  const { collectionName16Decoder } = useDecoder();

  const openCollection = useCallback((isOpen) => {
    setOpened(isOpen);
  }, []);

  const updateTokens = useCallback(async () => {
    if (!account) {
      return;
    }

    const tokensOfCollection = (await getTokensOfCollection(collection.id, account)) as string[];
    console.log('tokensOfCollection', tokensOfCollection);

    setTokensOfCollection(tokensOfCollection);
  }, [account, collection, getTokensOfCollection]);

  // clear search results if account changed
  useEffect(() => {
    if (currentAccount.current && currentAccount.current !== account) {
      setOpened(false);
      setTokensOfCollection([]);
    }

    currentAccount.current = account;
  }, [account, currentAccount, setOpened, setTokensOfCollection]);

  useEffect(() => {
    if (shouldUpdateTokens === collection.id && opened) {
      void updateTokens();
    }
  }, [collection.id, opened, shouldUpdateTokens, updateTokens]);

  useEffect(() => {
    if (opened) {
      void updateTokens();
    }
  }, [opened, updateTokens]);

  console.log('shouldUpdateTokens', shouldUpdateTokens, 'collection.id', collection.id, 'opened', opened);

  return (
    <Expander
      className='nft-collection-item'
      isOpen={opened}
      onClick={openCollection}
      summary={
        <>
          <strong>{collectionName16Decoder(collection.Name)}</strong>
          { collection.Description && (
            <span> {collectionName16Decoder(collection.Description)}</span>
          )}
          { collection.Mode.isReFungible &&
            <strong>, re-fungible</strong>
          }
        </>
      }
    >
      <table className='table'>
        <tbody>
          { account && tokensOfCollection.map((token) => (
            <NftTokenCard
              account={account}
              canTransferTokens={canTransferTokens}
              collection={collection}
              key={token}
              openTransferModal={openTransferModal}
              shouldUpdateTokens={shouldUpdateTokens}
              token={token}
            />
          ))}
        </tbody>
      </table>
      <Button
        basic
        color='red'
        onClick={removeCollection.bind(null, collection.id)}>
        Remove collection
      </Button>
    </Expander>
  );
}

export default React.memo(NftCollectionCard);
