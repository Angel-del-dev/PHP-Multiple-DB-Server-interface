import { create_grid } from "./grid.js";
import { create_tab } from "./tabs.js";

/**
 * 
 * Do not destructure Info in the parameters
 * It is needed to load the list of names
 */
export const create_section_preview = (Database, section, Info, MountRoute) => {
    const node = create_tab(`${section} schema`);
    node.setAttribute('database', Database);
    const container = document.createElement('div');
    container.classList.add('dbinterface-section-schema');

    container.append(
        create_navigator_head(Object.keys(Info)),
        create_navigator_body(Database, Info, section, MountRoute)
    );
    node.append(container);
};

const create_navigator_head = names => {
    const container = document.createElement('div');
    container.classList.add('dbinterface-section-navigator');
    names.forEach((name, i) => {
        const span = document.createElement('span');
        span.append(document.createTextNode(name));
        span.title = name;
        span.setAttribute('data-name', name);
        if(i === 0) span.classList.add('active');

        span.addEventListener('click', e => {
            const span = e.target.closest('[data-name]');
            e.target
                .closest('.dbinterface-section-navigator')
                .querySelectorAll('[data-name].active')
                .forEach((span_active, _) => span_active.classList.remove('active'));
            span.classList.add('active');
            e.target
                .closest('.dbinterface-section-schema')
                .querySelectorAll('.dbinterface-section-navigator-body [data-name]')
                .forEach((tab_body, _) => {
                    if(tab_body.getAttribute('data-name') === span.getAttribute('data-name')) tab_body.classList.remove('d-none');
                    else tab_body.classList.add('d-none');
                });

        });

        container.append(span);
    });

    return container;
};

const create_navigator_body = (Database, Info, Section, MountRoute) => {
    const container = document.createElement('div');
    container.classList.add('dbinterface-section-navigator-body');

    const navigator_options = { DDL: create_ddl_tab, SCHEMA: create_schema_tab, DATA: create_data_tab };

    const additional_info = {Database, Section, MountRoute};

    Object.keys(Info).forEach((key, i) => {
        const div = document.createElement('div');
        if(i > 0) div.classList.add('d-none');
        div.setAttribute('data-name', key);

        if(navigator_options[key] !== undefined) navigator_options[key](div, Info[key], additional_info);

        container.append(div);
    });

    return container;
};

const create_ddl_tab = (div, creation_string, Additional) => {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.append(document.createTextNode(creation_string));
    pre.append(code);
    div.append(pre);
};

const create_schema_tab = (div, { Columns, Data }, Additional) => {
    const grid = create_grid({ columns_info: Columns });
    grid.AllowHtmlRendering();
    grid.AddRows(Data);
    grid.Draw(div);

    // div.querySelector('table').style.height = 'fit-content';
    div.style.overflowY = 'auto';
};

const create_data_tab = (div, { Columns, Data }, {Database, Section, MountRoute}) => {
    const grid = create_grid({ columns_info: Columns });
    grid.AllowHtmlRendering();
    grid.AddRows(Data);
    grid.FetchTableDataOnFinished(Database, Section, MountRoute);
    grid.Draw(div);
    div.style.overflowY = 'auto';
};