import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import 'src/__mocks__/FormData';
import ConfigTable from '../tables/ConfigTable';
import {seeding, defaultFormValues} from '../_data';
import LoadingLabel from 'src/utils/components/LoadingLabel';
import Tools from 'src/utils/helpers/Tools';

Enzyme.configure({adapter: new Adapter()});

describe('ConfigTable component', () => {
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
        const wrapper = shallow(<ConfigTable />);
        const instance = wrapper.instance();

        jest.spyOn(instance, 'setInitData');

        // Data not loaded -> show waiting
        expect(wrapper.contains(<LoadingLabel />)).toEqual(true);

        setTimeout(() => {
            // After loading data done
            wrapper.update();
            expect(wrapper.find('.table-row')).toHaveLength(10);

            expect(instance.setInitData).toHaveBeenCalled();
            done();
        }, 100);
    });

    it('Check all', () => {
        const wrapper = shallow(<ConfigTable list={seeding(10)} />);
        const instance = wrapper.instance();

        jest.spyOn(instance, 'handleToggleCheckAll');

        wrapper
            .find('.check-all-button')
            .first()
            .simulate('click');

        expect(instance.handleToggleCheckAll).toHaveBeenCalled();
    });

    it('Add', () => {
        const wrapper = shallow(<ConfigTable list={seeding(10)} />);
        const instance = wrapper.instance();

        jest.spyOn(instance, 'toggleModal');

        wrapper
            .find('.add-button')
            .first()
            .simulate('click');

        expect(instance.toggleModal).toHaveBeenCalled();
        expect(instance.toggleModal.mock.calls[0][0]).toEqual('modal');
    });

    describe('Bulk remove', () => {
        beforeEach(() => {
            jest.restoreAllMocks();
        });

        it('No check', () => {
            const wrapper = shallow(<ConfigTable list={seeding(10)} />);
            const instance = wrapper.instance();
            jest.spyOn(instance, 'handleRemove').mockImplementation(() => null);

            wrapper
                .find('.bulk-remove-button')
                .first()
                .simulate('click');

            expect(instance.handleRemove).toHaveBeenCalled();
            expect(instance.handleRemove.mock.calls[0][0]).toEqual('');
        });

        it('Check all', () => {
            const wrapper = shallow(<ConfigTable list={seeding(10)} />);
            const instance = wrapper.instance();

            jest.spyOn(instance, 'handleRemove').mockImplementation(() => null);

            wrapper
                .find('.check-all-button')
                .first()
                .simulate('click');

            wrapper
                .find('.bulk-remove-button')
                .first()
                .simulate('click');

            expect(instance.handleRemove).toHaveBeenCalled();
            expect(instance.handleRemove.mock.calls[0][0]).toEqual('1,2,3,4,5,6,7,8,9,10');
        });
    });
});

describe('ConfigTable methods', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    describe('toggleModal', () => {
        let wrapper, instance;
        beforeEach(() => {
            wrapper = shallow(<ConfigTable list={seeding(10)} />);
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
            jest.spyOn(Tools, 'getList').mockImplementation(async () => null);

            // Init component
            const wrapper = shallow(<ConfigTable list={seeding(10)}/>);
            const instance = wrapper.instance();

            // Spy setInitData function
            jest.spyOn(instance, 'setInitData');

            // Execute
            await wrapper.instance().getList();

            // setInitData will call after ConfigTable mount
            expect(Tools.getList.mock.calls[0][0]).toEqual('http://localhost/api/v1/config/');
            expect(Tools.getList.mock.calls[0][1]).toEqual({});
            expect(instance.setInitData).not.toHaveBeenCalled();
        });

        it('success', async () => {
            const response = {
                links: {next: 'nextUrl', previous: 'prevUrl'},
                items: seeding(10)
            };

            jest.spyOn(Tools, 'getList').mockImplementation(async () => response);

            // Init component
            const wrapper = shallow(<ConfigTable list={seeding(10)}/>);
            const instance = wrapper.instance();

            // Spy setInitData function
            jest.spyOn(instance, 'setInitData');

            // Execute
            await wrapper.instance().getList();

            // setInitData will call after ConfigTable mount
            expect(Tools.getList.mock.calls[0][0]).toEqual('http://localhost/api/v1/config/');
            expect(Tools.getList.mock.calls[0][1]).toEqual({});
            expect(instance.setInitData).toHaveBeenCalled();
            expect(instance.setInitData.mock.calls[0][0]).toEqual(response);
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
            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => data);

            // Init component
            const wrapper = shallow(<ConfigTable list={seeding(10)}/>);
            const instance = wrapper.instance();
            jest.spyOn(instance, 'getList').mockImplementation(() => {});

            // Execute tested method
            await instance.searchList(event);

            // Checking result
            expect(instance.getList).toHaveBeenCalled();
            expect(instance.getList.mock.calls[0][0]).toBe(undefined);
        });
        it('2 character', async () => {
            const data = {search: 'ab'};

            // Spy/mock static methods
            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => data);

            // Init component
            const wrapper = shallow(<ConfigTable list={seeding(10)}/>);
            const instance = wrapper.instance();
            jest.spyOn(instance, 'getList').mockImplementation(() => {});

            // Execute tested method
            await instance.searchList(event);

            // Checking result
            expect(instance.getList).not.toHaveBeenCalled();
        });
        it('3 characters', async () => {
            const data = {search: 'abc'};

            // Spy/mock static methods
            jest.spyOn(Tools, 'formDataToObj').mockImplementation(() => data);

            // Init component
            const wrapper = shallow(<ConfigTable list={seeding(10)}/>);
            const instance = wrapper.instance();
            jest.spyOn(instance, 'getList').mockImplementation(() => {});

            // Execute tested method
            await instance.searchList(event);

            // Checking result
            expect(instance.getList).toHaveBeenCalled();
            expect(instance.getList.mock.calls[0][0]).toEqual('');
            expect(instance.getList.mock.calls[0][1]).toEqual(data);
        });
    });

    describe('handleChange', () => {
        let wrapper;
        let instance;
        beforeEach(() => {
            const list = seeding(3);
            wrapper = shallow(<ConfigTable list={list} />);
            instance = wrapper.instance();
        });

        it('Adding', async () => {
            const isEdit = false;
            const data = seeding(4, true);
            const list = seeding(3);
            instance.handleChange(isEdit, data);
            expect(wrapper.state('list')).toEqual([data, ...list]);
        });

        it('Editing', async () => {
            const isEdit = true;
            const data = {...seeding(4, true), id: seeding(2, true).id};
            const list = seeding(3);
            list[1] = data;
            instance.handleChange(isEdit, data);
            expect(wrapper.state('list')).toEqual([...list]);
        });
    });

    describe('handleRemove', () => {
        let wrapper;
        let instance;
        beforeEach(() => {
            const list = seeding(5);
            wrapper = shallow(<ConfigTable list={list} />);
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
            wrapper = shallow(<ConfigTable list={list} />);
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
