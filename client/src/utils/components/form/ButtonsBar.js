// @flow
import * as React from 'react';

type Props = {
    children?: React.Node,
    submitTitle: string
};
export default ({children, submitTitle}: Props) => {
    return (
        <div className="row">
            <div className="col">{children}</div>
            <div className="col right">
                <button type="submit" className="btn btn-primary">
                    <span className="fas fa-check" />
                    &nbsp;
                    {submitTitle}
                </button>
            </div>
        </div>
    );
};
