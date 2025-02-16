import { makeid } from "../lib/utils.js";
export const GetDatabases = () => {
    const name_length = 60;
    const dbs = [
        { Code: 1, Type: 'sqlite', Name: makeid(name_length) },
        { Code: 2, Type: 'firebirdsql', Name: makeid(name_length) },
        { Code: 3, Type: 'mysql', Name: makeid(name_length) }
    ];

    return dbs;
};