// @flow
import React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import Fingerprint2 from 'fingerprintjs2';
// $FlowFixMe: do not complain about importing node_modules
import kebabCase from 'lodash/kebabCase';
// $FlowFixMe: do not complain about importing node_modules
import {toast} from 'react-toastify';
// $FlowFixMe: do not complain about importing node_modules
import 'react-toastify/dist/ReactToastify.css';
// $FlowFixMe: do not complain about importing node_modules
import camelCase from 'lodash/camelCase';
// $FlowFixMe: do not complain about importing node_modules
import EventEmitter from 'fbemitter';

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

export default class Tools {
    static emitter = new EventEmitter();

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
                data[checkbox] = false;
            } else {
                data[checkbox] = true;
            }
        }
        if (data.id) {
            data.id = parseInt(data.id);
        }
        return data;
    }

    static navigateTo(history: Object, url: string = '/', params: Array<mixed> = []) {
        return history.push([url, ...params].join('/'));
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
            let newValue = value;
            if (key === 'authData') {
                newValue = {...this.getStorageObj(key), ...value};
            }
            newValue = JSON.stringify(newValue);
            localStorage.setItem(LOCAL_STORAGE_PREFIX + '_' + key, newValue);
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
        const token = this.getStorageObj('authData').token;
        return token ? token : '';
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

    static payloadFromObject(data: Object = {}): Object {
        try {
            if (Object.values(data).filter(item => item instanceof Blob).length) {
                let formData = new FormData();
                for (let key in data) {
                    const value = data[key];
                    formData.set(key, value);
                }
                return {
                    data: formData,
                    contentType: null
                };
            } else {
                return {
                    data: JSON.stringify(data),
                    contentType: 'application/json'
                };
            }
        } catch (error) {
            console.error(error);
            return {};
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
            // If detail key exist with string style
            if (typeof input.detail === 'string') {
                return input.detail;
            }
            // If detail key exist with list style
            if (Array.isArray(input.detail)) {
                return String(input.detail.join('<br/>'));
            }
            return '';
        } else {
            return '';
        }
    }

    static logout(history: Object) {
        this.removeStorage('authData');
        this.navigateTo(history, 'login');
    }

    static popMessage(description: string | Object, type: string = 'success'): void {
        const toastConfig = {
            position: toast.POSITION.BOTTOM_RIGHT
        };
        const messages = this.errorMessageProcessing(description);
        if (!messages) return;

        if (type === 'success') {
            toast.success(messages ? messages : 'Success!', toastConfig);
        } else {
            toast.error(messages ? messages : 'Error!', toastConfig);
        }
    }

    static toggleGlobalLoading(spinning: boolean = true): void {
        this.emitter.emit('TOGGLE_SPINNER', spinning);
    }

    static async apiCall(
        url: string,
        method: string = 'GET',
        payload: Object = {},
        popMessage: boolean = true,
        usingLoading: boolean = true
    ): Promise<{status: number, success: boolean, data: Object}> {
        try {
            if (usingLoading) {
                this.toggleGlobalLoading();
            }
            let requestConfig: Object = {
                method: method,
                headers: {
                    lang: this.getLang(),
                    'Content-Type': 'application/json',
                    fingerprint: await this.getFingerPrint()
                },
                credentials: 'same-origin'
            };
            if (this.getToken()) {
                requestConfig.headers.Authorization = 'JWT ' + this.getToken();
            }
            if (['POST', 'PUT'].indexOf(method) !== -1) {
                // Have payload
                payload = this.payloadFromObject(payload);
                requestConfig.body = payload.data;
                if (!payload.contentType) {
                    delete requestConfig.headers['Content-Type'];
                }
            } else {
                // No payload but url encode
                if (url.indexOf('?') === -1) {
                    url += '?' + this.urlDataEncode(payload);
                }
            }
            let response = await fetch(url, requestConfig);
            let data = {};
            try {
                if (response.status !== 204) {
                    data = await response.json();
                }
                if (response.status === 502) {
                    data = {detail: 'Internal server error'};
                }
            } catch (error) {
                console.log(error);
                data = {detail: 'Internal server error'};
            }
            if (usingLoading) {
                this.toggleGlobalLoading(false);
            }
            if (Array.isArray(data)) {
                data = {
                    count: data.length,
                    items: data,
                    links: {
                        next: null,
                        previous: null
                    },
                    page_size: data.length,
                    pages: 1
                };
            }
            let result = {
                status: response.status,
                success: [200, 201, 204].indexOf(response.status) === -1 ? false : true,
                data
            };
            /*
            if ([200, 201, 204].indexOf(result.status) === -1) {
                this.popMessage(result.data, 'error');
            }
            */
            if (result.status === 401) {
                this.removeStorage('authData');
                window.location = BASE_URL + 'login';
            }
            return result;
        } catch (error) {
            console.error(error);
            if (usingLoading) {
                this.toggleGlobalLoading(false);
            }
            return {
                status: 400,
                success: false,
                data: error
            };
        }
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
            success: false,
            data: {
                detail
            }
        };
    }

    static parseDataError(response: Object): DataErrorPair {
        let data = {};
        let error = {};

        if (response.success) {
            data = response.data;
        } else {
            error = response.data;
        }

        return {data, error};
    }

    static async getItem(url: string, id: number): GetItemResponse {
        const result = await this.apiCall(url + id.toString(), 'GET');
        if (result.success) {
            return result.data;
        }
        return null;
    }

    static async getList(url: string, params: Object = {}): GetListResponse {
        const result = await this.apiCall(url, 'GET', params);
        if (result.success) {
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
            return await this.apiCall(url, 'POST', params);
        } catch (error) {
            return this.commonErrorResponse(error);
        }
    }

    static async handleEdit(url: string, params: Object): Promise<Object> {
        try {
            const id = String(params.id);
            return await this.apiCall(url, 'PUT', params);
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
        const result = await Tools.apiCall(url + (listId.length === 1 ? ids : '?ids=' + ids), 'DELETE');
        return result.success ? listId.map(item => parseInt(item)) : null;
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

    static getFieldId(formName: string, fieldName: string): string {
        if (!formName || !fieldName) return '';
        return `${formName}-${fieldName}`;
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
}
