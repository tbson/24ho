/* @flow */
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter, Link} from 'react-router-dom';
import {apiUrls, defaultFormValues} from '../_data';
import type {FormValues, FormValuesWithCheck, ParentType} from '../_data';
import type {GetListResponseData} from 'src/utils/helpers/Tools';
import ArticleForm from '../forms/ArticleForm';
import ArticleTranslationForm from '../forms/ArticleTranslationForm';
import DefaultModal from 'src/utils/components/DefaultModal';
import LoadingLabel from 'src/utils/components/LoadingLabel';
import {Pagination, SearchInput, LangButtons} from 'src/utils/components/TableUtils';
import Tools from 'src/utils/helpers/Tools';
import Trans from 'src/utils/helpers/Trans';

type Props = {
    parent: ParentType,
    searchForm: boolean,
    list?: Array<FormValuesWithCheck>
};
type States = {
    errorMessage: string,
    langs: Array<string>,
    lang: string,
    uuid: string,
    translationModal: boolean,
    dataLoaded: boolean,
    modal: boolean,
    list: Array<FormValuesWithCheck>,
    formValues: FormValues,
    formErrors: Object
};

export class ArticleTable extends React.Component<Props, States> {
    static defaultProps = {
        searchForm: true
    };

    nextUrl: ?string;
    prevUrl: ?string;

    state = {
        errorMessage: '',
        langs: [],
        lang: Trans.getDefaultLang(),
        uuid: '',
        translationModal: false,
        dataLoaded: false,
        modal: false,
        list: [],
        formValues: defaultFormValues,
        formErrors: {}
    };

    constructor(props: Props) {
        super(props);
        const {parent} = this.props;
        const defaultParams = {
            [parent.type]: parent.id
        };
        this.getList = this.getList.bind(this, undefined, undefined, defaultParams);
    }

    componentDidMount() {
        this.getList();
        const langs = Trans.getLangs();
        this.setState({langs});
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: States) {
        const {list} = nextProps;
        const dataLoaded = true;
        if (prevState.dataLoaded) return null;
        if (list) return {list, dataLoaded};
        return null;
    }

    setInitData = (initData: GetListResponseData) => {
        this.nextUrl = initData.links.next;
        this.prevUrl = initData.links.previous;
        const list = initData.items.map(item => {
            item.checked = false;
            return item;
        });
        this.setState({
            dataLoaded: true,
            list
        });
    };

    toggleModal = (modalName: string, formValues: Object = {}, extra?: Object) => {
        let state = {...Tools.toggleModal(this.state, modalName, formValues)};
        if (extra) {
            state = {...state, ...extra};
        }
        this.setState(state);
    };

    getList = async (url: string = '', params: Object = {}, defaultParams: Object = {}) => {
        try {
            params = {...params, ...defaultParams};
            const result = await Tools.getList(url ? url : apiUrls.crud, params);
            if (result) {
                this.setInitData(result);
            }
        } catch (error) {
            this.setState({errorMessage: error.detail});
        }
    };

    searchList = async (event: Object) => {
        event.preventDefault();
        const {search} = Tools.formDataToObj(new FormData(event.target));
        if (search.length > 2) {
            await this.getList('', {search});
        } else if (!search.length) {
            await this.getList();
        }
    };

    updateTranslation = async (event: Object) => {
        event.preventDefault();
        const params = Tools.formDataToObj(new FormData(event.target));
        const isEdit = params.id ? true : false;
        let url = apiUrls.crud + 'translation/';
        if (isEdit) url += String(params.id);

        const {data, error} = await Tools.handleSubmit(url, params);
        const isSuccess = Tools.isEmpty(error);
        if (isSuccess) {
            this.toggleModal('translationModal');
        } else {
            this.onSubmitFail(error);
        }
    };

    onSubmitFail = (formErrors: Object) => {
        this.setState({formErrors});
    };

    handleRemove = async (ids: string) => {
        let {list} = this.state;
        const url = apiUrls.crud;
        const deletedIds = await Tools.handleRemove(url, ids);
        if (deletedIds && deletedIds.length) {
            list = list.filter(item => !deletedIds.includes(item.id));
            this.setState({list});
        }
    };

    handleCheck = (event: Object) => {
        const {list} = this.state;
        const {id, checked} = event.target;
        const index = list.findIndex(item => item.id === parseInt(id));
        list[index].checked = checked;
        this.setState({list});
    };

    handleToggleCheckAll = () => {
        let {list} = this.state;
        list = Tools.checkOrUncheckAll(list);
        this.setState({list});
    };

    renderSearchForm = () => {
        const {searchForm} = this.props;
        if (!searchForm) return null;
        return <SearchInput onSearch={this.searchList} />;
    };

