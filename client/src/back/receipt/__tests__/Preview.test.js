import React from 'react';
import Tools from 'src/utils/helpers/Tools';
import {Service} from '../Preview';

describe('Service.objectToList', () => {
    test('normal case', () => {
        const input = {
            123: {key1: 'value 1', uid: 'abc'},
            456: {key1: 'value 2', uid: 'def'}
        };
        const eput = [{key1: 'value 1', uid: 'abc'}, {key1: 'value 2', uid: 'def'}];
        const output = Service.objectToList(input);
        expect(output).toEqual(eput);
    });
});

describe('Service.bolsSum', () => {
    test('normal case', () => {
        const input = {
            123: {vnd_delivery_fee: 1, vnd_insurance_fee: 2, vnd_sub_fee: 3, uid: 'abc'},
            456: {vnd_delivery_fee: 4, vnd_insurance_fee: 5, vnd_sub_fee: 6, uid: 'def'}
        };
        const eput = {vnd_delivery_fee: 5, vnd_insurance_fee: 7, vnd_sub_fee: 9};
        const output = Service.bolsSum(input);
        expect(output).toEqual(eput);
    });
});

describe('Service.ordersSum', () => {
    test('normal case', () => {
        const input = {
            123: {remain: 1, uid: 'abc'},
            456: {remain: 4, uid: 'def'}
        };
        const eput = {remain: 5};
        const output = Service.ordersSum(input);
        expect(output).toEqual(eput);
    });
});
