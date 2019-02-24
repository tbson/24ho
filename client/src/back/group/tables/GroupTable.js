/* @flow */
import * as React from 'react';
// $FlowFixMe: do not complain about importing node_modules
import {withRouter} from 'react-router-dom';
import {apiUrls, defaultFormValues} from '../_data';
import type {FormValues, FormValuesWithCheck} from '../_data';
import type {FormValues as PermissionType} from 'src/back/permission/_data';
import type {GetListResponseData} from 'src/utils/helpers/Tools';
import GroupForm from '../forms/GroupForm';
import LoadingLabel from 'src/utils/components/LoadingLabel';
import DefaultModal from 'src/utils/components/DefaultModal';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import Tools from 'src/utils/helpers/Tools';

type PermissionListType = {[string]: PermissionType};
type Props = {
    list?: Array<FormValuesWithCheck>
};
type States = {
    errorMessage: string,
    dataLoaded: boolean,
    modal: boolean,
    list: Array<FormValuesWithCheck>,
    permissionList: PermissionListType,
    formValues: FormValues,
    formErrors: Object
};

export class GroupTable extends React.Component<Props, States> {
    nextUrl: ?string;
    prevUrl: ?string;

    state = {
        errorMessage: '',
        dataLoaded: false,
        modal: false,
        list: [],
        permissionList: {},
        formValues: defaultFormValues,
        formErrors: {}
    };

    constructor(props: Props) {
        super(props);
    }

    async componentDidMount() {
        this.getList();
        const permissionListResponse = await Tools.apiCall(apiUrls.permissionCrud);
        if (!permissionListResponse.success) {
            this.setState({errorMessage: 'Can not load this page, please try it later.'});
        }
        const permissionList = this.parsePermissionList(permissionListResponse);
        if (permissionList) {
            this.setState({permissionList});
        }
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: States) {
        const {list} = nextProps;
        if (prevState.dataLoaded) return null;
        if (list) return {list, dataLoaded: true};
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

    toggleModal = (modalName: string, formValues: Object = {}, permissionList: ?PermissionListType = null) => {
        let state = {...Tools.toggleModal(this.state, modalName, formValues)};
        if (permissionList) {
            state = {...state, permissionList};
        }
        this.setState(state);
    };

    parsePermissionList = (response: Object): ?PermissionListType => {
        if (response.success) {
            let listItem = {};
            for (let item of response.data.items) {
                if (typeof listItem[item.content_type] == 'undefined') {
                    listItem[item.content_type] = [item];
                } else {
                    listItem[item.content_type].push(item);
                }
            }
            return listItem;
        }
        return null;
    };

    applyPermission = (userPermissionList: Array<number>, blankPermissionList: Object): Object => {
        for (let contentType in blankPermissionList) {
            let permissionGroup = blankPermissionList[contentType];
            for (let permission of permissionGroup) {
                if (userPermissionList.indexOf(permission.id) != -1) {
                    permission.checked = true;
                } else {
                    permission.checked = false;
                }
            }
        }
        return blankPermissionList;
    };

    getList = async (url: string = '', params: Object = {}) => {
        const result = await Tools.getList(url ? url : apiUrls.crud, params);
        if (result) {
            this.setInitData(result);
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

        const params = Tools.formDataToObj(new FormData(event.target));
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
        if (!this.state.dataLoaded) return <LoadingLabel errorMessage={this.state.errorMessage}/>;
        const {list, permissionList} = this.state;
        const formValues = this.state.formValues ? this.state.formValues : defaultFormValues;
        const formErrors = this.state.formErrors ? this.state.formErrors : {};
        const modalTitle = formValues.id ? 'Update group' : 'Add new group';
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
                            <th scope="col">Name</th>
                            <th scope="col" style={{padding: 8}} className="row80">
                                <button
                                    className="btn btn-primary btn-sm btn-block add-button"
                                    onClick={() => this.toggleModal('modal')}>
                                    <span className="fas fa-plus" />&nbsp; Add
                                </button>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {list.map((data, key) => (
                            <Row
                                className="table-row"
                                data={data}
                                key={key}
                                permissionList={permissionList}
                                applyPermission={this.applyPermission}
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
                                    onClick={() => this.handleRemove(Tools.getCheckedId(list))}
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
                    <GroupForm
                        formName="group"
                        permissionList={permissionList}
                        formValues={formValues}
                        formErrors={formErrors}
                        handleSubmit={this.handleSubmit}>
                        <button type="button" onClick={() => this.toggleModal('modal')} className="btn btn-light">
                            <span className="fas fa-times" />&nbsp; Cancel
                        </button>
                    </GroupForm>
                </DefaultModal>
            </div>
        );
    }
}
export default withRouter(GroupTable);

type RowPropTypes = {
    data: FormValuesWithCheck,
    permissionList: {[string]: PermissionType},
    applyPermission: Function,
    toggleModal: Function,
    handleRemove: Function,
    onCheck: Function
};

export class Row extends React.Component<RowPropTypes> {
    getItemToEdit = async (id: number) => {
        const result = await Tools.getItem(apiUrls.crud, id);
        if (result) {
            result.permissions = result.permissions || '';
            const permissionList = this.props.applyPermission(
                result.permissions.split(',').map(item => parseInt(item)),
                this.props.permissionList
            );
            this.props.toggleModal('modal', result, permissionList);
        }
    };

    render() {
        const {data, toggleModal, handleRemove, onCheck} = this.props;
        return (
            <tr>
                <th className="row25">
                    <input id={data.id} className="check" type="checkbox" checked={data.checked} onChange={onCheck} />
                </th>
                <td className="name">{data.name}</td>
                <td className="center">
                    <a className="editBtn" onClick={() => this.getItemToEdit(parseInt(data.id))}>
                        <span className="editBtn fas fa-edit text-info pointer" />
                    </a>
                    <span>&nbsp;&nbsp;&nbsp;</span>
                    <a className="removeBtn" onClick={() => handleRemove(String(data.id))}>
                        <span className="fas fa-trash-alt text-danger pointer" />
                    </a>
                </td>
            </tr>
        );
    }
}