    render() {
        const {dataLoaded, list, langs, uuid} = this.state;
        const {parent} = this.props;
        const formValues = this.state.formValues ? this.state.formValues : defaultFormValues;
        const formErrors = this.state.formErrors ? this.state.formErrors : {};
        const translationModalTitle = `Update translation: ${this.state.lang.toUpperCase()}`;
        if (!dataLoaded || !parent.id) return <LoadingLabel errorMessage={this.state.errorMessage}/>;
        return (
            <div>
                {this.renderSearchForm()}
                <table className="table table-striped">
                    <thead className="thead-light">
                        <tr>
                            <th className="row25">
                                <span
                                    className="fas fa-check text-info pointer check-all-button"
                                    onClick={() => this.handleToggleCheckAll()}
                                />
                            </th>
                            <th scope="col">Article Title</th>
                            <th scope="col">Category</th>
                            <th scope="col">Slide</th>
                            <th scope="col">Pin</th>
                            <th scope="col">Order</th>
                            <th scope="col" style={{padding: 8}} className="row150">
                                <Link
                                    className="btn btn-primary btn-sm btn-block add-button"
                                    to={`/article/${parent.type}/${parent.id}/`}>
                                    <span className="fas fa-plus" />&nbsp; Add
                                </Link>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {list.map((data, key) => (
                            <Row
                                className="table-row"
                                langs={langs}
                                toggleModal={this.toggleModal}
                                parent={parent}
                                data={data}
                                key={key}
                                handleRemove={this.handleRemove}
                                onCheck={this.handleCheck}
                            />
                        ))}
                    </tbody>

                    <tfoot className="thead-light">
                        <tr>
                            <th className="row25">
                                <span
                                    className="fas fa-trash-alt text-danger pointer bulk-remove-button"
                                    onClick={() => this.handleRemove(Tools.getCheckedId(this.state.list))}
                                />
                            </th>
                            <th className="row25 right" colSpan="99">
                                <Pagination next={this.nextUrl} prev={this.prevUrl} onNavigate={this.getList} />
                            </th>
                        </tr>
                    </tfoot>
                </table>

                <DefaultModal
                    open={this.state.translationModal}
                    title={translationModalTitle}
                    handleClose={() => this.toggleModal('translationModal')}>
                    <ArticleTranslationForm
                        parentUUID={uuid}
                        formValues={formValues}
                        formErrors={formErrors}
                        handleSubmit={this.updateTranslation}>
                        <button
                            type="button"
                            onClick={() => this.toggleModal('translationModal')}
                            className="btn btn-warning">
                            <span className="fas fa-times" />&nbsp; Cancel
                        </button>
                    </ArticleTranslationForm>
                </DefaultModal>
            </div>
        );
    }
}
export default withRouter(ArticleTable);

type RowPropTypes = {
    langs: Array<string>,
    data: FormValuesWithCheck,
    toggleModal: Function,
    parent: ParentType,
    handleRemove: Function,
    onCheck: Function
};
export class Row extends React.Component<RowPropTypes> {
    getTranslationToEdit = async (id: number, lang: string) => {
        const result = await Tools.getItem(apiUrls.crud, id);
        if (result) {
            const {translations, uuid} = result;
            const translation = translations.find(item => item.lang == lang);
            this.props.toggleModal('translationModal', translation, {lang, uuid});
        }
    };

    constructor(props: RowPropTypes) {
        super(props);
    }

    render() {
        const {data, langs, parent} = this.props;
        const id = data.id ? data.id : '';
        if (!parent.id) return null;
        return (
            <tr>
                <th className="row25">
                    <input
                        className="check"
                        type="checkbox"
                        checked={data.checked}
                        onChange={event => this.props.onCheck(data, event)}
                    />
                </th>
                <td className="title">
                    <Link to={`/article/${parent.type}/${parent.id}/${id}`}>{data.title}</Link>
                </td>
                <td className="category_title">{data.category_title}</td>
                <td className="use_slide">
                    {data.use_slide ? <span className="fas fa-check green" /> : <span className="fas fa-times red" />}
                </td>
                <td className="pin">
                    {data.pin ? <span className="fas fa-check green" /> : <span className="fas fa-times red" />}
                </td>
                <td className="order">{data.order}</td>
                <td className="center">
                    <Link className="editBtn" to={`/article/${parent.type}/${parent.id}/${id}`}>
                        <span className="fas fa-edit text-info pointer" />
                    </Link>
                    <LangButtons langs={langs} getTranslationToEdit={this.getTranslationToEdit} id={Number(id)} />
                    <span>&nbsp;&nbsp;&nbsp;</span>
                    <a className="removeBtn" onClick={() => this.props.handleRemove(String(data.id))}>
                        <span className="fas fa-trash-alt text-danger pointer" />
                    </a>
                </td>
            </tr>
        );
    }
}
