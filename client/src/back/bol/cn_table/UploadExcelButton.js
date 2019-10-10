// @flow
import * as React from 'react';
import {useRef} from 'react';
import {apiUrls} from '../_data';
import Tools from 'src/utils/helpers/Tools';
// $FlowFixMe: do not complain about importing
import {Button} from 'antd';

type Props = {
    onChange: Function
};

export default ({onChange}: Props) => {
    const fileInput = useRef<Element | null>(null);
    const onCLick = () => {
        // $FlowFixMe: do not complain about clicking
        fileInput.current.click();
    };

    const onFileChange = e => {
        const file = e.target.files[0];
        Tools.apiClient(apiUrls.markCnByUploading, {file}, 'POST')
            .then(resp => {
                onChange();
            })
            .catch(console.log);
    };

    return (
        <span>
            <Button type="primary" icon="file-excel" size="small" onClick={onCLick}>
                Upload excel
            </Button>
            <input type="file" className="hide" onChange={onFileChange} ref={fileInput} />
        </span>
    );
};
