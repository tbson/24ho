import Tools from 'src/utils/helpers/Tools';
import {Service} from '../reset_pwd/';

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('Service.request', () => {
    test('Normal case', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {
            token: 'token'
        };
        Service.request(params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1//reset-password/');
        expect(apiCall.mock.calls[0][1]).toEqual(params);
    });
});

describe('Service.handleRequest', () => {
    test('Error', async () => {
        const params = {
            token: 'token'
        };
        jest.spyOn(Service, 'request').mockImplementation(_ => ({
            ok: false,
            data: {}
        }));
        const onSuccess = jest.fn();
        const onError = jest.fn();
        await Service.handleRequest(onSuccess, onError)(params);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalled();
    });

    test('Success', async () => {
        const params = {
            token: 'token'
        };
        jest.spyOn(Service, 'request').mockImplementation(_ => ({
            ok: true,
            data: {}
        }));
        const onSuccess = jest.fn();
        const onError = jest.fn();
        await Service.handleRequest(onSuccess, onError)(params);
        expect(onSuccess).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
    });
});
