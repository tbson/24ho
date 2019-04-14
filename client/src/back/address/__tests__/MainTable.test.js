import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import Tools from 'src/utils/helpers/Tools';
import {Service} from '../main_table/';

Enzyme.configure({adapter: new Adapter()});

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('Service.listRequest', () => {
    it('No params', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        Service.listRequest();
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/address/');
        expect(apiCall.mock.calls[0][1]).toBe(undefined);
    });

    it('With params', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {search: 'keyword'};

        Service.listRequest('', params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/address/');
        expect(apiCall.mock.calls[0][1]).toEqual(params);
    });

    it('With url', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const params = {search: 'keyword'};
        const url = 'sample_url';

        Service.listRequest(url, params);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual(url);
        expect(apiCall.mock.calls[0][1]).toEqual(params);
    });
});

describe('Service.bulkRemoveRequest', () => {
    it('Normal case', () => {
        const apiCall = jest.spyOn(Tools, 'apiCall').mockImplementation(async () => {});
        const ids = [1, 2];
        Service.bulkRemoveRequest(ids);
        expect(apiCall).toHaveBeenCalled();
        expect(apiCall.mock.calls[0][0]).toEqual('http://localhost/api/v1/address/');
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
    it('On success', async () => {
        const listRequest = jest.spyOn(Service, 'listRequest').mockImplementation(async () => okResp);
        jest.spyOn(Tools, 'popMessageOrRedirect');
        const url = 'sample_url';
        const params = {key: 'value'};

        const result = await Service.handleGetList(url, params);

        expect(Tools.popMessageOrRedirect).not.toHaveBeenCalled();
        expect(listRequest).toHaveBeenCalled();
        expect(listRequest.mock.calls[0][0]).toEqual(url);
        expect(listRequest.mock.calls[0][1]).toEqual(params);
        expect(result).toEqual(okResp.data);
    });

    it('On error', async () => {
        const listRequest = jest.spyOn(Service, 'listRequest').mockImplementation(async () => failResp);
        jest.spyOn(Tools, 'popMessageOrRedirect');

        const result = await Service.handleGetList();

        expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
        expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
    });

    it('On exception', async () => {
        const listRequest = jest.spyOn(Service, 'listRequest').mockImplementation(async () => Promise.reject(failResp));
        jest.spyOn(Tools, 'popMessageOrRedirect');

        const result = await Service.handleGetList();

        expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
        expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
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

    it('On success', async () => {
        const bulkRemoveRequest = jest.spyOn(Service, 'bulkRemoveRequest').mockImplementation(async () => okResp);
        jest.spyOn(Tools, 'popMessageOrRedirect');
        const ids = [1, 2];
        const result = await Service.handleBulkRemove(ids);

        expect(Tools.popMessageOrRedirect).not.toHaveBeenCalled();
        expect(bulkRemoveRequest).toHaveBeenCalled();
        expect(bulkRemoveRequest.mock.calls[0][0]).toEqual(ids);
        expect(result).toEqual({ids});
    });

    it('On error', async () => {
        const bulkRemoveRequest = jest.spyOn(Service, 'bulkRemoveRequest').mockImplementation(async () => failResp);
        jest.spyOn(Tools, 'popMessageOrRedirect');
        const ids = [1, 2];
        const result = await Service.handleBulkRemove(ids);

        expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
        expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
    });

    it('On error', async () => {
        const bulkRemoveRequest = jest
            .spyOn(Service, 'bulkRemoveRequest')
            .mockImplementation(async () => Promise.reject(failResp));
        jest.spyOn(Tools, 'popMessageOrRedirect');
        const ids = [1, 2];
        const result = await Service.handleBulkRemove(ids);

        expect(Tools.popMessageOrRedirect).toHaveBeenCalled();
        expect(Tools.popMessageOrRedirect.mock.calls[0][0]).toEqual(failResp);
    });
});

describe('Service.areaToOptions', () => {
    it('Normal case', () => {
        const input = [
            {
                id: 1,
                uid: 'uid1',
                title: 'title1'
            },
            {
                id: 2,
                uid: 'uid2',
                title: 'title2'
            }
        ];
        const eput = [
            {
                value: 1,
                label: 'uid1 - title1'
            },
            {
                value: 2,
                label: 'uid2 - title2'
            }
        ];
        const output = Service.areaToOptions(input);
        expect(eput).toEqual(output);
    });
});

describe('Service.addNameToList', () => {
    it('area case', () => {
        const list = [
            {
                area: 1
            },
            {
                area: 2
            },
            {
                area: 3
            }
        ];
        const nameSource = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const eput = [
            {
                area: 1,
                area_name: 'item 1'
            },
            {
                area: 2,
                area_name: 'item 2'
            },
            {
                area: 3
            }
        ];
        const output = Service.addNameToList(list, nameSource, 'area');
        expect(eput).toEqual(output);
    });
});

describe('Service.addNameToItem', () => {
    it('area case', () => {
        const item = {
            area: 1
        };
        const nameSource = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const eput = {
            area: 1,
            area_name: 'item 1'
        };
        const output = Service.addNameToItem(item, nameSource, 'area');
        expect(eput).toEqual(output);
    });
});

describe('Service.prepareList', () => {
    it('Normal case', () => {
        const list = [
            {
                area: 1
            },
            {
                area: 2
            },
            {
                area: 3
            }
        ];
        const listArea = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];
        const eput = [
            {
                checked: false,
                area: 1,
                area_name: 'item 1'
            },
            {
                checked: false,
                area: 2,
                area_name: 'item 2'
            },
            {
                checked: false,
                area: 3,
                area_name: undefined
            }
        ];
        const output = Service.prepareList(list, listArea);
        expect(eput).toEqual(output);
    });
});

describe('Service.prepareItem', () => {
    it('Normal case', () => {
        const item = {
            area: 1
        };
        const listArea = [
            {
                value: 1,
                label: 'item 1'
            },
            {
                value: 2,
                label: 'item 2'
            }
        ];

        const eput = {
            checked: false,
            area: 1,
            area_name: 'item 1'
        };
        const output = Service.prepareItem(item, listArea);
        expect(eput).toEqual(output);
    });
});