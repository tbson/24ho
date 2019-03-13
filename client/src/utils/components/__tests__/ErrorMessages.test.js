import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {shallow} from 'enzyme';
import ErrorMessages from '../form/ErrorMessages';

Enzyme.configure({adapter: new Adapter()});

describe('ErrorMessages component', () => {
    describe('empty error', () => {

        it('null', () => {
            const errors = null;
            const wrapper = shallow(<ErrorMessages errors={errors} />);
            expect(wrapper.getElement()).toBe(null);
        });

        it('undefined', () => {
            const errors = undefined;
            const wrapper = shallow(<ErrorMessages errors={errors} />);
            expect(wrapper.getElement()).toBe(null);
        });

        it('empty string', () => {
            const errors = '';
            const wrapper = shallow(<ErrorMessages errors={errors} />);
            expect(wrapper.getElement()).toBe(null);
        });

        it('empty array', () => {
            const errors = [];
            const wrapper = shallow(<ErrorMessages errors={errors} />);
            expect(wrapper.getElement()).toBe(null);
        });
    });

    it('single error', () => {
        const errors = ['error'];
        const wrapper = shallow(<ErrorMessages errors={errors} />);
        expect(wrapper.contains(<div>error</div>)).toBe(true);
    });

    it('multiple errors', () => {
        const errors = ['error 1', 'error 2'];
        const wrapper = shallow(<ErrorMessages errors={errors} />);
        expect(
            wrapper.contains(
                <ul>
                    <li>error 1</li>
                    <li>error 2</li>
                </ul>
            )
        ).toBe(true);
    });
});
