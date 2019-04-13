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
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/customer/auth/');
        expect(apiCall.mock.calls[0][1]).toEqual(params);
        expect(apiCall.mock.calls[0][2]).toEqual('POST');
    });
});

describe('Service.handleSubmit', () => {
    test('Error', async () => {
        const onChange = jest.fn();
        const setErrors = jest.fn();
        const resp = {
            ok: false,
            data: {}
        };
        jest.spyOn(Service, 'request').mockImplementation(async () => resp);
        await Service.handleSubmit(onChange)(resp, {setErrors});
        expect(onChange).not.toHaveBeenCalled();
        expect(setErrors).toHaveBeenCalled();
    });

    test('Success', async () => {
        const onChange = jest.fn();
        const setErrors = jest.fn();
        const resp = {
            ok: true,
            data: {}
        };
        jest.spyOn(Service, 'request').mockImplementation(async () => resp);
        await Service.handleSubmit(onChange)(resp, {setErrors});
        expect(onChange).toHaveBeenCalled();
        expect(setErrors).not.toHaveBeenCalled();
    });
});

describe('Service.validate', () => {
    test('All empty', async () => {
        const values = {
            username: '',
            password: ''
        };
        const eput = {
            username: 'Required',
            password: 'Required'
        };
        const output = Service.validate(values);
        expect(output).toEqual(eput);
    });

    test('Username empty', async () => {
        const values = {
            username: '',
            password: 'test'
        };
        const eput = {
            username: 'Required'
        };
        const output = Service.validate(values);
        expect(output).toEqual(eput);
    });
});
