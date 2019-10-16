import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import Tools from 'src/utils/helpers/Tools';
import {Service} from '../index';

Enzyme.configure({adapter: new Adapter()});

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('Service.listRequest', () => {
    test('No params', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        Service.listRequest();
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/order-item/');
        expect(apiCall.mock.calls[0][1]).toEqual({});
    });

    test('With params', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {search: 'keyword'};

        Service.listRequest(params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/order-item/');
        expect(apiCall.mock.calls[0][1]).toEqual(params);
    });

    test('With url', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {search: 'keyword'};
        const url = 'http://localhost/api/v1/order-item/';

        Service.listRequest(params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual(url);
        expect(apiCall.mock.calls[0][1]).toEqual(params);
    });
});

describe('Service.bulkRemoveRequest', () => {
    test('Normal case', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const ids = [1, 2];
        Service.bulkRemoveRequest(ids);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/order-item/');
        expect(apiCall.mock.calls[0][1]).toEqual({ids: '1,2'});
        expect(apiCall.mock.calls[0][2]).toEqual('DELETE');
    });
});

describe('Service.handleGetList', () => {
    const okResp = {
        ok: true,
        data: {
            key: 'value'
        }
    };
    const failResp = {
        ok: false,
        data: {
            key: 'value'
        }
    };
    test('On success', async () => {
        const listRequest = jest.spyOn(Service, 'listRequest').mockImplementation(async () => okResp);
        jest.spyOn(Tools, 'popMessageOrRedirect');
        const url = 'http://localhost/api/v1/order-item/';
        const params = {key: 'value'};

        const result = await Service.handleGetList(params);

        expect(Tools.popMessageOrRedirect).not.toHaveBeenCalled();
        expect(listRequest).toHaveBeenCalled();
        expect(listRequest.mock.calls[0][0]).toEqual(params);
        expect(result).toEqual(okResp.data);
    });

    test('On error', async () => {
        try {
            const listRequest = jest.spyOn(Service, 'listRequest').mockImplementation(async () => failResp);
            jest.spyOn(Tools, 'popMessageOrRedirect');

            const result = await Service.handleGetList();

            expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
            expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
        } catch (err) {}
    });

    test('On exception', async () => {
        try {
            const listRequest = jest
                .spyOn(Service, 'listRequest')
                .mockImplementation(async () => Promise.reject(failResp));
            jest.spyOn(Tools, 'popMessageOrRedirect');

            const result = await Service.handleGetList();

            expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
            expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
        } catch (err) {}
    });
});

describe('Service.handleBulkRemove', () => {
    const okResp = {
        ok: true,
        data: {
            key: 'value'
        }
    };
    const failResp = {
        ok: false,
        data: {
            key: 'value'
        }
    };

    test('On success', async () => {
        const bulkRemoveRequest = jest.spyOn(Service, 'bulkRemoveRequest').mockImplementation(async () => okResp);
        jest.spyOn(Tools, 'popMessageOrRedirect');
        const ids = [1, 2];
        const result = await Service.handleBulkRemove(ids);

        expect(Tools.popMessageOrRedirect).not.toHaveBeenCalled();
        expect(bulkRemoveRequest).toHaveBeenCalled();
        expect(bulkRemoveRequest.mock.calls[0][0]).toEqual(ids);
        expect(result).toEqual({ids});
    });

    test('On error', async () => {
        try {
            const bulkRemoveRequest = jest.spyOn(Service, 'bulkRemoveRequest').mockImplementation(async () => failResp);
            jest.spyOn(Tools, 'popMessageOrRedirect');
            const ids = [1, 2];
            const result = await Service.handleBulkRemove(ids);

            expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
            expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
        } catch (err) {}
    });

    test('On exception', async () => {
        try {
            const bulkRemoveRequest = jest
                .spyOn(Service, 'bulkRemoveRequest')
                .mockImplementation(async () => Promise.reject(failResp));
            jest.spyOn(Tools, 'popMessageOrRedirect');
            const ids = [1, 2];
            const result = await Service.handleBulkRemove(ids);

            expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
            expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
        } catch (err) {}
    });
});
