// Copyright 2017-2020 @polkadot/app-explorer authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, FilterOverlay, Input } from '@polkadot/react-components';
import { isHex } from '@polkadot/util';

import { useTranslation } from './translate';

interface Props {
  className?: string;
  value?: string;
}

interface State {
  value: string;
  isValid: boolean;
}

function stateFromValue (value: string): State {
  const isValidHex = isHex(value, 256);
  const isNumber = !isValidHex && /^\d+$/.test(value);

  return {
    value,
    isValid: isValidHex || isNumber
  };
}

function Query ({ className, value: propsValue }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [{ value, isValid }, setState] = useState(stateFromValue(propsValue || ''));

  const _setHash = (value: string): void => setState(stateFromValue(value));
  const _onQuery = (): void => {
    if (isValid && value.length !== 0) {
      window.location.hash = `/explorer/query/${value}`;
    }
  };

  return (
    <FilterOverlay className={className}>
      <Input
        className='explorer--query'
        defaultValue={propsValue}
        isError={!isValid && value.length !== 0}
        placeholder={t('block hash or number to query')}
        onChange={_setHash}
        onEnter={_onQuery}
        withLabel={false}
      >
        <Button
          icon='play'
          onClick={_onQuery}
        />
      </Input>
    </FilterOverlay>
  );
}

export default React.memo(styled(Query)`
  .explorer--query {
    width: 20em;
  }
`);
