import Tools from 'src/utils/helpers/Tools';
import {Service} from '../PwdForm';


beforeEach(() => {
    jest.restoreAllMocks();
});

describe('Service.validate', () => {
    test('No error', () => {
        const input = {
            password: 'test',
            passwordAgain: 'test'
        };
        const eput = {};
        const output = Service.validate(input);
        expect(output).toEqual(eput);
    });

    test('With error', () => {
        const input = {
            password: 'test',
            passwordAgain: 'test111'
        };
        const eput = {
            detail: 'Password mismatch!'
        };
        const output = Service.validate(input);
        expect(output).toEqual(eput);
    });
});

describe('Service.prepareParams', () => {
    test('reset mode', () => {
        const mode = 'reset';
        const params = {
            password: 'test',
            passwordAgain: 'test'
        };
        const eput = {
            password: 'test'
        };
        const output = Service.prepareParams(mode)(params);
        expect(output).toEqual(eput);
    });

    test('change mode', () => {
        const mode = 'change';
        const params = {
            password: 'test',
            passwordAgain: 'test',
            oldPassword: 'test'
        };
        const eput = {
            password: 'test',
            oldPassword: 'test'
        };
        const output = Service.prepareParams(mode)(params);
        expect(output).toEqual(eput);
    });
});

describe('Service.request', () => {
    test('Normal case', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const mode = 'reset';
        const params = {
            password: 'test',
            passwordAgain: 'test'
        };
        Service.request(mode)(params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1//reset-password/');
        expect(apiCall.mock.calls[0][1]).toEqual(params);
        expect(apiCall.mock.calls[0][2]).toEqual('POST');
    });
});

describe('Service.handleSubmit', () => {
    test('Early error', async () => {
        jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => ({
            password: 'test',
            passwordAgain: 'test1'
        }));
        jest.spyOn(Service, 'request').mockImplementation(_ => _ => ({
            ok: true,
            data: {}
        }));
        const mode = 'reset';
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const e = {
            preventDefault: () => {}
        };
        await Service.handleSubmit(mode, onSuccess, onError)(e);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalled();
    });

    test('Later error', async () => {
        jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => ({
            password: 'test',
            passwordAgain: 'test'
        }));
        jest.spyOn(Service, 'request').mockImplementation(_ => _ => ({
            ok: false,
            data: {}
        }));
        const mode = 'reset';
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const e = {
            preventDefault: () => {}
        };
        await Service.handleSubmit(mode, onSuccess, onError)(e);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalled();
    });

    test('Success', async () => {
        jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => ({
            password: 'test',
            passwordAgain: 'test'
        }));
        jest.spyOn(Service, 'request').mockImplementation(_ => _ => ({
            ok: true,
            data: {}
        }));
        const mode = 'reset';
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const e = {
            preventDefault: () => {}
        };
        await Service.handleSubmit(mode, onSuccess, onError)(e);
        expect(onSuccess).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
    });
});
