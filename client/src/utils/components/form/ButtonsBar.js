// @flow
import * as React from 'react';
// $FlowFixMe: do not complain about formik
import { Button } from 'antd';

type Props = {
    children?: React.Node,
    submitTitle: string,
    onClick?: Function
};
export default ({children, submitTitle, onClick}: Props) => {
    return (
        <div className="row">
            <div className="col">{children}</div>
            <div className="col right">
                <button type="submit" style={{display: 'none'}} />
                <Button htmlType={onClick ? 'button' : 'submit'} type="primary" icon="check" onClick={onClick}>
                    {submitTitle}
                </Button>
            </div>
        </div>
    );
};
