import Tools from 'src/utils/helpers/Tools';
import {Service} from '../profile/Form';

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('Service.getProfileRequest', () => {
    test('Normal case', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        Service.getProfileRequest();
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1//profile/');
    });
});

describe('Service.setProfileRequest', () => {
    test('Normal case', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {
            key: 'value'
        };
        Service.setProfileRequest(params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1//profile/');
        expect(apiCall.mock.calls[0][1]).toEqual(params);
        expect(apiCall.mock.calls[0][2]).toEqual('POST');
    });
});

describe('Service.getProfile', () => {
    test('Error', async () => {
        const callback = jest.fn();
        jest.spyOn(Service, 'getProfileRequest').mockImplementation(async () => ({
            ok: false,
            data: {}
        }));

        await Service.getProfile(callback);
        expect(callback).not.toHaveBeenCalled();
    });

    test('Success', async () => {
        const callback = jest.fn();
        jest.spyOn(Service, 'getProfileRequest').mockImplementation(async () => ({
            ok: true,
            data: {}
        }));

        await Service.getProfile(callback);
        expect(callback).toHaveBeenCalled();
    });
});

describe('Service.handleSubmit', () => {
    test('Error', async () => {
        jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => ({
            key: 'value'
        }));
        jest.spyOn(Service, 'setProfileRequest').mockImplementation(_ => ({
            ok: false,
            data: {}
        }));
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const e = {
            preventDefault: () => {}
        };
        await Service.handleSubmit(onSuccess, onError)(e);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalled();
    });

    test('Success', async () => {
        jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => ({
            key: 'value'
        }));
        jest.spyOn(Service, 'setProfileRequest').mockImplementation(_ => ({
            ok: true,
            data: {}
        }));
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const e = {
            preventDefault: () => {}
        };
        await Service.handleSubmit(onSuccess, onError)(e);
        expect(onSuccess).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
    });
});
