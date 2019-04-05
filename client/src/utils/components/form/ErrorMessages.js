// @flow
import * as React from 'react';

type Props = {
    errors: Array<string>,
    alert?: boolean
};
export default ({errors, alert = false}: Props) => {
    const errorItems = errors => errors.map((error, key) => <li key={key}>{error}</li>);
    const errorItem = error => <div>{error}</div>;
    return Array.isArray(errors) && errors.length ? (
        <div
            className={alert ? 'alert alert-danger' : 'invalid-feedback'}
            role="alert"
            style={{marginTop: alert ? 16 : 0}}>
            {errors.length === 1 ? errorItem(errors[0]) : <ul>{errorItems(errors)}</ul>}
        </div>
    ) : null;
};
