import { _close_modal, _create_generic_header, modal } from "./modal.js";

const _create_modal = (body, footer) => {
    const modal_node = modal({
        width: '50vmin', minheight: '20vmin',
        title: 'Aviso'
    });
    modal_node.append(body, footer);
};

const _create_generic_body = text => {
    const body = document.createElement('div');
    body.style = 'width: 100%; min-height: 10vmin; padding: 10px;';
    const text_node = document.createElement('span');
    text_node.innerHTML = text;
    body.append(text_node);
    return body;
};

const _create_generic_footer = (confirm_icon, confirm_text, onExit) => {
    const footer = document.createElement('div');
    footer.style = `
        width: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 10px;
    `;

    const accept_button = document.createElement('button');
    accept_button.classList.add('btn-primary');

    const accept_icon = document.createElement('i');
    accept_icon.classList.add(...confirm_icon.split(' '));

    accept_button.append(accept_icon, confirm_text);

    accept_button.addEventListener('click', e => _close_modal(e, onExit));

    footer.append(accept_button);
    return footer;
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