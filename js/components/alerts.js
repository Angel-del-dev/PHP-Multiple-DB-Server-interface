import { _close_modal, _create_generic_footer, _create_generic_header, modal } from "./modal.js";

const _create_modal = (body, footer) => {
    const modal_node = modal({
        width: '50vmin', minheight: '20vmin',
        title: 'Aviso'
    });
    modal_node.append(body, footer);
};

const _create_generic_body = text => {
    const body = document.createElement('div');
    body.style = 'width: 100%; min-height: 10vmin;';
    const text_node = document.createElement('span');
    text_node.innerHTML = text;
    body.append(text_node);
    return body;
};

export const Alert = (
    { 
        text = '', 
        title = 'Notificación',
        onExit = null,
        confirm_icon = 'fa-solid fa-check',
        confirm_text = 'Entendido', 
    }
) => {
    _create_modal(
        _create_generic_body(text),
        _create_generic_footer(confirm_icon, confirm_text, onExit)
    );
};