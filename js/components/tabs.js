import { UNIQID_SIZE } from "../lib/constants.js";
import { makeid } from "../lib/utils.js";
import { choose_db, create_editor, invoke_manager_contextmenu } from "./editor.js";


const create_tabs_container = () => {
    const container = document.createElement('div');
    container.id = 'dbinterface_tabbody';

    return container;
};

// Tabs

const create_tabs_header = () => {
    const container = document.createElement('div');
    container.id = 'dbinterface_tabsheader';
    return container;
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
        handle_tab_events(e, MountRoute, AppId);
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

const handle_tab_events = (e, MountRoute, AppId) => {
    switch(e.key) {
        case 'F3':
            e.preventDefault();
            create_editor(MountRoute, AppId)
        break;
    }
};