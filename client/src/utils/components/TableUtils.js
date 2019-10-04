// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about hooks
import {Input, Button, Icon} from 'antd';
import Tools from 'src/utils/helpers/Tools';

const {Search} = Input;

type SearchInputPropTypes = {
    show?: boolean,
    onSearch: Function
};

export const SearchInput = ({show = true, onSearch}: SearchInputPropTypes) => {
    if (!show) return null;
    return (
        <div>
            <Search name="keyword" placeholder="Search..." onSearch={onSearch} />
        </div>
    );
};

type PaginationPropTypes = {
    next: ?string,
    prev: ?string,
    onNavigate: Function
};
export const Pagination = ({next, prev, onNavigate}: PaginationPropTypes) => {
    const renderPrev = (prev: ?string) => {
        if (!prev) return null;
        return (
            <Button type="primary" key={1} icon="left" onClick={() => onNavigate(prev)}>
                Trang trước
            </Button>
        );
    };

    const renderNext = (next: ?string) => {
        if (!next) return null;
        return [
            <Button type="primary" key={1} icon="right" onClick={() => onNavigate(next)}>
                Trang tiếp
            </Button>
        ];
    };

    return (
        <div>
            {renderPrev(prev)}
            {renderNext(next)}
        </div>
    );
};

type LangButtonsProps = {
    id: number,
    langs: Array<string>,
    getTranslationToEdit: Function
};
export const LangButtons = ({id, langs, getTranslationToEdit}: LangButtonsProps) => {
    if (!langs.length) return null;
    return (
        <span>
            {langs.map(lang => (
                <span key={lang}>
                    &nbsp;&nbsp;&nbsp;
                    <a className="pointer" onClick={() => getTranslationToEdit(id, lang)}>
                        {lang.toUpperCase()}
                    </a>
                </span>
            ))}
        </span>
    );
};

type BoolOutputType = {
    value: boolean
};
export const BoolOutput = ({value}: BoolOutputType) =>
    value ? <Icon type="check" className="green"/> : <Icon type="close" className="red"/>;

const styles = {
    footer: {
        backgroundColor: 'rgb(38, 38, 38)',
        padding: '5px 0',
        color: 'white',
        textAlign: 'center'
    }
};
