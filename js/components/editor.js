import { keys } from "../lib/constants.js";
import { useState } from "../lib/hooks.js";
import { Alert } from "./alerts.js";

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
    const editor = document.createElement('textarea');
    editor.id = `${AppId}_editor`;
    editor.classList.add('dbinterface__editor');
    editor.addEventListener('keyup', e => handle_key_events(e, AppId));

    document.getElementById(`${AppId}_db_selector`).addEventListener('click', e => choose_db(e, AppId));

    node.append(editor);
};