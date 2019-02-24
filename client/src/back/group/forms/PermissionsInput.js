// @flow
import * as React from 'react';

type Props = {
    options: Object,
    name: string,
    defaultValue: string
};

type States = {
    value: string,
    options: Object
};

class PermissionsInput extends React.Component<Props, States> {
    state = {
        options: this.props.options,
        value: ''
    };
    static defaultProps = {
        options: [],
        defaultValue: ''
    };

    constructor(props: Props) {
        super(props);
    }

    handleChange = (value: boolean, item: Object) => {
        let result = [];
        item.checked = value;
        this.setState({options: this.state.options}, () => {
            for (let contentType in this.state.options) {
                let permissionGroup = this.state.options[contentType];
                for (let permission of permissionGroup) {
                    if (permission.checked) {
                        result.push(permission.id);
                    }
                }
            }
            this.setState({value: result.join(',')});
        });
    };

    fullChecked = (toggleContentType: string, blankPermissionList: Object): boolean => {
        let fullChecked = true;
        for (let contentType in blankPermissionList) {
            if (!toggleContentType || contentType === toggleContentType) {
                let permissionGroup = blankPermissionList[contentType];
                for (let permission of permissionGroup) {
                    if (!permission.checked) {
                        fullChecked = false;
                        break;
                    }
                }
            }
        }
        return fullChecked;
    };

    togglePermission = (toggleContentType: string, blankPermissionList: Object): string => {
        let resultArr = [];
        let result = '';
        const fullChecked = this.fullChecked(toggleContentType, blankPermissionList);
        for (let contentType in blankPermissionList) {
            let permissionGroup = blankPermissionList[contentType];
            for (let permission of permissionGroup) {
                if (!toggleContentType || contentType === toggleContentType) {
                    if (!fullChecked) {
                        permission.checked = true;
                        resultArr.push(permission.id);
                    } else {
                        permission.checked = false;
                    }
                } else {
                    if (permission.checked) {
                        resultArr.push(permission.id);
                    }
                }
            }
        }
        result = resultArr.join(',');
        this.setState({
            value: result
        });
        return result;
    };

    renderContent = (options: Object) => {
        const result = [];
        for (let key in options) {
            const permissions = options[key];
            result.push(
                <div key={key}>
                    <div className="row green">
                        <strong className="pointer no-select" onClick={() => this.togglePermission(key, options)}>
                            <span className="fas fa-check" /> {key}
                        </strong>
                    </div>
                    <div className="row">
                        {permissions.map(item => (
                            <div className="form-check col-md-6" key={item.id}>
                                <input
                                    id={item.codename}
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={item.checked}
                                    onChange={event => this.handleChange(event.target.checked, item)}
                                />
                                <label className="form-check-label no-select" htmlFor={item.codename}>
                                    {item.name}
                                </label>
                            </div>
                        ))}
                    </div>
                    <hr />
                </div>
            );
        }
        return result;
    };

    render() {
        const {options} = this.state;
        return (
            <div className="container">
                <input type="hidden" name={this.props.name} defaultValue={this.state.value} />
                <div className="row">
                    <strong className="green pointer no-select" onClick={() => this.togglePermission('', options)}>
                        <span className="fas fa-check" />&nbsp; Toggle ALL permissions
                    </strong>
                </div>
                <hr />
                {this.renderContent(options)}
            </div>
        );
    }
}

const styles = {};
export default PermissionsInput;
