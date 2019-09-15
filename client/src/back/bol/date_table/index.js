// @flow
import * as React from 'react';
import {useState, useEffect} from 'react';
import Tools from 'src/utils/helpers/Tools';
import ListTools from 'src/utils/helpers/ListTools';
import {apiUrls} from '../_data';
import {Pagination, SearchInput} from 'src/utils/components/TableUtils';
import MainTable from 'src/back/bag/main_table/';

import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel
    // $FlowFixMe: do not complain about importing node_modules
} from 'react-accessible-accordion';
// $FlowFixMe: do not complain about importing node_modules
import 'react-accessible-accordion/dist/fancy-example.css';

type Props = {};

export class Service {
    static listRequest(url?: string, params?: Object): Promise<Object> {
        return Tools.apiCall(url ? url : apiUrls.get_date, params);
    }

    static handleGetList(url?: string, params?: Object = {}): Promise<Object> {
        return Service.listRequest(url, params)
            .then(resp => (resp.ok ? resp.data || {} : Promise.reject(resp)))
            .catch(Tools.popMessageOrRedirect);
    }
}

export default ({}: Props) => {
    const [list, setList] = useState([]);
    const [links, setLinks] = useState({next: '', previous: ''});

    const getList = async (url?: string, params?: Object) => {
        const data = await Service.handleGetList(url);
        if (!data) return;
        setList(ListTools.prepare(data.items));
        setLinks(data.links);
    };

    useEffect(() => {
        getList();
    }, []);

    return (
        <div>
            <Accordion allowZeroExpanded={true}>
                {list.map(item => (
                    <AccordionItem key={item.id}>
                        <AccordionItemHeading>
                            <AccordionItemButton>{item.date}</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <MainTable bol_date={item.id} readonly={true}/>
                        </AccordionItemPanel>
                    </AccordionItem>
                ))}
            </Accordion>
            <div className="right">
                <Pagination next={links.next} prev={links.previous} onNavigate={getList} />
            </div>
        </div>
    );
};
