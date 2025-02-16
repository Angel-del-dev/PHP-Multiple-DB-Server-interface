import { Alert } from "../components/alerts.js";
import { FetchPromise } from "../lib/utils.js";
import { get_dbs_nodes } from "../lib/db.js"

export const GetDatabases = async (MountRoute, { domain = null, language_server = null} = {domain: null, language_server: null}) => {
    const { code, message, Databases } = await FetchPromise(MountRoute, { action: 'GETDATABASES', fields: { language_server, domain } });
    if(code != 0) {
        Alert(message);
        return [];
    }
    return Databases;
};

export const RefreshDatabases = async (MountRoute, AppId, { domain = null, language_server = null} = {domain: null, language_server: null}) => {
    const db_selector_node = document.getElementById(`${AppId}_db_selector`);
    const Databases = await GetDatabases(MountRoute, { domain, language_server });
    db_selector_node.append(get_dbs_nodes(MountRoute, Databases));
}