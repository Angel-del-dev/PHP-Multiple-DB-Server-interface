import { keys } from "../lib/constants.js";
import { useState } from "../lib/hooks.js";
import { Alert } from "./alerts.js";
import { create_contextmenu } from "./contextmenu.js";
import { invoke_database_creation } from "./db.js";

const [ getActiveDatabase, setActiveDatabase ] = useState(null);

const handle_execute = target => {
    if(getActiveDatabase() === null) return Alert({ text: `No puede ejecutar comandos.<br /><b>Motivo: </b>No ha seleccionado una base de datos` });
    // TODO Handle execute query correctly
    Alert({ text: 'Ok' })
};

const handle_key_events = (e, _AppId) => {
    const target = e.target.closest('textarea');

    switch(e.key) {
        case keys.F9:
            handle_execute(target);
        break;
    }
};

const choose_db = (e, AppId) => {
    const selected_element = e.target.closest('li');
    if(selected_element === null) return;
    setActiveDatabase(selected_element.getAttribute('data-code'));
};

export const create_editor = (AppId, node) => {
    // Editor creation
    const editor = document.createElement('textarea');
    editor.id = `${AppId}_editor`;
    editor.classList.add('dbinterface__editor');
    node.append(editor);
    // Editor events
    editor.addEventListener('keyup', e => handle_key_events(e, AppId));
    editor.addEventListener('contextmenu', e => invoke_editor_contextmenu(e, AppId));
    // db_selector
    const db_selector = document.getElementById(`${AppId}_db_selector`);
    // db_selector events
    db_selector.addEventListener('click', e => choose_db(e, AppId));
    db_selector.addEventListener('contextmenu', e => invoke_manager_contextmenu(e, AppId));
};


// Events

const invoke_manager_contextmenu = (e, AppId) => {
    e.preventDefault();
    const options = [];
    options.push({ text: 'Nueva base de datos', callback: invoke_database_creation });
    create_contextmenu(AppId, e.clientX, e.clientY, options);
};

const invoke_editor_contextmenu = (e, AppId) => {
    e.preventDefault();
    const options = [
        { text: 'Ejecutar', callback: () => handle_execute(document.getElementById(`${AppId}_editor`)) }
    ];
    create_contextmenu(AppId, e.clientX, e.clientY, options);
};