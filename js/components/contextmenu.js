const remove_popup = e => {
    if(open === false) return;
    if(e.target.closest('#dbinterface_popup') !== null) return;

    document.getElementById('dbinterface_popup')?.remove();
    get_events().forEach((event, _) => document.removeEventListener(event, remove_popup));
};

const get_events = () => ['click', 'keydown', 'keyup', 'keypress'];

const context_menu_popup = (AppId, xAxis, yAxis, options = []) => {
    const AXIS_ADJUSTMENT = 10;
    xAxis += AXIS_ADJUSTMENT;
    yAxis += AXIS_ADJUSTMENT;
    document.getElementById('dbinterface_popup')?.remove();

    const popup = document.createElement('div');
    popup.id = 'dbinterface_popup';
    popup.style = `
        position: absolute; top: ${yAxis}px; left: ${xAxis}px;
        min-width: 10vmin; width: fit-content; max-width: 20vmin;
        height: fit-content; min-height: 5vmin;
        background-color: white;
        box-shadow: var(--generic-box-shadow);
        border-radius: var(--app-border-radius);
        z-index: 999;
    `;

    options.forEach((option, _) => {
        if(option.text === undefined) throw new Error(`The 'text' atribute must be given in every context menu option`);
        const option_node = document.createElement('span');
        option_node.append(document.createTextNode(option.text));

        if(option.callback !== undefined && option.callback !== '') option_node.addEventListener('click', e => {
            option.callback();
            e.target.closest('div')?.remove();
        });

        popup.append(option_node);
    });

    document.querySelector('body')?.append(popup);
    const { width: popupWidth, height: popupHeight } = popup.getBoundingClientRect();
    // Check window boundaries and adjust the coordinates
    const { width: containerWidth, height: containerHeight } = document.getElementById(`${AppId}_container`).getBoundingClientRect();
    if((popupWidth+xAxis) > containerWidth) popup.style.left = `${(containerWidth - popupWidth) - AXIS_ADJUSTMENT}px`;
    if((popupHeight+yAxis) > containerHeight) popup.style.top = `${(containerHeight - popupHeight) - AXIS_ADJUSTMENT}px`;
};

export const create_contextmenu = (AppId, xAxis, yAxis, options = []) => {
    context_menu_popup(AppId, xAxis, yAxis, options);
    
    get_events().forEach((event, _) => document.addEventListener(event, remove_popup));
};