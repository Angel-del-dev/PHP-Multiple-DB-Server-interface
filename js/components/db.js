import { supported_database_types } from "../lib/constants.js";
import { Alert } from "./alerts.js";
import { Combobox, CustomImage } from "./all.js";
import { _create_generic_header, modal, _create_generic_footer } from "./modal.js";
import { FetchPromise } from "../lib/utils.js";
import { RefreshDatabases } from "../api/db.js";

// Database creation components

const create_db_type_row = (MountRoute) => {
    const select_db_type_row = document.createElement('div');
    select_db_type_row.style = `
        width: 100%;
        display: flex; justify-content: flex-start; align-items: center; gap: 10px;
    `;

    const options = [];
    Object.keys(supported_database_types).forEach((type, _) => options.push({ value: type.toUpperCase(), text: type }));

    const db_type_combobox = Combobox({
        id: 'dbcreation_type',
        options
    });
    db_type_combobox.style.width = 'fit-content';

    const db_type_img = CustomImage({
        src: `${MountRoute}/img/logo/${supported_database_types.mysql}`,
        // square: true
    });
    // db_type_img.style.width = '50px';
    db_type_img.style.height = '50px';
    
    select_db_type_row.append(db_type_combobox, db_type_img);

    db_type_combobox.addEventListener('change', _ => {
        db_type_img.src = `${MountRoute}/img/logo/${supported_database_types[db_type_combobox.value.toLowerCase()]}`
        reset_charsets(MountRoute);
    });

    return select_db_type_row;
};

const create_db_type_charsets = () => {
    const row = document.createElement('div');

    const charsets = Combobox({
        id: 'db_creation_charsets'
    });
    charsets.style.width = 'fit-content';
    row.append(charsets);

    return row;
};

const create_db_creation_footer = (MountRoute, AppId) => {
    const confirm_create_db = async () => {
        const database_type = document.getElementById('dbcreation_type').value.toLowerCase();
        const database_charset = document.getElementById('db_creation_charsets').value.toLowerCase();
        const { code, message } = await FetchPromise(MountRoute, { action: 'CREATEDATABASE', fields: { database_type, database_charset } });
        if(code != 0) return Alert({ text: message });
        RefreshDatabases(MountRoute, AppId);
    };

    return _create_generic_footer('fa-solid fa-check', 'Confirmar', confirm_create_db);
};

const create_db_creation_modal = (MountRoute, AppId) => {
    const modal_body = modal({
        minwidth: '60vmin', title: 'Crear base de datos'
    });

    modal_body.append(
        create_db_type_row(MountRoute),
        create_db_type_charsets(),
        create_db_creation_footer(MountRoute, AppId)
    );

    // Apply default charsets on initial load
    reset_charsets(MountRoute);
};

export const invoke_database_creation = (MountRoute, AppId) => {
    create_db_creation_modal(MountRoute, AppId);
};

// Functions
const reset_charsets = async (MountRoute) => {
    const charsets_node = document.getElementById('db_creation_charsets');
    charsets_node.innerHTML = '';
    
    const database_type = document.getElementById('dbcreation_type').value.toUpperCase();
    
    const { code, message, Charsets } = await FetchPromise(MountRoute, { action: 'GETDATABASECHARSETS', fields: { database_type } });
    if(code != 0) return Alert({ title: 'Error', text: message });
    
    Charsets.forEach((Charset, _) => {
        const option = document.createElement('option');
        option.value = Charset.Charset;
        option.append(document.createTextNode(`${Charset.Charset}: ${Charset.Description}`));

        charsets_node.append(option);
    });
};