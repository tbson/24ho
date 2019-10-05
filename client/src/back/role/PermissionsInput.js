// @flow
import * as React from 'react';
import {useState} from 'react';
// $FlowFixMe: do not complain about hooks
import {Field, ErrorMessage} from 'formik';
// $FlowFixMe: do not complain about hooks
import {Checkbox, Button, Row, Col, Divider} from 'antd';
import {pemGroupTrans, excludeGroups} from './_data';

export class Service {
    static updateValue(pems: Array<number>, updateObj: Object): Array<number> {
        const addArr = Object.entries(updateObj)
            .filter(([_, value]) => value === true)
            .map(([key, _]) => parseInt(key));
        const removeArr = Object.entries(updateObj)
            .filter(([_, value]) => value === false)
            .map(([key, _]) => parseInt(key));
        let result = pems.concat(addArr);
        result = new Set(result.filter(pem => !removeArr.includes(pem)));
        return [...result];
    }

    static getAllPermissions(grouped_permissions: Object, permission_group: string): Array<number> {
        return Object.entries(grouped_permissions)
            .filter(([groupName, _]) => (!permission_group ? true : groupName === permission_group))
            .reduce((result, [_, pems]) => result.concat(pems.map(pem => pem.id)), []);
    }
}

type Props = {
    name: string,
    permissions: Array<number>,
    grouped_permissions: Object
};

export default ({name, permissions: _permissions, grouped_permissions}: Props) => {
    const [permissions, setPermissions] = useState(_permissions);

    const onChange = (setFieldValue, permissions) => updateObj => {
        const newValue = Service.updateValue(permissions, updateObj);
        setPermissions(newValue);
        setFieldValue(newValue);
    };

    const togglePermissions = (setFieldValue, permission_group) => () => {
        const allPermissions = Service.getAllPermissions(grouped_permissions, permission_group || '');
        let newPermissions = [];
        if (permissions.filter(pem => allPermissions.includes(pem)).length) {
            newPermissions = permissions.filter(pem => !allPermissions.includes(pem));
        } else {
            newPermissions = new Set(permissions.concat(allPermissions));
        }
        newPermissions = [...newPermissions];
        setPermissions(newPermissions);
        setFieldValue(newPermissions);
    };

    return (
        <div>
            <Field name={name}>
                {({form}) => {
                    const setFieldValue = value => form.setFieldValue(name, value);
                    return (
                        <div>
                            <div className="pointer no-select" onClick={togglePermissions(setFieldValue)}>
                                <Button icon="check">Tất cả quyền</Button>
                                <Divider />
                            </div>
                            {Object.entries(grouped_permissions)
                                .filter(([groupName, _]) => !excludeGroups.includes(groupName))
                                .map(([groupName, pems]) => (
                                    <PermGroup
                                        key={groupName}
                                        groupName={pemGroupTrans[groupName]}
                                        pemValues={permissions}
                                        pems={pems}
                                        togglePermissions={togglePermissions(setFieldValue, groupName)}
                                        onChange={onChange(setFieldValue, permissions)}
                                    />
                                ))}
                        </div>
                    );
                }}
            </Field>
            <ErrorMessage name={name} className="red" component="div" />
        </div>
    );
};

type PemItem = {
    id: number,
    title: string
};
type PemGroupProps = {
    groupName: string,
    pems: Array<PemItem>,
    pemValues: Array<number>,
    togglePermissions: Function,
    onChange: Function
};
const PermGroup = ({groupName, pems, pemValues, togglePermissions, onChange}: PemGroupProps) => {
    return (
        <div>
            <div className="pointer no-select" onClick={togglePermissions} style={{marginBottom: 15}}>
                <Button size="small" icon="check">
                    {groupName}
                </Button>
            </div>
            <Row>
                {pems.map(pem => {
                    const checked = pemValues.includes(pem.id);
                    return <Pem key={pem.id} id={pem.id} title={pem.title} checked={checked} onChange={onChange} />;
                })}
            </Row>
            <Divider dashed />
        </div>
    );
};
type PemProps = {
    id: number,
    title: string,
    checked: boolean,
    onChange: Function
};
const Pem = ({id, title, checked, onChange}: PemProps) => {
    const handeChange = id => e => {
        onChange({[id]: !!e.target.checked});
    };

    return (
        <Col span={6}>
            <Checkbox checked={checked} onChange={handeChange(id)}>
                {title}
            </Checkbox>
        </Col>
    );
};
