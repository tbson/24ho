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
            url: 'pro_link1',
            image: 'image1',
            shop_link: 'shop_link1',
            shop_nick: 'shop_nick1',
            note: '',
            rate: 3300,
            quantity: 5,
            unit_price: 12.3
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
            url: 'pro_link1',
            image: 'image1',
            shop_link: 'shop_link1',
            shop_nick: 'shop_nick1',
            note: '',
            rate: 3300,
            quantity: 5,
            unit_price: 12.3
        };
        const output = Service.formatCartItem(item, index);

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

describe('Service.group', () => {
    it('Normal case', () => {
        const items = [
            {
                id: 1,
                title: 'title1',
                site: 'TMALL',
                shop_link: 'link1',
                shop_nick: 'nick1',
                url: 'link1',
                image: 'image1',
                color: 'color1',
                size: 'size1',
                rate: 3400,
                real_rate: 3300,
                quantity: 4,
                unit_price: 5.5,
                note: 'note1'
            },
            {
                id: 2,
                title: 'title2',
                site: 'TAOBAO',
                shop_link: 'link2',
                shop_nick: 'nick2',
                url: 'link2',
                image: 'image2',
                color: 'color2',
                size: 'size2',
                rate: 3300,
                real_rate: 3400,
                quantity: 5,
                unit_price: 6.5,
                note: 'note2'
            },
            {
                id: 3,
                title: 'title3',
                site: 'TMALL',
                shop_link: 'link1',
                shop_nick: 'nick1',
                url: 'link3',
                image: 'image3',
                color: 'color3',
                size: 'size3',
                rate: 3300,
                real_rate: 3500,
                quantity: 6,
                unit_price: 7.5,
                note: 'note3'
            }
        ];
        const orders = {
            nick1: {note: 'hello', address: 1, address_title: 'address 1'},
            nick2: {note: 'world', address: 2, address_title: 'address 2'}
        };
        const eput = [
            {
                order: {
                    shop_link: 'link1',
                    shop_nick: 'nick1',
                    site: 'TMALL',
                    note: 'hello',
                    address: 1,
                    address_title: 'address 1',
                    rate: 3400,
                    real_rate: 3500,
                    quantity: 10,
                    cny_total: 67,
                    vnd_total: 227800
                },
                items: [
                    {
                        id: 1,
                        url: 'link1',
                        title: 'title1',
                        color: 'color1',
                        size: 'size1',
                        image: 'image1',
                        rate: 3400,
                        quantity: 4,
                        unit_price: 5.5,
                        cny_price: 22,
                        vnd_price: 74800,
                        note: 'note1'
                    },
                    {
                        id: 3,
                        url: 'link3',
                        title: 'title3',
                        color: 'color3',
                        size: 'size3',
                        image: 'image3',
                        rate: 3400,
                        quantity: 6,
                        unit_price: 7.5,
                        cny_price: 45,
                        vnd_price: 153000,
                        note: 'note3'
                    }
                ]
            },
            {
                order: {
                    shop_link: 'link2',
                    shop_nick: 'nick2',
                    site: 'TAOBAO',
                    note: 'world',
                    address: 2,
                    address_title: 'address 2',
                    rate: 3400,
                    real_rate: 3500,
                    quantity: 5,
                    cny_total: 32.5,
                    vnd_total: 110500
                },
                items: [
                    {
                        id: 2,
                        url: 'link2',
                        title: 'title2',
                        color: 'color2',
                        size: 'size2',
                        image: 'image2',
                        rate: 3400,
                        quantity: 5,
                        unit_price: 6.5,
                        cny_price: 32.5,
                        vnd_price: 110500,
                        note: 'note2'
                    }
                ]
            }
        ];
        const output = Service.group(items, orders);
        expect(output).toEqual(eput);
    });
});

describe('Service.addressesToOptions', () => {
    it('Normal case', () => {
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
        const output = Service.addressesToOptions(input);
        expect(output).toEqual(eput);
    });
});

describe('Service.extractShopList', () => {
    it('Normal case', () => {
        const input = [
            {
                id: 1,
                shop_nick: 'nick1'
            },
            {
                id: 2,
                shop_nick: 'nick2'
            },
            {
                id: 3,
                shop_nick: 'nick1'
            }
        ];
        const eput = ['nick1', 'nick2'];
        const output = Service.extractShopList(input);
        expect(output).toEqual(eput);
    });
});

describe('Service.updateSavedOrderList', () => {
    it('Normal case', () => {
        const listItem = [
            {
                id: 1,
                shop_nick: 'nick1'
            },
            {
                id: 2,
                shop_nick: 'nick2'
            },
            {
                id: 3,
                shop_nick: 'nick1'
            }
        ];

        const listOrder = {
            nick1: 'test1',
            nick2: 'test2',
            nick3: 'test3'
        };

        const eput = {
            nick1: 'test1',
            nick2: 'test2'
        };
        const output = Service.updateSavedOrderList(listItem, listOrder);
        expect(output).toEqual(eput);
    });

    it('No item', () => {
        const listItem = [];

        const listOrder = {
            nick1: 'test1',
            nick2: 'test2',
            nick3: 'test3'
        };

        const eput = {};
        const output = Service.updateSavedOrderList(listItem, listOrder);
        expect(output).toEqual(eput);
    });
});
