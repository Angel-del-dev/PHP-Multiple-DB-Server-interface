import { supported_database_types } from "../lib/constants.js";
import { Alert, Confirm } from "./alerts.js";
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
        reset_collations(MountRoute);
    });

    return select_db_type_row;
};

const create_db_type_collations = () => {
    const row = document.createElement('div');

    const collations = Combobox({
        id: 'db_creation_collations'
    });
    collations.style.width = 'fit-content';
    row.append(collations);

    return row;
};

const create_db_creation_footer = (MountRoute, AppId) => {
    const confirm_create_db = async () => {
        const database_type = document.getElementById('dbcreation_type').value.toLowerCase();
        const database_collation = document.getElementById('db_creation_collations').value.toLowerCase();
        const { code, message } = await FetchPromise(MountRoute, { action: 'CREATEDATABASE', fields: { database_type, database_collation } });
        if(code != 0) return Alert({ text: message });
        RefreshDatabases(MountRoute, AppId);
    };

    return _create_generic_footer('fa-solid fa-check', 'Confirmar', confirm_create_db);
};

const create_db_creation_modal = (MountRoute, AppId) => {
    const modal_body = modal({
        minwidth: '60vmin', title: 'New database'
    });

    modal_body.append(
        create_db_type_row(MountRoute),
        create_db_type_collations(),
        create_db_creation_footer(MountRoute, AppId)
    );

    // Apply default charsets on initial load
    reset_collations(MountRoute);
};

export const invoke_database_creation = (MountRoute, AppId) => {
    create_db_creation_modal(MountRoute, AppId);
};

// Functions
const reset_collations = async (MountRoute) => {
    const collations_node = document.getElementById('db_creation_collations');
    collations_node.innerHTML = '';
    
    const database_type = document.getElementById('dbcreation_type').value.toUpperCase();
    
    const { code, message, Collations } = await FetchPromise(MountRoute, { action: 'GETDATABASECOLLATIONS', fields: { database_type } });
    if(code != 0) return Alert({ title: 'Error', text: message });
    
    Object.keys(Collations).forEach((key, _) => {
        const optgroup = document.createElement('optgroup');
        optgroup.setAttribute('label', key);

        Collations[key].forEach((collation) => {
            const option = document.createElement('option');
            option.value = collation;
            option.append(document.createTextNode(collation));

            optgroup.append(option);
        });

        collations_node.append(optgroup);
    });
};

const confirm_drop_database = async (MountRoute, AppId, Code) => {
    const { code, message } = await FetchPromise(MountRoute, { action: 'DROPDATABASE', fields: { Code } });
    if(code != 0) return Alert({ text: message });
    RefreshDatabases(MountRoute, AppId);
}

export const invoke_drop_database = async (MountRoute, AppId, li) => {
    Confirm({
        text: `¿Would you like to remove the database '${li.querySelector('span').textContent}?'<br />This process cannot be undone`,
        onConfirm: () => confirm_drop_database(MountRoute, AppId, li.getAttribute('data-code'))
    });
};