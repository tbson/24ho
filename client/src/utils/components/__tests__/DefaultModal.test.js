import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {mount} from 'enzyme';
import DefaultModal from '../modal/DefaultModal';

Enzyme.configure({adapter: new Adapter()});

describe('DefaultModal', () => {
    let props = {
        open: false,
        close: jest.fn(),
        title: 'test',
        children: <div />
    };

    it('Hide', () => {
        const wrapper = mount(<DefaultModal {...props} />);
        expect(wrapper.find('.modal-inner').exists()).toEqual(false);
    });

    it('Open', () => {
        props.open = true;

        const wrapper = mount(<DefaultModal {...props} />);
        expect(wrapper.find('.modal-inner').exists()).toEqual(true);
        expect(wrapper.find('h4').text()).toEqual('test');
    });
});
