// @flow
import * as React from 'react';
import {useEffect} from 'react';
import ListTools from 'src/utils/helpers/ListTools';
import NavWrapper from 'src/utils/components/nav_wrapper/';
import Table from './main_table/';

export class Service {
    static areaToOptions(areas: Array<Object>): Array<Object> {
        return areas.map(item => ({value: item.id, label: `${item.uid} - ${item.title}`}));
    }

    static addNameToList(list: Array<Object>, nameSource: Array<Object>, key: string): Array<Object> {
        const map = nameSource.reduce((obj, item) => {
            obj[item.value] = item.label;
            return obj;
        }, {});
        return list.map(item => {
            item[`${key}_name`] = map[item[`${key}`]];
            return item;
        });
    }

    static addNameToItem(item: Object, nameSource: Array<Object>, key: string): Object {
        const map = nameSource.reduce((obj, item) => {
            obj[item.value] = item.label;
            return obj;
        }, {});
        item[`${key}_name`] = map[item[`${key}`]];
        return item;
    }

    static prepareList(list: Array<Object>, listArea: Array<Object>): Array<Object> {
        list = ListTools.prepare(list);
        list = Service.addNameToList(list, listArea, 'area');
        return list;
    }

    static prepareItem(item: Object, listArea: Array<Object>): Object {
        item = {...item, checked: false};
        item = Service.addNameToItem(item, listArea, 'area');
        return item;
    }
}

export default () => {
    useEffect(() => {
        document.title = 'Area manager';
    }, []);

    return (
        <NavWrapper>
            <Table />
        </NavWrapper>
    );
};
