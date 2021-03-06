// @flow
import React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import Fingerprint2 from 'fingerprintjs2';
// $FlowFixMe: do not complain about importing node_modules
import {notification} from 'antd';
// $FlowFixMe: do not complain about importing node_modules
import kebabCase from 'lodash/kebabCase';
// $FlowFixMe: do not complain about importing node_modules
import isPlainObject from 'lodash/isPlainObject';
// $FlowFixMe: do not complain about importing node_modules
import flattenDeep from 'lodash/flattenDeep';
// $FlowFixMe: do not complain about importing node_modules
import camelCase from 'lodash/camelCase';
// $FlowFixMe: do not complain about importing node_modules
const moment = require('moment');
import {APP} from 'src/constants';

import {
    LOCAL_STORAGE_PREFIX,
    URL_PREFIX,
    API_PREFIX,
    PROTOCOL,
    DOMAIN,
    FIELD_TYPE,
    URL_PREFIX_STRIP,
    BASE_URL
} from 'src/constants';
let fingerprint = null;

type ApiUrl = {
    controller: string,
    endpoints: Object
};

type RawApiUrls = Array<ApiUrl>;

export type FormState = {
    data: Object,
    errors: Object
};

type Payload = {
    data: string | FormData,
    'Content-Type': string
};

export type GetListResponseData = {
    links: {
        next: ?string,
        previous: ?string
    },
    items: Array<Object>,
    extra?: Object
};
export type GetListResponse = Promise<?GetListResponseData>;

type GetItemResponse = Promise<?Object>;

type DataErrorPair = {
    data: Object,
    error: Object
};

export type TupleResp = [boolean, Object];
export type ObjResp = {
    status: number,
    ok: boolean,
    data: Object
};

export type SelectOptions = Array<{value: string | number, label: string}>;

const audioContext = new AudioContext();

export default class Tools {
    static emptyFunction() {}

    static beep(vol: number, freq: number, duration: number) {
        const v = audioContext.createOscillator();
        const u = audioContext.createGain();
        v.connect(u);
        v.frequency.value = freq;
        v.type = 'square';
        u.connect(audioContext.destination);
        u.gain.value = vol * 0.01;
        v.start(audioContext.currentTime);
        v.stop(audioContext.currentTime + duration * 0.001);
    }

    static successBeep() {
        Tools.beep(100, 520, 200);
    }

    static failBeep() {
        Tools.beep(999, 220, 300);
    }

    static isAdmin(): boolean {
        return APP === 'admin';
    }

    static checkDevMode(): boolean {
        const domainArr = window.location.host.split('.');
        const suffix = domainArr[domainArr.length - 1];
        return ['dev'].indexOf(suffix) === -1 ? false : true;
    }

