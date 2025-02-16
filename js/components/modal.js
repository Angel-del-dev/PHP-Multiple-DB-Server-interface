const HEADER_HEIGHT = '5vmin';

export const _close_modal = (e, onExit) => {
    if(onExit !== null) onExit();
    e.target.closest('.modal').remove();
};

export const _create_generic_header = (title, onExit = null) => {
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

export const _create_generic_footer = (confirm_icon, confirm_text, onExit) => {
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

/**
 *  
 * @returns $modal_body to append nodes directly 
 */
export const modal = (
    { 
        width='fit-content', height='fit-content', 
        minwidth='10vmin', minheight='10vmin',
        title='Default title', onExit = null
    }
) => {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.style = `
        position: absolute; top: 0; left: 0;
        width: 100svw; height: 100svh;
        display: flex; justify-content: center; align-items: center;
    `;

    const modal_body = document.createElement('div');
    modal_body.style = `
        background-color: white;
        box-shadow: var(--generic-box-shadow); border-radius: var(--app-border-radius);
        min-width: ${minwidth};width: ${width}; min-height: ${minheight}; height: ${height};
    `;
    
    const modal_bodycontainer = document.createElement('div');
    modal_bodycontainer.style = `
        width: 100%; min-height: 100%; height: fit-content;
        padding: 10px;
    `;

    modal_body.append(_create_generic_header(title, onExit), modal_bodycontainer);
    modal.append(modal_body);
    document.querySelector('body')?.append(modal);

    return modal_bodycontainer;
};