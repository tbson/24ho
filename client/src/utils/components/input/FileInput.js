// @flow
import * as React from 'react';
import {useState} from 'react';
import Tools from 'src/utils/helpers/Tools';
import defaultAvatar from 'src/assets/images/default-avatar.svg';

type Props = {
    id: string,
    label: string,
    value: ?string,
    placeholder?: string,
    errMsg?: Array<string>,
    disabled?: boolean,
    onChange?: Function
};

type States = {
    fileName?: string,
    fileContent?: string
};
export default ({id, label, value, placeholder, errMsg = [], disabled = false, onChange}: Props) => {
    const [fileName, setFileName] = useState('');
    const [fileContent, setFileContent] = useState('');

    const name = id.split('-').pop();
    const className = `form-control ${errMsg.length ? 'is-invalid' : ''}`.trim();
    let _fileName = fileName || Tools.getFileName(value || '');
    let _fileContent = fileContent || value || '';

    const _onChange = (event: Object) => {
        const _fileName = Tools.getFileName(event.target.value);

        // $FlowFixMe: This one never be null
        const file = document.querySelector(`input[name=${name}]`).files[0];

        const reader = new FileReader();
        reader.addEventListener(
            'load',
            () => {
                const _fileContent = reader.result;
                setFileName(_fileName);
                // $FlowFixMe: fileContent is string
                setFileContent(_fileContent);
            },
            false
        );
        reader.readAsDataURL(file);
    };

    return (
        <div className={`form-group ${name}-field`}>
            <label htmlFor={name}>{label}</label>
            <Preview fileContent={fileContent || _fileContent} />
            <div className="custom-file">
                <input type="file" className={className} name={name} id={name} onChange={_onChange} />
                <label className="custom-file-label" htmlFor={name}>
                    {fileName || placeholder}
                </label>
                <div className="invalid-feedback">{errMsg}</div>
            </div>
        </div>
    );
};

type previewProps = {
    fileContent?: string
};
const Preview = ({fileContent}: previewProps) => {
    const url = Tools.ensureImage(fileContent || '');
    return <img src={fileContent || defaultAvatar} width="100%" />;
};