    static cap(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static formDataToObj(formData: FormData, checkboxes: Array<string> = []): Object {
        let data = {};
        for (let pair of formData.entries()) {
            if (typeof data[pair[0]] == 'undefined') {
                // console.log(pair[1] instanceof Blob);
                data[pair[0]] = pair[1] === 'null' ? null : pair[1];
            }
            if (pair[1] instanceof Blob) {
                // Image here
                if (!pair[1].name || !pair[1].size) {
                    data[pair[0]] = undefined;
                }
            }
        }
        for (let checkbox of checkboxes) {
            if (!data[checkbox]) {
                data[checkbox] = data[checkbox] === '' ? true : false;
            } else {
                data[checkbox] = true;
            }
        }
        if (data.id) {
            data.id = parseInt(data.id);
        }
        return data;
    }

    static navigateTo(history: Object) {
        return (url: string = '/', params: Array<mixed> = []) => history.push([url, ...params].join('/'));
    }

    static parseJson(input: any): string {
        try {
            return JSON.parse(input);
        } catch (error) {
            return String(input);
        }
    }

    static isEmpty(obj: Object): boolean {
        if (!obj) return true;
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }

    static setGlobalState(key: string, value: any): void {
        if (typeof window.globalState == 'undefined') {
            window.globalState = {};
        }
        window.globalState[key] = value;
    }

    static getGlobalState(key: string): any {
        if (typeof window.globalState == 'undefined') {
            window.globalState = {};
        }
        return window.globalState[key];
    }

    static setStorage(key: string, value: any): void {
        try {
            localStorage.setItem(LOCAL_STORAGE_PREFIX + '_' + key, JSON.stringify(value));
        } catch (error) {
            console.log(error);
        }
    }

    static setStorageObj(input: Object): void {
        for (let key in input) {
            const value = input[key];
            this.setStorage(key, value);
        }
    }

    static getStorageObj(key: string): Object {
        try {
            let value = this.parseJson(localStorage.getItem(LOCAL_STORAGE_PREFIX + '_' + key));
            if (value && typeof value === 'object') {
                return value;
            }
            return {};
        } catch (error) {
            return {};
        }
    }

    static getStorageStr(key: string): string {
        try {
            let value = this.parseJson(localStorage.getItem(LOCAL_STORAGE_PREFIX + '_' + key));
            if (!value || typeof value === 'object') {
                return '';
            }
            return String(value);
        } catch (error) {
            return '';
        }
    }

    static removeStorage(key: string): void {
        localStorage.removeItem(LOCAL_STORAGE_PREFIX + '_' + key);
    }

    static getToken(): string {
        const token = this.getStorageObj('auth').token;
        return token ? token : '';
    }

    static getVisibleMenus(): Array<string> {
        const visibleMenus = this.getStorageObj('auth').visible_menus;
        return visibleMenus ? visibleMenus : [];
    }

    static getLang(): string {
        return this.getStorageStr('lang');
    }

    static getApiBaseUrl(): String {
        return PROTOCOL + DOMAIN + API_PREFIX;
    }

    static getApiUrls(rawApiUrls: RawApiUrls): Object {
        let result = {};
        const API_BASE_URL = this.getApiBaseUrl();
        for (let index = 0; index < rawApiUrls.length; index++) {
            const apiUrl = rawApiUrls[index];
            for (let key in apiUrl.endpoints) {
                const url = kebabCase(apiUrl.endpoints[key]);
                result[parseInt(index) === 0 ? key : camelCase(apiUrl.controller) + this.cap(key)] =
                    API_BASE_URL + kebabCase(apiUrl.controller) + '/' + url + (url ? '/' : '');
            }
        }
        return result;
    }

    static async getFingerPrint(): Promise<string> {
        const components = await Fingerprint2.getPromise();
        const values = components.map(component => component.values);
        return Fingerprint2.x64hash128(values.join(''), 31);
    }

    static fileInObject(data: Object) {
        return !!Object.values(data).filter(item => item instanceof Blob).length;
    }

    static getJsonPayload(data: Object): Payload {
        return {
            data: JSON.stringify(data),
            'Content-Type': 'application/json'
        };
    }

    static getFormDataPayload(data: Object): Payload {
        let formData = new FormData();
        for (let key in data) {
            const value = data[key];
            formData.set(key, value);
        }
        return {
            data: formData,
            'Content-Type': ''
        };
    }

    static payloadFromObject(data: Object = {}): Payload {
        try {
            return Tools.fileInObject(data) ? Tools.getFormDataPayload(data) : Tools.getJsonPayload(data);
        } catch (error) {
            return Tools.getJsonPayload({});
        }
    }

    static urlDataEncode(obj: Object): string {
        let str = [];
        for (let p in obj) {
            var value = obj[p];
            if (typeof value == 'undefined' || value === null) {
                value = '';
            }
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(value));
        }
        return str.join('&');
    }

    static urlDataDecode(str: string): Object {
        // str = abc=def&ghi=aaa&ubuntu=debian
        let result = {};
        let arr = str.split('&');
        if (!str) {
            return result;
        }
        arr.forEach((value, key) => {
            let arrValue = value.split('=');
            if (arrValue.length === 2) {
                result[arrValue[0]] = arrValue[1];
            }
        });
        return result;
    }

