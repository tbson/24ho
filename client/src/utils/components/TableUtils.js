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
        <div className="input-group mb-3">
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
            <Button type="primary" key={1} onClick={() => onNavigate(next)}>
                Trang tiếp
                <Icon type="right"/>
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

type FrontPaginationPropTypes = {
    next: ?string,
    prev: ?string,
    onNavigate: Function
};
export const FrontPagination = ({next, prev, onNavigate}: FrontPaginationPropTypes) => {
    const renderPrev = (prev: ?string) => {
        if (!prev) return null;
        return (
            <a className="pointer" onClick={() => onNavigate(prev)}>
                <span className="fas fa-chevron-up pointer" />
            </a>
        );
    };

    const renderNext = (next: ?string) => {
        if (!next) return null;
        return (
            <a className="pointer" onClick={() => onNavigate(next)}>
                <span className="fas fa-chevron-down" />
            </a>
        );
    };

    if (!prev && !next) return null;
    return (
        <div className="container-fluid">
            <div className="row" style={styles.footer}>
                <div className="col-xl-12">
                    {renderPrev(prev)}
                    {renderNext(next)}
                </div>
            </div>
        </div>
    );
};

type CancelButtonType = {
    onClick: Function,
    label?: string
};
export const CancelButton = ({onClick, label = 'Cancel'}: CancelButtonType) => {
    return (
        <button type="button" className="btn btn-light" onClick={onClick}>
            <span className="fas fa-times" />
            &nbsp; {label}
        </button>
    );
};

type SubmitButtonType = {
    label?: string
};
export const SubmitButton = ({label = 'Submit'}: SubmitButtonType) => {
    return (
        <button className="btn btn-success">
            <span className="fas fa-check" />
            &nbsp; {label}
        </button>
    );
};

type BoolOutputType = {
    value: boolean
};
export const BoolOutput = ({value}: BoolOutputType) =>
    value ? <span className="green fas fa-check" /> : <span className="red fas fa-times" />;

const styles = {
    footer: {
        backgroundColor: 'rgb(38, 38, 38)',
        padding: '5px 0',
        color: 'white',
        textAlign: 'center'
    }
};
