import Tools from 'src/utils/helpers/Tools';
import {Service} from '../profile/';

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('Service.profileRequest', () => {
    test('Normal case', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        Service.profileRequest();
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('/api/v1/customer/profile/');
    });
});

describe('Service.handleProfileRequest', () => {
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

    it('On success', async () => {
        const profileRequest = jest.spyOn(Service, 'profileRequest').mockImplementation(async () => okResp);
        jest.spyOn(Tools, 'popMessageOrRedirect');

        const result = await Service.handleProfileRequest();

        expect(Tools.popMessageOrRedirect).not.toHaveBeenCalled();
        expect(profileRequest).toHaveBeenCalled();
        expect(result).toEqual(okResp.data);
    });

    it('On error', async () => {
        const profileRequest = jest.spyOn(Service, 'profileRequest').mockImplementation(async () => failResp);
        jest.spyOn(Tools, 'popMessageOrRedirect');

        const result = await Service.handleProfileRequest();

        expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
        expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
    });

    it('On exception', async () => {
        const profileRequest = jest.spyOn(Service, 'profileRequest').mockImplementation(async () => Promise.reject(failResp));
        jest.spyOn(Tools, 'popMessageOrRedirect');

        const result = await Service.handleProfileRequest();

        expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
        expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
    });
});
