import { keys } from "../lib/constants.js";
import { useState } from "../lib/hooks.js";
import { FetchPromise } from "../lib/utils.js";
import { Alert } from "./alerts.js";
import { create_contextmenu } from "./contextmenu.js";
import { invoke_database_creation, invoke_drop_database } from "./db.js";

const [ getActiveDatabase, setActiveDatabase ] = useState(null);

const handle_execute = async (target, MountRoute) => {
    if(getActiveDatabase() === null) return Alert({ text: `No puede ejecutar comandos.<br /><b>Motivo: </b>No ha seleccionado una base de datos` });

    const Request = target.value.trim();
    if(Request === '') return;
    const { code, message, Result, Columns, Info } = await FetchPromise(MountRoute, { action: 'EXECUTE', fields: {DB: getActiveDatabase(), Request} });
    if(code != 0) return Alert({ text: message });
    // TODO Show output
    console.log(Info);
    console.log(Columns);
    console.log(Result)
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

export const create_editor = (MountRoute, AppId, node) => {
    // Editor creation
    const editor = document.createElement('textarea');
    editor.id = `${AppId}_editor`;
    editor.classList.add('dbinterface__editor');
    node.append(editor);
    // Editor events
    editor.addEventListener('keyup', e => handle_key_events(e, AppId, MountRoute));
    editor.addEventListener('contextmenu', e => invoke_editor_contextmenu(e, AppId, MountRoute));
    // db_selector
    const db_selector = document.getElementById(`${AppId}_db_selector`);
    // db_selector events
    db_selector.addEventListener('click', e => choose_db(e, AppId));
    db_selector.addEventListener('contextmenu', e => invoke_manager_contextmenu(e, MountRoute, AppId));
};


// Events

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
        { text: 'Ejecutar', callback: () => handle_execute(e.target, MountRoute) }
    ];
    create_contextmenu(AppId, e.clientX, e.clientY, options);
};