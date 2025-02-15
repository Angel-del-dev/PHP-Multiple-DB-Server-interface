// Constants

const HEADER_HEIGHT = '5vmin';

//

const _close_modal = (e, onExit) => {
    e.target.closest('.modal').remove();
    if(onExit !== null) onExit();
};

const _create_modal = (header, body, footer) => {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.style = `
        border-radius: var(--app-border-radius);
        width: 100svw; height: 100svh; 
        position: absolute; top: 0; left: 0; 
        z-index: 999;
        display: flex; justify-content: center; align-items: center;
        user-select: none;
    `;

    const modal_body = document.createElement('div');
    modal_body.style = `
        width: 50vmin; height: fit-content; min-height: 20vmin;
        display: flex; justify-content: flex-start; align-items: center; flex-direction: column;
        box-shadow: var(--generic-box-shadow); border-radius: var(--app-border-radius);
        background-color: white;
    `;

    modal_body.append(header, body, footer);    
    modal.append(modal_body);
    document.querySelector('body')?.append(modal);
};

const _create_generic_header = (title, onExit) => {
    const header = document.createElement('div');
    header.style = `
        width: 100%; height: ${HEADER_HEIGHT};
        padding: 5px 10px;
        background-color: var(--primary-bg-color); color: var(--primary-color);
        display: flex; justify-content: space-between; align-items: center;
        border-radius: var(--app-border-radius) var(--app-border-radius) 0 0;
    `;

    const title_node = document.createElement('span');
    title_node.append(document.createTextNode(title));

    const close_node = document.createElement('i');
    close_node.classList.add('fa-solid', 'fa-xmark', 'pointer');
    close_node.addEventListener('click', e => _close_modal(e, onExit));

    header.append(title_node, close_node);

    return header;
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
        _create_generic_header(title, onExit),
        _create_generic_body(text),
        _create_generic_footer(confirm_icon, confirm_text, onExit)
    );
};