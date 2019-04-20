// @flow
import Tools from 'src/utils/helpers/Tools';

type List = Array<Object>;

export default class ListTools {
    static prepare(list: List): List {
        return list.map(item => ({...item, checked: false}));
    }

    static actions(list: List): Object {
        return (data: Object) => {
            const index = list.findIndex(item => item.id === data.id);
            return {
                remove: (): List => [...list.filter(item => item.id !== data.id)],
                bulkRemove: (): List => [...list.filter(item => !data.ids.includes(item.id))],
                add: (): List => [data, ...list],
                update: (): List => {
                    list[index] = {...list[index], ...data};
                    return [...list];
                }
            };
        };
    }

    static subList(condition: Object = {}): Function {
        if (Tools.isEmpty(condition)) return () => true;
        return (item: Object): boolean =>
            !Object.entries(condition)
                .reduce((matched, [key, value]) => {
                    item[key] === value ? matched.push(true) : matched.push(false);
                    return matched;
                }, [])
                .includes(false);
    }

    static checkAll(list: List, condition: Object = {}): List {
        const {subList} = ListTools;
        const filteredList = list.filter(subList(condition));

        let checkAll = false;
        const checkedItem = filteredList.filter(item => item.checked);
        if (checkedItem.length) {
            checkAll = checkedItem.length === filteredList.length ? false : true;
        } else {
            checkAll = true;
        }
        return list.map(item => {
            const matchedItem = filteredList.find(filteredItem => filteredItem === item);
            return matchedItem ? {...item, checked: checkAll} : item;
        });
    }

    static checkOne(id: number, list: List): Object {
        const index = list.findIndex(item => item.id === id);
        const {checked} = list[index];
        list[index].checked = !checked;
        return [...list];
    }

    static getDeleteMessage(total: number): string {
        if (!total) return '';
        return total === 1 ? 'Do you want to remove this item ?' : 'Do you want to remove these items ?';
    }

    static getChecked(list: List): Array<number> {
        return list.filter(item => item.checked).map(item => item.id);
    }
}
