// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './styles.scss';

import React, { useCallback, useEffect, useState } from 'react';
import Form from 'semantic-ui-react/dist/commonjs/collections/Form';
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid';
import Button from 'semantic-ui-react/dist/commonjs/elements/Button';
import Header from 'semantic-ui-react/dist/commonjs/elements/Header';

import { Dropdown, Input } from '@polkadot/react-components';
import { useMetadata } from '@polkadot/react-hooks';
import { TypeRegistry } from '@polkadot/types';

import { AttributeType, AttributeTypes, convertScaleAttrFromJson, convertScaleAttrToJson, CountType } from '../util/scaleUtils';

type TypeOption = {
  text: string;
  value: AttributeTypes;
}

const TypeOptions: TypeOption[] = [
  {
    text: 'string',
    value: 'Bytes'
  },
  {
    text: 'enumerable',
    value: '_enum'
  }
];

type CountOption = {
  text: string;
  value: CountType;
}

const CountOptions: CountOption[] = [
  {
    text: 'single',
    value: 'single'
  },
  {
    text: 'array',
    value: 'array'
  }
];

interface Props {
  account?: string;
  localRegistry?: TypeRegistry;
}

/*
const testSchema = `{
  "Gender": {
    "_enum": {
      "Male": null,
      "Female": null
    }
  },
  "Trait": {
    "_enum": {
      "Black Lipstick": null,
      "Smile": null
    }
  },
  "root": {
    "Gender": "Gender",
    "Traits": "Vec<Trait>",
    "ImageHash": "Bytes"
  }
}`;
*/

// [{ name: 'Name1', type: '_enum', values: ['enum1', 'enum2'] }, { name: 'Name2', type: 'Bytes' }];

