import Tools from 'src/utils/helpers/Tools';
import {Service} from '../PwdForm';

beforeEach(() => {
    jest.restoreAllMocks();
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
        const output = Service.prepareParams(params, mode);
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
        const output = Service.prepareParams(params, mode);
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
        Service.request(params, mode);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/customer/reset-password/');
        expect(apiCall.mock.calls[0][1]).toEqual(params);
        expect(apiCall.mock.calls[0][2]).toEqual('POST');
    });
});

describe('Service.handleSubmit', () => {
    test('Error', async () => {
        const mode = 'reset';
        const onChange = jest.fn();
        const setErrors = jest.fn();
        const resp = {
            ok: false,
            data: {}
        };
        jest.spyOn(Service, 'request').mockImplementation(async () => resp);
        await Service.handleSubmit(onChange, mode)(resp, {setErrors});
        expect(onChange).not.toHaveBeenCalled();
        expect(setErrors).toHaveBeenCalled();
    });

    test('Success', async () => {
        const mode = 'reset';
        const onChange = jest.fn();
        const setErrors = jest.fn();
        const resp = {
            ok: true,
            data: {}
        };
        jest.spyOn(Service, 'request').mockImplementation(async () => resp);
        await Service.handleSubmit(onChange, mode)(resp, {setErrors});
        expect(onChange).toHaveBeenCalled();
        expect(setErrors).not.toHaveBeenCalled();
    });
});

describe('Service.validate', () => {
    test('change mode', async () => {
        const mode = 'change';
        const values = {
            username: '',
            password: '',
            passwordAgain: '',
            oldPassword: ''
        };
        const eput = {
            username: 'Required',
            password: 'Required',
            passwordAgain: 'Required',
            oldPassword: 'Required'
        };
        const output = Service.validate(mode)(values);
        expect(output).toEqual(eput);
    });

    test('reset mode', async () => {
        const mode = 'reset';
        const values = {
            username: '',
            password: '',
            passwordAgain: '',
            oldPassword: ''
        };
        const eput = {
            username: 'Required',
            password: 'Required',
            passwordAgain: 'Required'
        };
        const output = Service.validate(mode)(values);
        expect(output).toEqual(eput);
    });

    test('does not match', async () => {
        const mode = 'change';
        const values = {
            username: '',
            password: 'pwd1',
            passwordAgain: 'pwd2',
            oldPassword: ''
        };
        const eput = {
            username: 'Required',
            password: "Password doesn't match",
            oldPassword: 'Required'
        };
        const output = Service.validate(mode)(values);
        expect(output).toEqual(eput);
    });
});
