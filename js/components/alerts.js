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

export const Confirm = (
    { 
        text = '',
        onConfirm = null,
        onCancel = null,
        confirm_icon = 'fa-solid fa-check',
        confirm_text = 'Entendido', 
        cancel_icon = 'fa-solid fa-xmark',
        cancel_text = 'Cancelar', 
    }
) => {
    const footer_node = document.createElement('div');
    footer_node.style = `
        width: 100%; padding: 10px;
        display: flex; justify-content: flex-end; align-items: center; gap: 10px;
    `;

    // Confirm
    const btn_confirm = document.createElement('button');
    btn_confirm.classList.add('btn-primary');
    const confirm_icon_node = document.createElement('i');
    confirm_icon_node.classList.add(...confirm_icon.split(' '));
    btn_confirm.append(confirm_icon_node, document.createTextNode(confirm_text));
    btn_confirm.addEventListener('click', e => _close_modal(e, onConfirm));
    // Cancel
    const btn_cancel = document.createElement('button');
    btn_cancel.classList.add('btn-primary');
    const cancel_icon_node = document.createElement('i');
    cancel_icon_node.classList.add(...cancel_icon.split(' '));
    btn_cancel.append(cancel_icon_node, document.createTextNode(cancel_text));
    btn_cancel.addEventListener('click', e => _close_modal(e, onCancel));
    // Invoke
    footer_node.append(btn_confirm, btn_cancel);

    _create_modal(
        _create_generic_body(text),
        footer_node
    );
};