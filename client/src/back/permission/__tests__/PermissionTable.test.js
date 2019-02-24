import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import 'src/__mocks__/FormData';
import {PermissionTable} from '../tables/PermissionTable';
import {seeding, defaultFormValues} from '../_data';
import LoadingLabel from 'src/utils/components/LoadingLabel';
import Tools from 'src/utils/helpers/Tools';

Enzyme.configure({adapter: new Adapter()});

describe('PermissionTable component', () => {
    beforeAll(() => {
        const response = {
            status: 200,
            success: true,
            data: {
                count: 1,
                pages: 1,
                page_size: 10,
                links: {next: 'nextUrl', previous: 'prevUrl'},
                items: seeding(10)
            }
        };
        Tools.apiCall = async (url, method, params = {}) => response;
    });

    it('Init data', done => {
        const wrapper = shallow(<PermissionTable />);
        const instance = wrapper.instance();
        const setInitData = jest.spyOn(instance, 'setInitData');

        // Data not loaded -> show waiting
        expect(wrapper.contains(<LoadingLabel />)).toEqual(true);

        setTimeout(() => {
            // After loading data done
            wrapper.update();
            expect(wrapper.find('.table-row')).toHaveLength(10);

            expect(setInitData).toHaveBeenCalled();
            done();
        }, 100);
    });
});

describe('PermissionTable methods', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    describe('toggleModal', () => {
        let wrapper, instance;
        beforeEach(() => {
            jest.spyOn(PermissionTable.prototype, 'componentDidMount').mockImplementation(() => {});
            wrapper = shallow(<PermissionTable />);
            instance = wrapper.instance();
        });

        it('Not defined modal', () => {
            const modalName = 'newThing';
            instance.toggleModal(modalName);
            expect(wrapper.state('modal')).toEqual(false);
        });

        it('Empty modal name', () => {
            const modalName = '';
            instance.toggleModal(modalName);
            expect(wrapper.state('modal')).toEqual(false);
        });

        it('Correct modal name then toggle again', () => {
            let modalName = 'modal';

            instance.toggleModal(modalName);
            expect(wrapper.state('modal')).toEqual(true);

            instance.toggleModal(modalName);
            expect(wrapper.state('modal')).toEqual(false);
        });
    });

    describe('getList', () => {
        it('fail', async () => {
            // Spy/mock static methods
            jest.spyOn(PermissionTable.prototype, 'componentDidMount').mockImplementation(() => {});
            let getList = jest.spyOn(Tools, 'getList').mockImplementation(async () => null);

            // Init component
            const wrapper = shallow(<PermissionTable />);
            const instance = wrapper.instance();

            // Spy setInitData function
            const setInitData = jest.spyOn(instance, 'setInitData');

            // Execute
            await wrapper.instance().getList();

            // setInitData will call after PermissionTable mount
            expect(getList.mock.calls[0][0]).toEqual('http://localhost/api/v1/permission/');
            expect(getList.mock.calls[0][1]).toEqual({});
            expect(setInitData).not.toHaveBeenCalled();
        });

        it('success', async () => {
            const response = {
                links: {next: 'nextUrl', previous: 'prevUrl'},
                items: seeding(10)
            };

            // Spy/mock static methods
            jest.spyOn(PermissionTable.prototype, 'componentDidMount').mockImplementation(() => {});
            let getList = jest.spyOn(Tools, 'getList').mockImplementation(async () => response);

            // Init component
            const wrapper = shallow(<PermissionTable />);
            const instance = wrapper.instance();

            // Spy setInitData function
            const setInitData = jest.spyOn(instance, 'setInitData');

            // Execute
            await wrapper.instance().getList();

            // setInitData will call after PermissionTable mount
            expect(getList.mock.calls[0][0]).toEqual('http://localhost/api/v1/permission/');
            expect(getList.mock.calls[0][1]).toEqual({});
            expect(setInitData.mock.calls[0][0]).toEqual(response);
            expect(setInitData).toHaveBeenCalled();
        });
    });

    describe('getSearchList', () => {
        const event = {
            preventDefault: () => {},
            target: {}
        };
        it('Empty string', async () => {
            const data = {search: ''};

            // Spy/mock static methods
            jest.spyOn(PermissionTable.prototype, 'componentDidMount').mockImplementation(() => {});
            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => data);

            // Init component
            const wrapper = shallow(<PermissionTable />);
            const instance = wrapper.instance();
            const getList = jest.spyOn(instance, 'getList').mockImplementation(() => {});

            // Execute tested method
            await instance.searchList(event);

            // Checking result
            expect(getList).toHaveBeenCalled();
            expect(getList.mock.calls[0][0]).toBe(undefined);
        });
        it('2 character', async () => {
            const data = {search: 'ab'};

            // Spy/mock static methods
            jest.spyOn(PermissionTable.prototype, 'componentDidMount').mockImplementation(() => {});
            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => data);

            // Init component
            const wrapper = shallow(<PermissionTable />);
            const instance = wrapper.instance();
            const getList = jest.spyOn(instance, 'getList').mockImplementation(() => {});

            // Execute tested method
            await instance.searchList(event);

            // Checking result
            expect(getList).not.toHaveBeenCalled();
        });
        it('3 characters', async () => {
            const data = {search: 'abc'};

            // Spy/mock static methods
            jest.spyOn(PermissionTable.prototype, 'componentDidMount').mockImplementation(() => {});
            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => data);

            // Init component
            const wrapper = shallow(<PermissionTable />);
            const instance = wrapper.instance();
            const getList = jest.spyOn(instance, 'getList').mockImplementation(() => {});

            // Execute tested method
            await instance.searchList(event);

            // Checking result
            expect(getList).toHaveBeenCalled();
            expect(getList.mock.calls[0][0]).toEqual('');
            expect(getList.mock.calls[0][1]).toEqual(data);
        });
    });

    describe('onSubmitSuccess', () => {
        let wrapper;
        let instance;
        beforeEach(() => {
            const list = seeding(3);
            jest.spyOn(PermissionTable.prototype, 'componentDidMount').mockImplementation(() => {});
            wrapper = shallow(<PermissionTable list={list} />);
            instance = wrapper.instance();
        });

        it('Adding', async () => {
            const isEdit = false;
            const data = seeding(4, true);
            const list = seeding(3);
            instance.onSubmitSuccess(isEdit, data);
            expect(wrapper.state('list')).toEqual([data, ...list]);
        });

        it('Editing', async () => {
            const isEdit = true;
            const data = {...seeding(4, true), id: seeding(2, true).id};
            const list = seeding(3);
            list[1] = data;
            instance.onSubmitSuccess(isEdit, data);
            expect(wrapper.state('list')).toEqual([...list]);
        });
    });
});
