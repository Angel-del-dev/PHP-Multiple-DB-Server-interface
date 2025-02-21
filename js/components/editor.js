import { keys } from "../lib/constants.js";
import { useState } from "../lib/hooks.js";
import { FetchPromise, makeid } from "../lib/utils.js";
import { Alert } from "./alerts.js";
import { create_contextmenu } from "./contextmenu.js";
import { invoke_database_creation, invoke_drop_database } from "./db.js";
import { create_grid } from "./grid.js";

const [ getActiveDatabase, setActiveDatabase ] = useState(null);
const UNIQID_SIZE = 11;

// Tabs

const create_tabs_header = () => {
    const container = document.createElement('div');
    container.id = 'dbinterface_tabsheader';
    return container;
};

const create_tabs_container = () => {
    const container = document.createElement('div');
    container.id = 'dbinterface_tabbody';

    return container;
};

export const create_tabs_system = (MountRoute, AppId, ParentNode) => {
    ParentNode.append(
        create_tabs_header(),
        create_tabs_container()
    );

    // db_selector
    const db_selector = document.getElementById(`${AppId}_db_selector`);
    // db_selector events
    db_selector.addEventListener('click', e => choose_db(e, AppId));
    db_selector.addEventListener('contextmenu', e => invoke_manager_contextmenu(e, MountRoute, AppId));

    document.addEventListener('keydown', e => {
        handle_special_events(e, MountRoute, AppId);
    });
};

const create_tab = (head_text) => {
    const uniqid = makeid(UNIQID_SIZE);

    const tabs_header = document.getElementById('dbinterface_tabsheader');
    const tabs_body = document.getElementById('dbinterface_tabbody');

    tabs_header.querySelectorAll('.tab_toggler.active').forEach((tab, _) => tab.classList.remove('active'));
    tabs_body.querySelectorAll('.tabs_body.active').forEach((tab, _) => tab.classList.remove('active'));

    // Append to head
    const tab_toggler = document.createElement('div');
    tab_toggler.classList.add('tab_toggler', 'active');
    tab_toggler.setAttribute('tab-id', uniqid);

    const close_icon = document.createElement('i');
    close_icon.classList.add('fa-solid', 'fa-xmark', 'pointer');
    close_icon.addEventListener('click', e => {
        const tab_id = e.target.closest('.tab_toggler').getAttribute('tab-id');
        document.querySelector(`#dbinterface_tabbody [tab-id="${tab_id}"]`)?.remove();
        e.target.closest('.tab_toggler')?.remove();
    });
    tab_toggler.append(document.createTextNode(head_text), close_icon);

    tabs_header.append(tab_toggler);
    // Create body
    const body = document.createElement('div');
    body.classList.add('tabs_body', 'active');
    body.setAttribute('tab-id', uniqid);

    tabs_body.append(body);

    // Events
    tab_toggler.addEventListener('click', switch_tab);

    return body;
};

// Editor

export const create_editor = (MountRoute, AppId) => {
    const node = create_tab('Query');
    // Editor creation
    const editor = document.createElement('textarea');
    // editor.id = `${AppId}_editor`;
    editor.classList.add('dbinterface__editor');
    
    node.append(editor);

    // Editor events
    editor.addEventListener('keyup', e => handle_key_events(e, AppId, MountRoute));
    editor.addEventListener('contextmenu', e => invoke_editor_contextmenu(e, AppId, MountRoute));
};

const switch_tab = e => {
    if(e.target.closest('.tab_toggler').classList.contains('active')) return;

    document.querySelectorAll('#dbinterface_tabsheader .tab_toggler.active').forEach((tab, _) => tab.classList.remove('active'));

    const body_tabs = document.getElementById('dbinterface_tabbody');
    document.querySelectorAll('#dbinterface_tabbody .tabs_body.active').forEach((tab, _) => {
        tab.classList.remove('active');
    });
    body_tabs.querySelector(`[tab-id="${e.target.closest('.tab_toggler').getAttribute('tab-id')}"]`)?.classList.add('active');
    e.target.closest('.tab_toggler')?.classList.add('active');
}


// Regular events

const handle_execute = async (target, MountRoute) => {
    target.parentNode.querySelector('.editor__result_wrapper')?.remove();

    if(getActiveDatabase() === null) return Alert({ text: `No puede ejecutar comandos.<br /><b>Motivo: </b>No ha seleccionado una base de datos` });

    const Request = target.value.trim();
    if(Request === '') return;
    const { code, message, Result, Columns, Info } = await FetchPromise(MountRoute, { action: 'EXECUTE', fields: {DB: getActiveDatabase(), Request} });
    if(code != 0) return Alert({ text: message });

    const result_wrapper = document.createElement('div');
    result_wrapper.classList.add('editor__result_wrapper');

    const result_container = document.createElement('div');
    result_container.classList.add('editor__result');

    const info_container = document.createElement('div');
    info_container.classList.add('editor__info');

    // Info panel
    const ul = document.createElement('ul');
    Object.keys(Info).forEach((k, _) => {
        const li = document.createElement('li');
        li.append(document.createTextNode(Info[k]));
        ul.append(li);
    });

    info_container.append(ul);

    // Result container
    const grid = create_grid({ columns_info: Columns });
    grid.AddRows(Result);
    grid.Draw(result_container);

    result_wrapper.append(result_container, info_container);
    target.parentNode.append(result_wrapper);
};

const handle_key_events = (e, _AppId, MountROute) => {
    const target = e.target.closest('textarea');

    switch(e.key) {
        case keys.F9:
            handle_execute(target, MountROute);
        break;
    }
};

const choose_db = (e, AppId) => {
    const selected_element = e.target.closest('li');
    if(selected_element === null) return;
    setActiveDatabase(selected_element.getAttribute('data-code'));

    selected_element.closest('ul').querySelectorAll('li.active').forEach((li, _) => li.classList.remove('active'));

    selected_element.classList.add('active');
};

const handle_special_events = (e, MountRoute, AppId) => {
    switch(e.key) {
        case 'F3':
            e.preventDefault();
            create_editor(MountRoute, AppId)
        break;
    }
};

// Context menu events

const invoke_manager_contextmenu = (e, MountRoute, AppId) => {
    e.preventDefault();
    const options = [];
    options.push({ text: 'Nueva base de datos', callback: () => invoke_database_creation(MountRoute, AppId) });
    if(e.target.closest('li') !== null) {
        options.push({ text: 'Eliminar base de datos', callback: () => invoke_drop_database(MountRoute, AppId, e.target.closest('li')) });
    }
    create_contextmenu(AppId, e.clientX, e.clientY, options);
};

const invoke_editor_contextmenu = (e, AppId, MountRoute) => {
    e.preventDefault();
    const options = [
        { text: 'Ejecutar', callback: () => handle_execute(e.target, MountRoute) },
        { text: 'Abrir consulta nueva', callback: () => create_editor(MountRoute, AppId) },
    ];
    create_contextmenu(AppId, e.clientX, e.clientY, options);
};