    static errorMessageProcessing(input: string | Object): string {
        if (typeof input === 'string') {
            // If message is STRING
            return String(input);
        } else if (Array.isArray(input)) {
            // If message is ARRAY
            return String(input.join('<br/>'));
        } else if (typeof input === 'object') {
            return flattenDeep(
                Object.values(input).filter(item => Array.isArray(item) || typeof item === 'string')
            ).join('<br/>');
        } else {
            return '';
        }
    }

    static logout(history: Object) {
        return () => {
            this.removeStorage('auth');
            this.navigateTo(history)('/login');
        };
    }

    static popMessage(description: string | Object, type: string = 'success'): void {
        const formatedDescription = this.errorMessageProcessing(description);
        if (!formatedDescription) return;
        const options = {
            description: formatedDescription
        };
        if (type === 'success') {
            notification.success({...options, message: 'Thành công'});
        } else {
            notification.error({...options, message: 'Lỗi'});
        }
    }

    static popMessageOrRedirect(resp: Object): Promise<Error> {
        if ([401].includes(resp.status)) {
            Tools.removeStorage('auth');
            window.location = BASE_URL + 'login';
        }
        Tools.popMessage(resp.data, 'error');
        return Promise.reject(resp);
    }

    static toggleGlobalLoading(spinning: boolean = true): void {
        Tools.event.dispatch('TOGGLE_SPINNER', spinning);
    }

