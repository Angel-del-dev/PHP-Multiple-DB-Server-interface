import { keys } from "../lib/constants.js";
import { useState } from "../lib/hooks.js";
import { FetchPromise, makeid } from "../lib/utils.js";
import { Alert } from "./alerts.js";
import { create_contextmenu } from "./contextmenu.js";
import { invoke_database_creation, invoke_drop_database, } from "./db.js";
import { create_grid } from "./grid.js";
import { get_db_info_nodes } from "../lib/db.js";
import { GetDatabases } from "../api/db.js";
import { Combobox } from "./all.js";

const [ getActiveDatabases, setActiveDatabases ] = useState([]);
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

const refresh_editor_available_databases = () => {
    document.querySelectorAll(`.dbinterface__db_manager select.editor_database_selector`).forEach((select, _) => {
        select.innerHTML = '';
        const databases_list = document.getElementById('databases-list');
        select.append(document.createElement('option'));
        getActiveDatabases().forEach((code, i) => {
            const option = document.createElement('option');
            const caption = databases_list.querySelector(`[data-code="${code}"]`).title;
            option.value = code;
            option.append(document.createTextNode(caption));
            select.append(option);
        });
    });
};

export const create_tabs_system = (MountRoute, AppId, ParentNode, head_text = '') => {
    ParentNode.append(
        create_tabs_header(head_text),
        create_tabs_container()
    );

    // db_selector
    const db_selector = document.getElementById(`${AppId}_db_selector`);
    // db_selector events
    db_selector.addEventListener('click', e => choose_db(e, AppId, MountRoute));
    db_selector.addEventListener('contextmenu', e => invoke_manager_contextmenu(e, MountRoute, AppId));

    document.addEventListener('keydown', e => {
        handle_special_events(e, MountRoute, AppId);
    });
};

export const create_tab = (head_text) => {
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
    // Editor navbar
    const navbar = document.createElement('div');
    navbar.classList.add('query-editor-navbar');

    const selector = Combobox({
        id: makeid(11)
    });
    selector.style.width = 'fit-content';
    selector.style.minWidth = '10vmin';
    selector.classList.add('editor_database_selector');
    selector.addEventListener('change', e => {
        e.target.closest('.tabs_body.active')?.querySelector('.editor__result_wrapper')?.remove();
    });
    selector.title = 'Current database';
    navbar.append(selector);
    // Editor creation
    const editor = document.createElement('textarea');
    // editor.id = `${AppId}_editor`;
    editor.classList.add('dbinterface__editor');
    
    node.append(navbar, editor);

    // Editor events
    editor.addEventListener('keyup', e => handle_key_events(e, AppId, MountRoute));
    editor.addEventListener('contextmenu', e => invoke_editor_contextmenu(e, AppId, MountRoute));
    refresh_editor_available_databases();
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
    // TODO Handle selection execute
    target.parentNode.querySelector('.editor__result_wrapper')?.remove();

    const Request = target.value.trim();
    if(Request === '') return;

    if(getActiveDatabases().length === 0) return Alert({ text: `Query could not be executed.<br />No database is active` });
    const chosen_database = document.querySelector('#dbinterface_tabbody .tabs_body.active .editor_database_selector').value;
    if(chosen_database === '') return Alert({ text: `No database has been selected for the current editor instance` });
    const { code, message, Result, Columns, Info } = await FetchPromise(MountRoute, { action: 'EXECUTE', fields: {DB: chosen_database, Request} });
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
    // TODO Add time processing

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

const choose_db = async (e, AppId, MountRoute) => {
    if(e.target.closest('li') === null) return;
    if(e.target.closest('span') === null) return;
    const database_info = e.target.closest('li')?.querySelector('ul');
    if( database_info !== null ) {
        if(database_info.classList.contains('d-none')) database_info.classList.remove('d-none');
        else database_info.classList.add('d-none');
        return;
    }
    if(e.target.closest('#databases-list') === null) return;
    const selected_element = e.target.closest('li');
    if(selected_element === null) return;

    const Database = selected_element.getAttribute('data-code');

    const { code, message, Info } = await FetchPromise(MountRoute, { action: 'GETDATABASEINFO', fields: { Database } });
    if(code != 0) return Alert({ text: message });

    const nodes = get_db_info_nodes(MountRoute, Info);

    e.target.closest('li').append(nodes);

    // Change the way setActiveDatabasess Work
    const Databases = getActiveDatabases();

    if(Databases.indexOf(Database) < 0) Databases.push(Database);
    setActiveDatabases(Databases);
    selected_element.classList.add('active');

    refresh_editor_available_databases();
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
    if(e.target.closest('#databases-list') === null) return;
    e.preventDefault();
    const options = [];
    options.push({ text: 'New database', callback: () => invoke_database_creation(MountRoute, AppId) });
    if(e.target.closest('li') !== null) {
        options.push({ text: 'Remove database', callback: () => invoke_drop_database(MountRoute, AppId, e.target.closest('li')) });
    }
    create_contextmenu(AppId, e.clientX, e.clientY, options);
};

const invoke_editor_contextmenu = (e, AppId, MountRoute) => {
    e.preventDefault();
    const options = [
        { text: 'Execute', callback: () => handle_execute(e.target, MountRoute) },
        { text: 'Open new query', callback: () => create_editor(MountRoute, AppId) },
    ];
    create_contextmenu(AppId, e.clientX, e.clientY, options);
};