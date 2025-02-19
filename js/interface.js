import { RefreshDatabases } from "./api/db.js";
import { create_editor, create_tabs_system } from "./components/editor.js";

export const Main = async ({ MountRoute, AppId }) => {
    const db_manager_node = document.getElementById(`${AppId}_db_manager`)

    RefreshDatabases(MountRoute, AppId);
    create_tabs_system(MountRoute, AppId, db_manager_node);
    create_editor(MountRoute, AppId);
};