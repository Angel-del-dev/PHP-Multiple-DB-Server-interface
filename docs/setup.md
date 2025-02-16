# Setup
In order for the component to work, there must exist a  **MYSQL** database with an **identical** schema to the one used in [Example DDL](../_schema/ddl.sql)

There's a `.env-example` in the base directory that needs to be renamed or copied to a file named `.env` with the same structure.  
This file is needed to set the required **environment variables** to be able to run the project  
```ini
# .env
dbhost=
dbport=
dbname=
dbuser=
dbpassword=
```