    static defaultRequestConfig(method: string): Object {
        const token = Tools.getToken();
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: token ? `JWT ${token}` : undefined
            },
            mode: 'cors',
            credentials: 'omit'
        };

        return config;
    }

    static preparePayload(data: Object, method: string): Object {
        const config = Tools.defaultRequestConfig(method);
        const payload = Tools.payloadFromObject(data);

        config.body = payload.data;
        if (payload['Content-Type']) {
            config.headers['Content-Type'] = payload['Content-Type'];
        } else {
            delete config.headers['Content-Type'];
        }

        return {payload, config};
    }

    static isUsePayload(method: string): boolean {
        return ['POST', 'PUT'].includes(method);
    }

    static async getJsonResponse(response: Object): Object {
        let data = {};
        try {
            if (response.status !== 204) {
                data = await response.json();
            }
            if (response.status === 502) {
                data = {detail: 'Internal server error'};
            }
        } catch (error) {
            data = {detail: 'Internal server error'};
        }
        return data;
    }

    static isSuscessResponse(status: number): boolean {
        return ![200, 201, 204].includes(status) ? false : true;
    }

    static defaultErrorResponse(err: Object): ObjResp {
        return {
            status: 400,
            ok: false,
            data: err
        };
    }

    static response(data: Object, status: number): ObjResp {
        return {
            status,
            ok: Tools.isSuscessResponse(status),
            data
        };
    }

    static async apiCall(
        url: string,
        data: Object = {},
        method: string = 'GET',
        usingLoading: boolean = true
    ): Promise<ObjResp> {
        usingLoading && this.toggleGlobalLoading();

        let result;
        try {
            const usePayload = Tools.isUsePayload(method);
            const preparePayload = Tools.preparePayload(data, method);
            const config = usePayload ? preparePayload.config : Tools.defaultRequestConfig(method);

            if (!usePayload) {
                const urlData = this.urlDataEncode(data);
                url += urlData ? '?' + urlData : '';
            }
            const response = await fetch(url, config);
            const status = response.status;
            const json = await Tools.getJsonResponse(response);

            result = Tools.response(json, status);
        } catch (err) {
            result = Tools.defaultErrorResponse(err);
        }

        usingLoading && this.toggleGlobalLoading(false);

        return result;
    }

    static apiClient(
        url: string,
        data: Object = {},
        method: string = 'GET',
        usePayload: boolean = true
    ): Promise<Object> {
        return Tools.apiCall(url, data, method, usePayload)
            .then(resp => (resp.ok ? resp.data || {} : Promise.reject(resp)))
            .catch(Tools.popMessageOrRedirect);
    }

    static fetch(url: string): Promise<Object> {
        return Tools.apiClient(url, {}, 'GET', false);
    }

    static getCheckedId(listItem: Array<Object>): string {
        const result = listItem.filter(item => !!item.checked).map(item => item.id);
        return result.join(',');
    }

    static matchPrefix(prefix: string, url: string): boolean {
        if (!prefix || !url) {
            return false;
        }
        if (url.indexOf(prefix) === 0) {
            return true;
        }
        return false;
    }

    static uuid4(): string {
        let cryptoObj = window.crypto || window.msCrypto;
        // $FlowFixMe: allow bitwise operations
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ (cryptoObj.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
        );
    }

    static numberFormat(number: number = 0) {
        var l10nDE = new Intl.NumberFormat('de-DE');
        return l10nDE.format(number);
    }

    static dateTimeFormat(dateStr: string): string {
        const date = moment(dateStr);
        return date.format('DD/MM/YY - HH:mm');
    }

    static dateFormat(date: any, format: string = 'dd/mm/yyyy'): string {
        try {
            if (typeof date === 'string') {
                try {
                    date = new Date(date);
                } catch (error) {
                    date = new Date();
                }
            }

            let dd = date.getDate();
            let mm = date.getMonth() + 1;
            const yyyy = date.getFullYear().toString();
            const yy = yyyy.slice(-2);

            if (dd < 10) {
                dd = [0, dd].join('');
            }
            if (mm < 10) {
                mm = [0, mm].join('');
            }
            return format
                .replace('dd', `${dd}`)
                .replace('mm', `${mm}`)
                .replace('yyyy', `${yyyy}`)
                .replace('yy', `${yy}`);
        } catch (error) {
            return String(date);
        }
    }

    static getText(html: string): string {
        let tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || (tmp.innerText || '');
    }

    static addAlt(html: string, alt: string): string {
        if (!html) return '';
        html = html.replace(/<img /g, `<img alt="${alt}" title="${alt}" `);
        return html;
    }

    static commonErrorResponse(error: Object): Object {
        const detail = error.message ? error.message : 'Undefined error';
        return {
            ok: false,
            data: {
                detail
            }
        };
    }

    static parseDataError(response: Object): DataErrorPair {
        let data = {};
        let error = {};

        if (response.ok) {
            data = response.data;
        } else {
            error = response.data;
        }

        return {data, error};
    }

    static async getItem(url: string, id: number): GetItemResponse {
        const result = await this.apiCall(url + id.toString());
        if (result.ok) {
            return result.data;
        }
        return null;
    }

    static async getList(url: string, params: Object = {}): GetListResponse {
        const result = await this.apiCall(url, params);
        if (result.ok) {
            result.data.items = result.data.items.map(item => {
                item.checked = false;
                return item;
            });
            const {links, items, extra} = result.data;
            return {links, items, extra};
        }
        throw result.data;
    }

    static async handleAdd(url: string, params: Object): Promise<Object> {
        try {
            return await this.apiCall(url, params, 'POST');
        } catch (error) {
            return this.commonErrorResponse(error);
        }
    }

    static async handleEdit(url: string, params: Object): Promise<Object> {
        try {
            const id = String(params.id);
            return await this.apiCall(url, params, 'PUT');
        } catch (error) {
            return this.commonErrorResponse(error);
        }
    }

    static async handleSubmit(url: string, params: Object): Promise<DataErrorPair> {
        const isEdit = params.id ? true : false;
        const args = [url, params];
        const result = await (isEdit ? this.handleEdit(...args) : this.handleAdd(...args));
        const {data, error} = this.parseDataError(result);
        return {data, error};
    }

    static updateListOnSuccessAdding(list: Array<Object>, data: Object): Array<Object> {
        const newItem = {...data, checked: false};
        list.unshift(newItem);
        return list;
    }

    static updateListOnSuccessEditing(list: Array<Object>, data: Object): Array<Object> {
        const {id} = data;
        const index = list.findIndex(item => item.id === id);
        const oldItem = list[index];
        const newItem = {...data, checked: oldItem.checked};
        list[index] = newItem;
        return list;
    }

    static async handleRemove(url: string, ids: string): Promise<?Array<number>> {
        const listId = ids.split(',');
        if (!ids || !listId.length) return null;
        let message = '';
        if (listId.length === 1) {
            message = 'Do you want to remove this item?';
        } else {
            message = 'Do you want to remove selected items?';
        }
        const decide = window.confirm(message);
        if (!decide) return null;
        const result = await Tools.apiCall(url + (listId.length === 1 ? ids : '?ids=' + ids), {}, 'DELETE');
        return result.ok ? listId.map(item => parseInt(item)) : null;
    }

    static checkOrUncheckAll(list: Array<Object>): Array<Object> {
        let checkAll = false;
        const checkedItem = list.filter(item => item.checked);
        if (checkedItem.length) {
            checkAll = checkedItem.length === list.length ? false : true;
        } else {
            checkAll = true;
        }
        return list.map(value => ({...value, checked: checkAll}));
    }

    static toggleModal(state: Object, modalName: string, formValues: Object = {}): ?Object {
        if (!state || this.isEmpty(state)) return null;
        const formErrors = {};
        const modalState = state[modalName];
        if (!modalName || modalState === undefined) return null;

        return {
            [modalName]: !modalState,
            formValues,
            formErrors
        };
    }

    static getFileName(filePath: string): string {
        return filePath.split(/(\\|\/)/g).pop();
    }

    static isBase64(content: string): boolean {
        return content.indexOf('data:') === 0 && content.includes(';base64,');
    }

    static ensureImage(content: string): string {
        let result = '';
        if (this.isBase64(content)) {
            if (content.indexOf('data:image/') === 0) result = content;
        } else {
            const extension = content
                .split('.')
                .pop()
                .toLowerCase();
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (imageExtensions.includes(extension)) result = content;
        }
        return result;
    }

    static getActionName(id?: number): string {
        return id ? 'Update' : 'Add new';
    }

    static getFieldId(formName: string) {
        return (fieldName: string): string => {
            if (!formName || !fieldName) return '';
            return `${formName}-${fieldName}`;
        };
    }

    static getListItemToResponseData(items?: Array<Object>): GetListResponseData {
        return {
            links: {
                next: null,
                previous: null
            },
            items: items || []
        };
    }

    static meanfulErrorItem(input: any): boolean {
        return input && (Array.isArray(input) || ['string', 'number'].includes(typeof input));
    }

    static standarizeErrorItem(input: any): Array<any> {
        if (Array.isArray(input)) return input;
        return [input];
    }

    static parseErrorResponse(errors: Object, result: Object = {}): Object {
        if (Tools.isEmpty(errors)) return result;
        for (let key in errors) {
            const value = errors[key];
            if (Tools.meanfulErrorItem(value)) result[key] = Tools.standarizeErrorItem(value);
            if (isPlainObject(value)) result = Tools.parseErrorResponse(value, result);
        }
        return result;
    }

    static toggleState(open: ?boolean = null, key: string = 'modal') {
        return (state: Object) => ({[key]: open === null ? !state[key] : !!open});
    }

    static errorFormat(input: any): Array<any> {
        if (!input) return [];
        if (typeof input === 'string') return [input];
        if (Array.isArray(input)) return input.filter(item => item);
        return [];
    }

    static setFormErrors(errors: Object): Object {
        return Object.entries(errors)
            .map(([key, value]) => {
                return [key, Tools.errorFormat(value)];
            })
            .filter(([_, value]) => value.length)
            .reduce((result, [key, value]) => {
                result[key] = value;
                return result;
            }, {});
    }

    static mapApp(app: string): string {
        return app === 'admin' ? 'staff' : 'customer';
    }

    static prepareUserData(data: Object): Object {
        if (!data.user_data) return {...data};
        const user_data = {...data.user_data};
        delete data.user_data;
        delete user_data.id;
        return {...data, ...user_data};
    }

    static isBlank(input: any): boolean {
        return typeof input !== 'number' && !input;
    }

    static removeEmptyKey(_obj: Object = {}): Object {
        const obj = {..._obj};
        for (let key in obj) {
            const value = obj[key];
            Tools.isBlank(value) && delete obj[key];
        }
        return obj;
    }

    static visibilityChangeParams(): Object {
        let visibilityChange;
        let hidden;
        if (typeof window.document.hidden !== 'undefined') {
            visibilityChange = 'visibilitychange';
            hidden = 'hidden';
        } else if (typeof window.document.mozHidden !== 'undefined') {
            visibilityChange = 'mozvisibilitychange';
            hidden = 'mozHidden';
        } else if (typeof window.document.msHidden !== 'undefined') {
            visibilityChange = 'msvisibilitychange';
            hidden = 'msHidden';
        } else if (typeof window.document.webkitHidden !== 'undefined') {
            visibilityChange = 'webkitvisibilitychange';
            hidden = 'webkitHidden';
        }
        return {visibilityChange, hidden};
    }

    static deliveryFeeUnitLabel(type: number): string {
        return type === 1 ? 'Kg' : 'Khối';
    }

    static nullToDefault(input: Object, defaultValues: Object): Object {
        const result = {...input};
        for (let key in result) {
            if (defaultValues[key] === undefined) {
                delete result[key];
            } else {
                if (result[key] === null) result[key] = defaultValues[key];
            }
        }
        return result;
    }

    static event = {
        listen: (eventName: string, callback: Function) => {
            window.document.addEventListener(eventName, callback, false);
        },

        remove: (eventName: string, callback: Function) => {
            window.document.removeEventListener(eventName, callback, false);
        },

        dispatch: (eventName: string, detail: any) => {
            const event = new CustomEvent(eventName, {detail});
            window.document.dispatchEvent(event);
        }
    };

    static rangeToCondition(key: string, range: Array<any>, isEqual: boolean = true): Object {
        const defaultResult = {[key]: ''};
        if (!key) return {};
        if (!range || !Array.isArray(range)) return defaultResult;

        if (!range.length) return defaultResult;
        if (range.length == 1) return {[key]: range[0]};

        let startValue = range[0];
        if (startValue) startValue = startValue.replace('T', ' ').split('.')[0];

        let endValue = range[1];
        if (endValue) endValue = endValue.replace('T', ' ').split('.')[0];

        if (startValue === null && endValue === null) return defaultResult;
        if (startValue === undefined && endValue === undefined) return defaultResult;

        const startKey = `${key}__gt${isEqual ? 'e' : ''}`;
        const endKey = `${key}__lt${isEqual ? 'e' : ''}`;

        return {
            [startKey]: startValue,
            [endKey]: endValue
        };
    }

    static mergeCondition(_condition: Object, subCondition: Object): Object {
        let condition = {..._condition};
        if (Tools.isEmpty(subCondition)) return condition;
        for (let key in subCondition) {
            const value = subCondition[key];
            if (typeof value !== 'number' && !value) {
                delete condition[key];
            } else {
                condition = {...condition, [key]: value};
            }
        }
        return condition;
    }

    static txCodeFormat(code: string): string {
        return code.split('-').pop();
    }

    static getFormTitle(id: number, formName: string) {
        return `${!id ? 'Thêm' : 'Sửa'} ${formName}`;
    }
}
