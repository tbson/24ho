import Tools from 'src/utils/helpers/Tools';
import {Service} from '../login/Form';


beforeEach(() => {
    jest.restoreAllMocks();
});

describe('Service.request', () => {
    test('Normal case', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {
            username: 'test',
            password: 'test'
        };
        Service.request(params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1//auth/');
        expect(apiCall.mock.calls[0][1]).toEqual(params);
        expect(apiCall.mock.calls[0][2]).toEqual('POST');
    });
});

describe('Service.handleSubmit', () => {
    test('Error', async () => {
        jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => ({
            username: 'test',
            password: 'test'
        }));
        jest.spyOn(Service, 'request').mockImplementation(_ => ({
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
            username: 'test',
            password: 'test'
        }));
        jest.spyOn(Service, 'request').mockImplementation(_ => ({
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
