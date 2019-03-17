import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import Tools from 'src/utils/helpers/Tools';
import {Service} from '../MainForm/';

Enzyme.configure({adapter: new Adapter()});

beforeEach(() => {
    jest.restoreAllMocks();
});

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

describe('Service.changeRequest', () => {
    it('No ID', async () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {
            key: 'value'
        };
        await Service.changeRequest(params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/variable/');
        expect(apiCall.mock.calls[0][1]).toEqual(params);
        expect(apiCall.mock.calls[0][2]).toEqual('POST');
    });

    it('With ID', async () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {
            id: 1,
            key: 'value'
        };
        const {id} = params;
        await Service.changeRequest(params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual(`http://localhost/api/v1/variable/${id}`);
        expect(apiCall.mock.calls[0][1]).toEqual(params);
        expect(apiCall.mock.calls[0][2]).toEqual('PUT');
    });
});

describe('Service.retrieveRequest', () => {
    it('Normal case', async () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const id = 1;
        await Service.retrieveRequest(id);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual(`http://localhost/api/v1/variable/${id}`);
    });
});

describe('Service.handleSubmit', () => {
    describe('Zero ID', () => {
        it('Success', async () => {
            const params = {key: 'value'};
            const checkedParams = {key: 'value', checked: false};
            const id = 0;
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const e = {preventDefault: () => {}};

            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => params);
            const changeRequest = jest.spyOn(Service, 'changeRequest').mockImplementation(async () => okResp);

            await Service.handleSubmit(id, onSuccess, onError)(e);

            expect(changeRequest).toHaveBeenCalled();
            expect(changeRequest.mock.calls[0][0]).toEqual(params);

            expect(onSuccess).toHaveBeenCalled();
            expect(onSuccess.mock.calls[0][0]).toEqual(checkedParams);
            expect(onSuccess.mock.calls[0][1]).toEqual('add');

            expect(onError).not.toHaveBeenCalled();
        });

        it('Error', async () => {
            const params = {key: 'value'};
            const id = 0;
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const e = {preventDefault: () => {}};

            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => params);
            const changeRequest = jest.spyOn(Service, 'changeRequest').mockImplementation(async () => failResp);

            await Service.handleSubmit(id, onSuccess, onError)(e);

            expect(onSuccess).not.toHaveBeenCalled();

            expect(onError).toHaveBeenCalled();
            expect(onError.mock.calls[0][0]).toEqual({key: ['value']});
        });

        it('Exception', async () => {
            const params = {key: 'value'};
            const id = 0;
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const e = {preventDefault: () => {}};

            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => params);
            const changeRequest = jest
                .spyOn(Service, 'changeRequest')
                .mockImplementation(async () => Promise.reject(failResp.data));

            await Service.handleSubmit(id, onSuccess, onError)(e);

            expect(onSuccess).not.toHaveBeenCalled();

            expect(onError).toHaveBeenCalled();
            expect(onError.mock.calls[0][0]).toEqual({key: ['value']});
        });
    });

    describe('Non Zero ID', () => {
        it('Success', async () => {
            const params = {key: 'value'};
            const paramsWithId = {id: 1, key: 'value'};
            const checkedParams = {key: 'value', checked: false};
            const id = 1;
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const e = {preventDefault: () => {}};

            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => params);
            const changeRequest = jest.spyOn(Service, 'changeRequest').mockImplementation(async () => okResp);

            await Service.handleSubmit(id, onSuccess, onError)(e);

            expect(changeRequest).toHaveBeenCalled();
            expect(changeRequest.mock.calls[0][0]).toEqual(paramsWithId);

            expect(onSuccess).toHaveBeenCalled();
            expect(onSuccess.mock.calls[0][0]).toEqual(checkedParams);
            expect(onSuccess.mock.calls[0][1]).toEqual('update');

            expect(onError).not.toHaveBeenCalled();
        });

        it('Error', async () => {
            const params = {key: 'value'};
            const id = 1;
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const e = {preventDefault: () => {}};

            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => params);
            const changeRequest = jest.spyOn(Service, 'changeRequest').mockImplementation(async () => failResp);

            await Service.handleSubmit(id, onSuccess, onError)(e);

            expect(onSuccess).not.toHaveBeenCalled();

            expect(onError).toHaveBeenCalled();
            expect(onError.mock.calls[0][0]).toEqual({key: ['value']});
        });

        it('Exception', async () => {
            const params = {key: 'value'};
            const id = 1;
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const e = {preventDefault: () => {}};

            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => params);
            const changeRequest = jest
                .spyOn(Service, 'changeRequest')
                .mockImplementation(async () => Promise.reject(failResp.data));

            await Service.handleSubmit(id, onSuccess, onError)(e);

            expect(onSuccess).not.toHaveBeenCalled();

            expect(onError).toHaveBeenCalled();
            expect(onError.mock.calls[0][0]).toEqual({key: ['value']});
        });
    });
});

describe('Service.handleRetrieve', () => {
    it('No ID', async () => {
        const callback = jest.fn();
        const id = 0;

        const retrieveRequest = jest.spyOn(Service, 'retrieveRequest').mockImplementation(async () => okResp);

        await Service.handleRetrieve(id, callback);

        expect(retrieveRequest).not.toHaveBeenCalled();

        expect(callback).toHaveBeenCalled();
        expect(callback.mock.calls[0][0]).toEqual({});
    });

    it('Success', async () => {
        const callback = jest.fn();
        const id = 1;

        const retrieveRequest = jest.spyOn(Service, 'retrieveRequest').mockImplementation(async () => okResp);

        await Service.handleRetrieve(id, callback);

        expect(callback).toHaveBeenCalled();
        expect(callback.mock.calls[0][0]).toEqual(okResp.data);
    });

    it('Error', async () => {
        const callback = jest.fn();
        const id = 1;

        const retrieveRequest = jest.spyOn(Service, 'retrieveRequest').mockImplementation(async () => failResp);

        await Service.handleRetrieve(id, callback);

        expect(callback).toHaveBeenCalled();
        expect(callback.mock.calls[0][0]).toEqual({});
    });

    it('Exception', async () => {
        const callback = jest.fn();
        const id = 1;

        const retrieveRequest = jest
            .spyOn(Service, 'retrieveRequest')
            .mockImplementation(async () => Promise.reject(failResp));

        await Service.handleRetrieve(id, callback);

        expect(callback).toHaveBeenCalled();
        expect(callback.mock.calls[0][0]).toEqual({});
    });
});
