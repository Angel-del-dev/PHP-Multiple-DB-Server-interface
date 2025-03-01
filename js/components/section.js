import { create_tab } from "./tabs.js";

/**
 * 
 * Do not destructure Info in the parameters
 * It is needed to load the list of names
 */
export const create_section_preview = (section, Info) => {
    const node = create_tab(`${section} schema`);
    
    const container = document.createElement('div');
    container.classList.add('dbinterface-section-schema');

    container.append(
        create_navigator_head(Object.keys(Info)),
        create_navigator_body(Info)
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

const create_navigator_body = Info => {
    const container = document.createElement('div');
    container.classList.add('dbinterface-section-navigator-body');

    const navigator_options = { DDL: create_ddl_tab };

    Object.keys(Info).forEach((key, i) => {
        const div = document.createElement('div');
        if(i > 0) div.classList.add('d-none');
        div.setAttribute('data-name', key);

        if(navigator_options[key] !== undefined) navigator_options[key](div, Info[key]);

        container.append(div);
    });

    return container;
};

const create_ddl_tab = (div, creation_string) => {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.append(document.createTextNode(creation_string));
    pre.append(code);
    div.append(pre);
};