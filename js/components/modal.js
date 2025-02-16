const HEADER_HEIGHT = '5vmin';

export const _close_modal = (e, onExit) => {
    e.target.closest('.modal').remove();
    if(onExit !== null) onExit();
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

    modal_body.append(_create_generic_header(title, onExit));

    modal.append(modal_body);
    document.querySelector('body')?.append(modal);

    return modal_body;
};