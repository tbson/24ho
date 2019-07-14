import React from 'react';
import {Service} from '../';

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('Service.areaToOptions', () => {
    test('Normal case', () => {
        const input = [
            {
                id: 1,
                uid: 'uid1',
                title: 'title1'
            },
            {
                id: 2,
                uid: 'uid2',
                title: 'title2'
            }
        ];
        const eput = [
            {
                value: 1,
                label: 'uid1 - title1'
            },
            {
                value: 2,
                label: 'uid2 - title2'
            }
        ];
        const output = Service.areaToOptions(input);
        expect(eput).toEqual(output);
    });
});

describe('Service.addNameToList', () => {
    test('area case', () => {
        const list = [
            {
                area: 1
            },
            {
                area: 2
            },
            {
                area: 3
            }
        ];
        const nameSource = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const eput = [
            {
                area: 1,
                area_name: 'item 1'
            },
            {
                area: 2,
                area_name: 'item 2'
            },
            {
                area: 3
            }
        ];
        const output = Service.addNameToList(list, nameSource, 'area');
        expect(eput).toEqual(output);
    });
});

describe('Service.addNameToItem', () => {
    test('area case', () => {
        const item = {
            area: 1
        };
        const nameSource = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const eput = {
            area: 1,
            area_name: 'item 1'
        };
        const output = Service.addNameToItem(item, nameSource, 'area');
        expect(eput).toEqual(output);
    });
});

describe('Service.prepareList', () => {
    test('Normal case', () => {
        const list = [
            {
                area: 1
            },
            {
                area: 2
            },
            {
                area: 3
            }
        ];
        const listArea = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const eput = [
            {
                checked: false,
                area: 1,
                area_name: 'item 1'
            },
            {
                checked: false,
                area: 2,
                area_name: 'item 2'
            },
            {
                checked: false,
                area: 3,
                area_name: undefined
            }
        ];
        const output = Service.prepareList(list, listArea);
        expect(eput).toEqual(output);
    });
});

describe('Service.prepareItem', () => {
    test('Normal case', () => {
        const item = {
            area: 1
        };
        const listArea = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];

        const eput = {
            checked: false,
            area: 1,
            area_name: 'item 1'
        };
        const output = Service.prepareItem(item, listArea);
        expect(eput).toEqual(output);
    });
});
