import { makeid } from "../lib/utils.js";
export const GetDatabases = () => {
    const name_length = 60;
    const dbs = [
        { Type: 'sqlite', Name: makeid(name_length) },
        { Type: 'firebirdsql', Name: makeid(name_length) },
        { Type: 'mysql', Name: makeid(name_length) }
    ];

    return dbs;
};