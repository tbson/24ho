import {Service} from '../Check';

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('mergeCheckedQuantity', () => {
    test('Normal case', () => {
        const listItem = [
            {
                id: 1,
                checked_quantity: 2
            },
            {
                id: 2,
                checked_quantity: 3
            },
            {
                id: 3,
                checked_quantity: 4
            }
        ];
        const checkedItems = {
            '1': 3,
            '3': 5
        };
        const eput = {
            '1': 3,
            '2': 3,
            '3': 5
        };
        const output = Service.mergeCheckedQuantity(listItem, checkedItems);
        expect(output).toEqual(eput);
    });
});

describe('checkedStatus', () => {
    const listItem = [
        {
            id: 1,
            checked_quantity: 3
        },
        {
            id: 2,
            checked_quantity: 3
        },
        {
            id: 3,
            checked_quantity: 5
        }
    ];

    test('OK', () => {
        const checkedItems = {
            '1': 3,
            '2': 3,
            '3': 5
        };
        const eput = Service.CHECKED_STATUS['OK'];
        const output = Service.checkedStatus(listItem, checkedItems);
        expect(output).toEqual(eput);
    });

    test('MISSING', () => {
        const checkedItems = {
            '1': 3,
            '2': 2,
            '3': 5
        };
        const eput = Service.CHECKED_STATUS['MISSING'];
        const output = Service.checkedStatus(listItem, checkedItems);
        expect(output).toEqual(eput);
    });

    test('OVER', () => {
        const checkedItems = {
            '1': 3,
            '2': 4,
            '3': 5
        };
        const eput = Service.CHECKED_STATUS['OVER'];
        const output = Service.checkedStatus(listItem, checkedItems);
        expect(output).toEqual(eput);
    });
});
