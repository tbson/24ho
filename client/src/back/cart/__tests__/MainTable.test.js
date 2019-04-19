import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import Tools from 'src/utils/helpers/Tools';
import {Service} from '../main_table/';

Enzyme.configure({adapter: new Adapter()});

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('Service.formatCartItem', () => {
    it('Normal case', () => {
        const index = 1;
        const item = {
            site: 'site1',
            name: '  name1   ',
            colortxt: '   color1   ',
            sizetxt: '   size1    ',
            pro_link: 'pro_link1',
            image: 'image1',
            shop_link: 'shop_link1',
            shop_nick: 'shop_nick1',
            rate: 3300,
            amount: 5,
            price: 12.3
        };
        const eput = {
            id: 2,
            site: 'site1',
            title: 'name1',
            color: 'color1',
            size: 'size1',
            link: 'pro_link1',
            image: 'image1',
            shop_link: 'shop_link1',
            shop_nick: 'shop_nick1',
            note: '',
            rate: 3300,
            quantity: 5,
            cny_unit_price: 12.3,
            vnd_unit_price: 40590,
            cny_price: 61.5,
            vnd_price: 202950
        };
        const output = Service.formatCartItem(item, index);

        expect(output).toEqual(eput);
    });

    it('No color and size', () => {
        const index = 1;
        const item = {
            site: 'site1',
            name: '  name1   ',
            pro_link: 'pro_link1',
            image: 'image1',
            shop_link: 'shop_link1',
            shop_nick: 'shop_nick1',
            rate: 3300,
            amount: 5,
            price: 12.3
        };
        const eput = {
            id: 2,
            site: 'site1',
            title: 'name1',
            color: '',
            size: '',
            link: 'pro_link1',
            image: 'image1',
            shop_link: 'shop_link1',
            shop_nick: 'shop_nick1',
            note: '',
            rate: 3300,
            quantity: 5,
            cny_unit_price: 12.3,
            vnd_unit_price: 40590,
            cny_price: 61.5,
            vnd_price: 202950
        };
        const output = Service.formatCartItem(item, index);

        expect(output).toEqual(eput);
    });
});

describe('Service.recalculate', () => {
    it('Normal case', () => {
        const input = {
            quantity: 2,
            cny_unit_price: 1.6,
            vnd_unit_price: 4500,
            cny_price: 999,
            vnd_price: 999
        };
        const eput = {
            quantity: 2,
            cny_unit_price: 1.6,
            vnd_unit_price: 4500,
            cny_price: 3.2,
            vnd_price: 9000
        };
        const output = Service.recalculate(input);
        expect(output).toEqual(eput);
    });
});

describe('Service.merge', () => {
    it('Normal case', () => {
        const oldItems = [
            {
                id: 4,
                title: 'title1',
                size: 'size1',
                color: 'color1',
                quantity: 2
            },
            {
                id: 2,
                title: 'title2',
                size: 'size2',
                color: 'color2',
                quantity: 2
            },
            {
                id: 3,
                title: 'title3',
                size: 'size3',
                color: 'color3',
                quantity: 2
            },
            {
                id: 1,
                title: 'title4',
                size: 'size4',
                color: 'color4',
                quantity: 2
            }
        ];
        const newItems = [
            {
                id: 1,
                title: 'title2',
                size: 'size2',
                color: 'color2',
                quantity: 2
            },
            {
                id: 2,
                title: 'title3',
                size: 'size3',
                color: 'color3',
                quantity: 2
            },
            {
                id: 3,
                title: 'title5',
                size: 'size5',
                color: 'color5',
                quantity: 2
            },
            {
                id: 4,
                title: 'title6',
                size: 'size6',
                color: 'color6',
                quantity: 2
            }
        ];
        const eput = [
            {
                id: 4,
                title: 'title1',
                size: 'size1',
                color: 'color1',
                quantity: 2
            },
            {
                id: 2,
                title: 'title2',
                size: 'size2',
                color: 'color2',
                quantity: 4
            },
            {
                id: 3,
                title: 'title3',
                size: 'size3',
                color: 'color3',
                quantity: 4
            },
            {
                id: 1,
                title: 'title4',
                size: 'size4',
                color: 'color4',
                quantity: 2
            },
            {
                id: 5,
                title: 'title5',
                size: 'size5',
                color: 'color5',
                quantity: 2
            },
            {
                id: 6,
                title: 'title6',
                size: 'size6',
                color: 'color6',
                quantity: 2
            }
        ];
        const output = Service.merge(oldItems, newItems);
        expect(output).toEqual(eput);
    });
});
