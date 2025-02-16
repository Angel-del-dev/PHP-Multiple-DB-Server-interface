// Database creation components

import { _create_generic_header, modal } from "./modal.js";

const create_db_creation_modal = () => {
    const modal_body = modal({
        minwidth: '60vmin', title: 'Crear base de datos'
    });

    console.log(modal_body);
};

export const invoke_database_creation = () => {
    create_db_creation_modal();
};