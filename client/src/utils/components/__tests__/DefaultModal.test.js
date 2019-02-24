import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow, mount, render} from 'enzyme';
import DefaultModal from '../DefaultModal';

Enzyme.configure({adapter: new Adapter()});

describe('DefaultModal', () => {
    const formName = 'config';

    beforeEach(() => {
        jest.restoreAllMocks();
    });


    it('Hide', () => {
        const props = {
            open: false,
            title: 'test',
            handleClose: jest.fn(),
            children: <div/>,
        };
        const wrapper = shallow(<DefaultModal {...props} />);
        expect(wrapper.find('.modal-inner').exists()).toEqual(false);
    });

    it('Open', () => {
        const props = {
            open: true,
            title: 'test',
            handleClose: jest.fn(),
            children: <div/>,
        };
        const wrapper = shallow(<DefaultModal {...props} />).first().shallow();
        expect(wrapper.find('.modal-inner').exists()).toEqual(true);
        expect(wrapper.find('h4').text()).toEqual('test');
    });
});
