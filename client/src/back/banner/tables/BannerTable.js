// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {apiUrls, defaultFormValues} from '../_data';
import type {FormValues, FormValuesWithCheck} from '../_data';
import type {GetListResponseData} from 'src/utils/helpers/Tools';
import BannerForm from '../forms/BannerForm';
import BannerTranslationForm from '../forms/BannerTranslationForm';
import DefaultModal from 'src/utils/components/DefaultModal';
import LoadingLabel from 'src/utils/components/LoadingLabel';
import {Pagination, SearchInput, LangButtons} from 'src/utils/components/TableUtils';
import Tools from 'src/utils/helpers/Tools';
import Trans from 'src/utils/helpers/Trans';

type Props = {
    match: Object,
    list?: Array<FormValuesWithCheck>
};
type States = {
    errorMessage: string,
    langs: Array<string>,
    lang: string,
    dataLoaded: boolean,
    modal: boolean,
    translationModal: boolean,
    list: Array<FormValuesWithCheck>,
    uuid: string,
    formValues: FormValues,
    formErrors: Object
};

export class BannerTable extends React.Component<Props, States> {
    static defaultProps = {};
    nextUrl: ?string;
    prevUrl: ?string;

    state = {
        errorMessage: '',
        langs: [],
        lang: Trans.getDefaultLang(),
        dataLoaded: false,
        modal: false,
        translationModal: false,
        list: [],
        uuid: '',
        formValues: defaultFormValues,
        formErrors: {}
    };

    constructor(props: Props) {
        super(props);
        const {categoryId: category} = this.props.match.params;
        const defaultParams = {category};
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

    handleSubmit = async (event: Object) => {
        event.preventDefault();
        const {categoryId: category} = this.props.match.params;
        const uuid = this.state;
        const params = {...Tools.formDataToObj(new FormData(event.target)), category, uuid};
        const isEdit = params.id ? true : false;
        let url = apiUrls.crud;
        if (isEdit) url += String(params.id);

        const {data, error} = await Tools.handleSubmit(url, params);
        const isSuccess = Tools.isEmpty(error);
        if (isSuccess) {
            this.onSubmitSuccess(isEdit, data);
        } else {
            this.onSubmitFail(error);
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

    onSubmitSuccess = (isEdit: boolean, data: FormValues) => {
        let {list} = this.state;
        const args = [list, data];
        if (isEdit) {
            list = Tools.updateListOnSuccessEditing(...args);
        } else {
            list = Tools.updateListOnSuccessAdding(...args);
        }
        this.setState({list});
        this.toggleModal('modal');
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

    render() {
        if (!this.state.dataLoaded) return <LoadingLabel errorMessage={this.state.errorMessage} />;
        const {list, langs} = this.state;
        const formValues = this.state.formValues ? this.state.formValues : defaultFormValues;
        const formErrors = this.state.formErrors ? this.state.formErrors : {};
        const modalTitle = formValues.id ? 'Update banner' : 'Add new banner';
        const translationModalTitle = `Update translation: ${this.state.lang.toUpperCase()}`;

        return (
            <div>
                <SearchInput onSearch={this.searchList} />
                <table className="table table-striped">
                    <thead className="thead-light">
                        <tr>
                            <th className="row25">
                                <span
                                    className="fas fa-check text-info pointer check-all-button"
                                    onClick={() => this.handleToggleCheckAll()}
                                />
                            </th>
                            <th scope="col">Title</th>
                            <th scope="col">Category</th>
                            <th scope="col">Order</th>
                            <th scope="col" style={{padding: 8}} className="row150">
                                <button
                                    className="btn btn-primary btn-sm btn-block add-button"
                                    onClick={() => this.toggleModal('modal', {}, {uid: Tools.uuid4()})}>
                                    <span className="fas fa-plus" />&nbsp; Add
                                </button>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {list.map((data, key) => (
                            <Row
                                className="table-row"
                                langs={langs}
                                data={data}
                                key={key}
                                toggleModal={this.toggleModal}
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
                                <Pagination
                                    next={this.nextUrl}
                                    prev={this.prevUrl}
                                    onNavigate={url => this.getList(url)}
                                />
                            </th>
                        </tr>
                    </tfoot>
                </table>

                <DefaultModal open={this.state.modal} title={modalTitle} handleClose={() => this.toggleModal('modal')}>
                    <BannerForm formValues={formValues} formErrors={formErrors} handleSubmit={this.handleSubmit}>
                        <button type="button" onClick={() => this.toggleModal('modal')} className="btn btn-light">
                            <span className="fas fa-trash-alt" />&nbsp; Cancel
                        </button>
                    </BannerForm>
                </DefaultModal>

                <DefaultModal
                    open={this.state.translationModal}
                    title={translationModalTitle}
                    handleClose={() => this.toggleModal('translationModal')}>
                    <BannerTranslationForm
                        formValues={formValues}
                        formErrors={formErrors}
                        handleSubmit={this.updateTranslation}>
                        <button
                            type="button"
                            onClick={() => this.toggleModal('translationModal')}
                            className="btn btn-light">
                            <span className="fas fa-times" />&nbsp; Cancel
                        </button>
                    </BannerTranslationForm>
                </DefaultModal>
            </div>
        );
    }
}
export default withRouter(BannerTable);

type RowPropTypes = {
    langs: Array<string>,
    data: FormValuesWithCheck,
    toggleModal: Function,
    handleRemove: Function,
    onCheck: Function
};
export class Row extends React.Component<RowPropTypes> {
    getItemToEdit = async (id: number) => {
        const result = await Tools.getItem(apiUrls.crud, id);
        if (result) {
            const {uuid} = result;
            this.props.toggleModal('modal', result, {uuid});
        }
    };

    getTranslationToEdit = async (id: number, lang: string) => {
        const result = await Tools.getItem(apiUrls.crud, id);
        if (result) {
            const {translations} = result;
            const translation = translations.find(item => item.lang == lang);
            this.props.toggleModal('translationModal', translation, {lang});
        }
    };

    render() {
        const {data, langs, toggleModal, handleRemove, onCheck} = this.props;
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
                <td className="title">{data.title}</td>
                <td className="category_title">{data.category_title}</td>
                <td className="order">{data.order}</td>
                <td className="center">
                    <a className="editBtn" onClick={() => this.getItemToEdit(parseInt(data.id))}>
                        <span className="fas fa-edit text-info pointer" />
                    </a>
                    <LangButtons langs={langs} getTranslationToEdit={this.getTranslationToEdit} id={data.id} />
                    <span>&nbsp;&nbsp;&nbsp;</span>
                    <a className="removeBtn" onClick={() => handleRemove(String(data.id))}>
                        <span className="fas fa-trash-alt text-danger pointer" />
                    </a>
                </td>
            </tr>
        );
    }
}
