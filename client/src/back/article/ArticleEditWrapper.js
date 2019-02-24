// @flow
import * as React from 'react';
import NavWrapper from 'src/utils/components/NavWrapper';
import ArticleEdit from './ArticleEdit';
import Tools from 'src/utils/helpers/Tools';

type Props = {
    parent: Object,
    id: number
};

type States = {};

export default class ArticleEditWrapper extends React.Component<Props, States> {
    state = {};

    render() {
        const {parent, id} = this.props;
        const index = id || Tools.uuid4();
        return (
            <NavWrapper>
                <ArticleEdit parent={parent} id={id} key={index}/>
            </NavWrapper>
        )
    }
}
