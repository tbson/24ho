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

describe('Service.group', () => {
    it('Normal case', () => {
        const items = [
            {
                id: 1,
                site: 'TMALL',
                shop_link: 'link1',
                shop_nick: 'nick1',
                quantity: 4,
                cny_price: 5.5,
                vnd_price: 20000
            },
            {
                id: 2,
                site: 'TAOBAO',
                shop_link: 'link2',
                shop_nick: 'nick2',
                quantity: 4,
                cny_price: 5.5,
                vnd_price: 20000
            },
            {
                id: 3,
                site: 'TMALL',
                shop_link: 'link1',
                shop_nick: 'nick1',
                quantity: 4,
                cny_price: 5.5,
                vnd_price: 20000
            }
        ];
        const orders = {
            nick1: {note: 'hello', address: 1, address_title: 'address 1'},
            nick2: {note: 'world', address: 2, address_title: 'address 2'}
        };
        const eput = [
            {
                shop: {
                    nick: 'nick1',
                    link: 'link1',
                    site: 'TMALL',
                    note: 'hello',
                    address: 1,
                    address_title: 'address 1',
                    quantity: 8,
                    cny_total: 11,
                    vnd_total: 40000
                },
                items: [
                    {
                        id: 1,
                        site: 'TMALL',
                        shop_link: 'link1',
                        shop_nick: 'nick1',
                        quantity: 4,
                        cny_price: 5.5,
                        vnd_price: 20000
                    },
                    {
                        id: 3,
                        site: 'TMALL',
                        shop_link: 'link1',
                        shop_nick: 'nick1',
                        quantity: 4,
                        cny_price: 5.5,
                        vnd_price: 20000
                    }
                ]
            },
            {
                shop: {
                    nick: 'nick2',
                    link: 'link2',
                    site: 'TAOBAO',
                    note: 'world',
                    address: 2,
                    address_title: 'address 2',
                    quantity: 4,
                    cny_total: 5.5,
                    vnd_total: 20000
                },
                items: [
                    {
                        id: 2,
                        site: 'TAOBAO',
                        shop_link: 'link2',
                        shop_nick: 'nick2',
                        quantity: 4,
                        cny_price: 5.5,
                        vnd_price: 20000
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
