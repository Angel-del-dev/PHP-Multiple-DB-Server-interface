import { logos } from "./constants.js";

const create_logo_image = (MountRoute, Type) => {
    const logo_node = document.createElement('div');
    logo_node.classList.add('dbinterface__logoimage');
    logo_node.style.backgroundImage = `url('${MountRoute}/${logos[Type]}')`;
    logo_node.style.backgroundSize = 'cover';
    logo_node.style.backgroundRepeat = 'no-repeat';

    return logo_node;
}

export const get_dbs_nodes = (MountRoute, dbs) => {
    const list_node = document.createElement('ul');

    dbs.forEach((db, _) => {
        // TODO Check if a database type is not supported
        const list_element_node = document.createElement('li');
        list_element_node.title = db.Name;
        const element_span = document.createElement('span');
        element_span.append(document.createTextNode(db.Name));
        list_element_node.append(create_logo_image(MountRoute, db.Type), element_span);
        list_node.append(list_element_node);
    });

    return list_node;
};