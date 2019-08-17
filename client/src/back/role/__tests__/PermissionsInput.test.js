import React from 'react';
import Tools from 'src/utils/helpers/Tools';
import {Service} from '../PermissionsInput/';

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('Service.updateValue', () => {
    it('Normal case', () => {
        const pems = [1, 2, 3];
        const updateObj = {
            '2': false,
            '3': false,
            '4': true,
            '5': true
        };
        const eput = [1, 4, 5];
        const output = Service.updateValue(pems, updateObj);
        expect(output).toEqual(eput);
    });

    it('Nothing', () => {
        const pems = [1, 2, 3];
        const updateObj = {
        };
        const eput = [1, 2, 3];
        const output = Service.updateValue(pems, updateObj);
        expect(output).toEqual(eput);
    });

    it('Only add', () => {
        const pems = [1, 2, 3];
        const updateObj = {
            '3': true,
            '4': true,
            '5': true
        };
        const eput = [1, 2, 3, 4, 5];
        const output = Service.updateValue(pems, updateObj);
        expect(output).toEqual(eput);
    });

    it('Only remove', () => {
        const pems = [1, 2, 3];
        const updateObj = {
            '3': false,
            '4': false,
            '5': false
        };
        const eput = [1, 2];
        const output = Service.updateValue(pems, updateObj);
        expect(output).toEqual(eput);
    });
});


describe('Service.getAllPermissions', () => {
    it('Normal case', () => {
        const input = {
            group1: [
                {id: 1, title: 'title 1'},
                {id: 2, title: 'title 2'},
            ],
            group2: [
                {id: 3, title: 'title 3'},
                {id: 4, title: 'title 4'},
            ]
        }
        const eput = [1, 2, 3, 4];
        const output = Service.getAllPermissions(input);
        expect(output).toEqual(eput);
    });

    it('Filter case', () => {
        const input = {
            group1: [
                {id: 1, title: 'title 1'},
                {id: 2, title: 'title 2'},
            ],
            group2: [
                {id: 3, title: 'title 3'},
                {id: 4, title: 'title 4'},
            ]
        }
        const permission_group = 'group1';
        const eput = [1, 2];
        const output = Service.getAllPermissions(input, permission_group);
        expect(output).toEqual(eput);
    });
});
