import { Alert } from "../components/alerts.js";
import { create_section_preview } from "../components/section.js";
import { logos } from "./constants.js";
import { FetchPromise } from "./utils.js";

const create_logo_image = (MountRoute, Type) => {
    const logo_node = document.createElement('div');
    logo_node.classList.add('dbinterface__logoimage');
    logo_node.style.backgroundImage = `url('${MountRoute}/${logos[Type.toUpperCase()]}')`;
    logo_node.style.backgroundSize = 'cover';
    logo_node.style.backgroundRepeat = 'no-repeat';

    return logo_node;
}

export const get_dbs_nodes = (MountRoute, dbs) => {
    const list_node = document.createElement('ul');
    list_node.id = 'databases-list';

    dbs.forEach((db, _) => {
        const list_element_node = document.createElement('li');
        list_element_node.setAttribute('data-code', db.Code);
        list_element_node.title = db.Name;
        const element_span = document.createElement('span');
        element_span.append(create_logo_image(MountRoute, db.Type), document.createTextNode(db.Name));
        list_element_node.append(element_span);
        list_node.append(list_element_node);
    });

    return list_node;
};

export const get_db_info_nodes = (MountRoute, Info) => {
    const ul = document.createElement('ul');
    ul.classList.add('info-list');
    Object.keys(Info).forEach((k, _i) => {
        const li = document.createElement('li');
    
        const SectionName = document.createElement('span');
        const SectionNameIcon = document.createElement('i');
        SectionNameIcon.classList.add('fa-solid', 'fa-square-plus');
        SectionName.append(SectionNameIcon, document.createTextNode(k));

        SectionName.addEventListener('click', e => {
            const icon = e.target.closest('span').querySelector('i');
            // const IsHidden = icon.classList.contains('fa-square-minus');
            
            const sub_list = e.target.closest('li').querySelectorAll('ul')[0];
            const IsHidden = sub_list.classList.contains('d-none');

            icon.classList.remove('fa-square-plus');
            icon.classList.remove('fa-square-minus');
            if(IsHidden) {
                icon.classList.add('fa-square-minus');
                sub_list.classList.add('d-none');
            }else {
                icon.classList.add('fa-square-plus');
                sub_list.classList.remove('d-none');
            }
        });

        const section_ul = document.createElement('ul');
        section_ul.classList.add('d-none');
        Info[k].forEach((Col, _j) => {
            const section_li = document.createElement('li');
            section_li.title = Col;
            section_li.setAttribute('data-key', k);
            section_li.setAttribute('data-value', Col);
            section_li.append(document.createTextNode(Col));

            section_li.addEventListener('dblclick', e => show_section_info(MountRoute, e.target.closest('li')));

            section_ul.append(section_li);
        });
        li.append(SectionName, section_ul);
        ul.append(li);
    });
    return ul;
};

const show_section_info = async (MountRoute, li) => {
    const Database = li.closest('[data-code]').getAttribute('data-code');
    const Section = li.getAttribute('data-key');
    const Data = li.getAttribute('data-value');

    const { code, message, Info } = await FetchPromise(MountRoute, { action: 'SHOWSECTIONINFO', fields: { Database, Section, Data } });
    if(code != 0) return Alert({ text: message });

    create_section_preview(Database, Data, Info, MountRoute);
};