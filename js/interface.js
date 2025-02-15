import { GetDatabases } from "./mokup/api.js";
import { get_dbs_nodes } from "./lib/db.js";
import { create_editor } from "./components/editor.js";

export const Main = ({ MountRoute, AppId }) => {
    const db_selector_node = document.getElementById(`${AppId}_db_selector`);
    const db_manager_node = document.getElementById(`${AppId}_db_manager`)
    db_selector_node.append(get_dbs_nodes(MountRoute, GetDatabases()));
    create_editor(AppId, db_manager_node);
};