function ManageCollectionAttributes (props: Props): React.ReactElement<Props> {
  const { localRegistry } = props;
  const [currentAttributeName, setCurrentAttributeName] = useState<string>('');
  const [currentAttributePluralName, setCurrentAttributePluralName] = useState<string>('');
  const [currentAttributeNameError, setCurrentAttributeNameError] = useState<string>();
  const [currentAttributePluralNameError, setCurrentAttributePluralNameError] = useState<string>();
  const [currentAttributeType, setCurrentAttributeType] = useState<AttributeTypes>('Bytes');
  const [currentAttributeCountType, setCurrentAttributeCountType] = useState<CountType>('single');
  const [currentAttributeEnumValue, setCurrentAttributeEnumValue] = useState<string>('');
  const [currentAttributeEnumValueError, setCurrentAttributeEnumValueError] = useState<string>();
  const [currentAttributeValues, setCurrentAttributeValues] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<AttributeType[]>([]);
  const { decodeStruct, encodeStruct } = useMetadata(localRegistry);

  // const tx = api.tx.nft.setConstOnChainSchema(collection_id, schema)

  const clearCurrentAttribute = useCallback(() => {
    setCurrentAttributeName('');
    setCurrentAttributePluralName('');
    setCurrentAttributeType('Bytes');
    setCurrentAttributeValues([]);
    setCurrentAttributeEnumValue('');
  }, []);

  const addAttribute = useCallback(() => {
    if (attributes.find((item: AttributeType) => item.name === currentAttributeName)) {
      setCurrentAttributeNameError('You already have attribute with same name!');

      return;
    }

    if (attributes.find((item: AttributeType) => item.pluralName === currentAttributeName && currentAttributeName !== '')) {
      setCurrentAttributePluralNameError('You already have attribute with same plural name!');

      return;
    }

    if (currentAttributeName && currentAttributeType) {
      setAttributes([
        ...attributes, {
          count: currentAttributeCountType,
          name: currentAttributeName,
          pluralName: currentAttributePluralName,
          type: currentAttributeType,
          values: currentAttributeValues
        }
      ]
      );
      clearCurrentAttribute();
      setCurrentAttributeNameError(undefined);
    }
  }, [attributes, clearCurrentAttribute, currentAttributeCountType, currentAttributeName, currentAttributePluralName, currentAttributeType, currentAttributeValues]);

  const onSaveAll = useCallback(() => {
    console.log('onSaveAll');
    // localStorage.removeItem('collectionAttributes');
  }, []);

  const onAddField = useCallback(() => {
    addAttribute();
  }, [addAttribute]);

  const addEnumValue = useCallback(() => {
    if (!currentAttributeValues.find((enumValue: string) => enumValue === currentAttributeEnumValue)) {
      setCurrentAttributeValues((prevState) => [...prevState, currentAttributeEnumValue]);
      setCurrentAttributeEnumValueError(undefined);
    } else {
      setCurrentAttributeEnumValueError('You already have attribute with same name!');
    }
  }, [currentAttributeEnumValue, currentAttributeValues]);

  const onAddEnumField = useCallback(() => {
    addEnumValue();
    setCurrentAttributeEnumValue('');
  }, [addEnumValue]);

  useEffect(() => {
    localStorage.setItem('collectionAttributes', JSON.stringify(attributes));
  }, [attributes]);

  useEffect(() => {
    try {
      const attrs: AttributeType[] = JSON.parse(localStorage.getItem('collectionAttributes') || '{}') as AttributeType[];

      setAttributes(attrs);
    } catch (e) {
      console.log('AttrLocalStorage parse error', e);
    }
  }, []);

  useEffect(() => {
    const exampleJson: AttributeType[] = [
      {
        count: 'array',
        name: 'Trait',
        pluralName: 'Traits',
        type: '_enum',
        values: ['Black Lipstick', 'Smile']
      },
      {
        count: 'single',
        name: 'Gender',
        pluralName: '',
        type: '_enum',
        values: ['Male', 'Female']
      },
      {
        count: 'single',
        name: 'ImageHash',
        pluralName: '',
        type: 'Bytes',
        values: []
      }
    ];

    const scaleStr = convertScaleAttrFromJson(exampleJson);
    const scaleJson = convertScaleAttrToJson(scaleStr);

    const encoded = encodeStruct({ attr: scaleStr, data: '{"Gender":"Female", "Traits":["Smile"], "ImageHash": "123123"}' });
    const decoded = decodeStruct({ attr: scaleStr, data: encoded });

    console.log('encoded', encoded, 'decoded', decoded);

    console.log('scaleStr', scaleStr, 'scaleJson', scaleJson);
  });

  return (
    <div className='manage-collection'>
      <Header as='h3'>Manage collection ConstOnChainSchema</Header>
      <Grid className='manage-collection--container'>
        <Grid.Row>
          <Grid.Column width={8}>
            <Form className='manage-collection--form'>
              <Grid className='attribute-form'>
                <Grid.Row>
                  <Grid.Column width={7}>
                    <Form.Field>
                      <Input
                        className='isSmall'
                        isError={!!currentAttributeNameError}
                        label='Please enter the Attribute name'
                        onChange={setCurrentAttributeName}
                        placeholder='Attribute name'
                        value={currentAttributeName}
                      />
                      { currentAttributeNameError && (
                        <div className='field-error'>
                          {currentAttributeNameError}
                        </div>
                      )}
                    </Form.Field>
                  </Grid.Column>
                  <Grid.Column width={7}>
                    <Form.Field>
                      <Dropdown
                        onChange={setCurrentAttributeType}
                        options={TypeOptions}
                        placeholder='Select Attribute Type'
                        value={currentAttributeType}
                      />
                    </Form.Field>
                  </Grid.Column>
                  <Grid.Column width={2}>
                    <Button
                      content='+'
                      disabled={!currentAttributeType || !currentAttributeName || (currentAttributeType === '_enum' && currentAttributeValues.length < 2)}
                      onClick={onAddField}
                    />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              {currentAttributeType === '_enum' && (
                <Grid className='attribute-additional-form'>
                  <Grid.Row>
                    <Grid.Column width={8}>
                      <Form.Field>
                        <Dropdown
                          onChange={setCurrentAttributeCountType}
                          options={CountOptions}
                          placeholder='Select Attribute Count Type'
                          value={currentAttributeCountType}
                        />
                      </Form.Field>
                    </Grid.Column>
                    <Grid.Column width={8}>
                      <Form.Field>
                        <Input
                          className='isSmall'
                          isDisabled={currentAttributeCountType === 'single'}
                          isError={!!currentAttributePluralNameError}
                          label='Please enter the Attribute plural name'
                          onChange={setCurrentAttributePluralName}
                          placeholder='Attribute plural name'
                          value={currentAttributePluralName}
                        />
                      </Form.Field>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              )}
              {currentAttributeType === '_enum' && (
                <>
                  Enums:
                  <Grid className='attribute-enum-form'>
                    <Grid.Row>
                      <Grid.Column width={14}>
                        <Form.Field>
                          <Input
                            className='isSmall'
                            defaultValue={currentAttributeName}
                            isError={!!currentAttributeEnumValueError}
                            label='Please enter an enum attribute'
                            onChange={setCurrentAttributeEnumValue}
                            placeholder='Enum attribute'
                            value={currentAttributeEnumValue}
                          />
                          { currentAttributeEnumValueError && (
                            <div className='field-error'>
                              {currentAttributeEnumValueError}
                            </div>
                          )}
                        </Form.Field>
                      </Grid.Column>
                      <Grid.Column width={2}>
                        <Form.Field>
                          <Button
                            content='+'
                            onClick={onAddEnumField}
                          />
                        </Form.Field>
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                  Enum values: {currentAttributeValues.join(', ')}
                </>
              )}
              <Form.Field>
                <Button
                  content='Save'
                  disabled={!attributes.length}
                  onClick={onSaveAll}
                />
              </Form.Field>
            </Form>
          </Grid.Column>
          <Grid.Column width={8}>
            <div>
              <pre>{JSON.stringify(attributes, null, 2) }</pre>
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
}

export default React.memo(ManageCollectionAttributes);
