import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import 'src/__mocks__/FormData';
import {GroupTable} from '../tables/GroupTable';
import {seeding, defaultFormValues} from '../_data';
import LoadingLabel from 'src/utils/components/LoadingLabel';
import Tools from 'src/utils/helpers/Tools';

Enzyme.configure({adapter: new Adapter()});

describe('GroupTable component', () => {
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
        const wrapper = shallow(<GroupTable />);
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

    it('Check all', () => {
        // Spy/mock static methods
        jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});

        const wrapper = shallow(<GroupTable list={seeding(10)} />);
        const instance = wrapper.instance();
        const handleToggleCheckAll = jest.spyOn(instance, 'handleToggleCheckAll');

        wrapper
            .find('.check-all-button')
            .first()
            .simulate('click');

        expect(handleToggleCheckAll).toHaveBeenCalled();
    });

    it('Add', () => {
        // Spy/mock static methods
        jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});

        const wrapper = shallow(<GroupTable list={seeding(10)} />);
        const instance = wrapper.instance();
        const toggleModal = jest.spyOn(instance, 'toggleModal');

        wrapper
            .find('.add-button')
            .first()
            .simulate('click');

        expect(toggleModal).toHaveBeenCalled();
        expect(toggleModal.mock.calls[0][0]).toEqual('modal');
    });

    describe('Bulk remove', () => {
        beforeEach(() => {
            jest.restoreAllMocks();
        });

        it('No check', () => {
            // Spy/mock static methods
            jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});

            const wrapper = shallow(<GroupTable list={seeding(10)} />);
            const instance = wrapper.instance();
            const handleRemove = jest.spyOn(instance, 'handleRemove').mockImplementation(() => null);

            wrapper
                .find('.bulk-remove-button')
                .first()
                .simulate('click');

            expect(handleRemove).toHaveBeenCalled();
            expect(handleRemove.mock.calls[0][0]).toEqual('');
        });

        it('Check all', () => {
            // Spy/mock static methods
            jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});

            const wrapper = shallow(<GroupTable list={seeding(10)} />);
            const instance = wrapper.instance();
            const handleRemove = jest.spyOn(instance, 'handleRemove').mockImplementation(() => null);

            wrapper
                .find('.check-all-button')
                .first()
                .simulate('click');

            wrapper
                .find('.bulk-remove-button')
                .first()
                .simulate('click');

            expect(handleRemove).toHaveBeenCalled();
            expect(handleRemove.mock.calls[0][0]).toEqual('1,2,3,4,5,6,7,8,9,10');
        });
    });
});

describe('GroupTable methods', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    describe('toggleModal', () => {
        let wrapper, instance;
        beforeEach(() => {
            jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});
            wrapper = shallow(<GroupTable />);
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
            jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});
            let getList = jest.spyOn(Tools, 'getList').mockImplementation(async () => null);

            // Init component
            const wrapper = shallow(<GroupTable />);
            const instance = wrapper.instance();

            // Spy setInitData function
            const setInitData = jest.spyOn(instance, 'setInitData');

            // Execute
            await wrapper.instance().getList();

            // setInitData will call after GroupTable mount
            expect(getList.mock.calls[0][0]).toEqual('http://localhost/api/v1/group/');
            expect(getList.mock.calls[0][1]).toEqual({});
            expect(setInitData).not.toHaveBeenCalled();
        });

        it('success', async () => {
            const response = {
                links: {next: 'nextUrl', previous: 'prevUrl'},
                items: seeding(10)
            };

            // Spy/mock static methods
            jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});
            let getList = jest.spyOn(Tools, 'getList').mockImplementation(async () => response);

            // Init component
            const wrapper = shallow(<GroupTable />);
            const instance = wrapper.instance();

            // Spy setInitData function
            const setInitData = jest.spyOn(instance, 'setInitData');

            // Execute
            await wrapper.instance().getList();

            // setInitData will call after GroupTable mount
            expect(getList.mock.calls[0][0]).toEqual('http://localhost/api/v1/group/');
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
            jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});
            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => data);

            // Init component
            const wrapper = shallow(<GroupTable />);
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
            jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});
            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => data);

            // Init component
            const wrapper = shallow(<GroupTable />);
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
            jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});
            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => data);

            // Init component
            const wrapper = shallow(<GroupTable />);
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
            jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});
            wrapper = shallow(<GroupTable list={list} />);
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

    describe('handleRemove', () => {
        let wrapper;
        let instance;
        beforeEach(() => {
            const list = seeding(5);
            jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});
            wrapper = shallow(<GroupTable list={list} />);
            instance = wrapper.instance();
        });

        it('Fail', async () => {
            jest.spyOn(Tools, 'handleRemove').mockImplementation(() => null);
            const ids = '2,3';
            const list = seeding(5);
            instance.handleRemove(ids);
            expect(wrapper.state('list')).toEqual(list);
        });

        it('Success', async () => {
            const ids = '2,3';
            jest.spyOn(Tools, 'handleRemove').mockImplementation(() => [2, 3]);
            const list = [seeding(1, true), seeding(4, true), seeding(5, true)];
            await instance.handleRemove(ids);
            expect(wrapper.state('list')).toEqual(list);
        });
    });

    describe('handleCheck', () => {
        let wrapper;
        let instance;
        beforeEach(() => {
            const list = seeding(1);
            jest.spyOn(GroupTable.prototype, 'componentDidMount').mockImplementation(() => {});
            wrapper = shallow(<GroupTable list={list} />);
            instance = wrapper.instance();
        });

        it('False to True and vice versa', () => {
            const list = seeding(1);

            let event = {
                target: {id: 1, checked: true}
            };
            instance.handleCheck(event);
            expect(wrapper.state('list')).toEqual([{...list[0], checked: true}]);

            event = {
                target: {id: 1, checked: false}
            };
            instance.handleCheck(event);
            expect(wrapper.state('list')).toEqual([{...list[0], checked: false}]);
        });
    });
});
