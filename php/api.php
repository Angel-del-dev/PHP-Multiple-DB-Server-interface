<?php

if(!$_REQUEST) header('Location: /');

require_once(__DIR__.'../lib/parse.php');
require_once(__DIR__.'../lib/db.php');

$result = [ 'code' => 0, 'message' => '' ];

try {
    $params = Parse::Request();
    $fields = $params->fields;

    switch(strtoupper($params->action)) {
        case 'GETDATABASES':
            $db = new DB();
            
            $Databases = [];

            $query = '
                SELECT DB_CODE, DB_NAME, DB_TYPE
                FROM DB_BY_HOST
            ';

            if(!is_null($fields->domain) ||!is_null($fields->language_server)) $query .= ' WHERE ';
            if(!is_null($fields->domain)) $query .= " UPPER(WEB_DOMAIN) = :WEB_DOMAIN ";
            if(!is_null($fields->language_server)) $query .= " UPPER(DB_TYPE) = :DB_TYPE ";

            $sql = $db->newQuery($query);
            if(!is_null($fields->domain)) $sql->params->WEB_DOMAIN = strtoupper($fields->domain);
            if(!is_null($fields->language_server)) $sql->params->DB_TYPE = strtoupper($fields->language_server);
            
            $res = $sql->Execute();
            foreach($res as $row) {
                $Databases[] = [
                    'Type' => $row['DB_TYPE'],
                    'Name' => $row['DB_NAME'],
                    'Code' => $row['DB_CODE'],
                ];
            }
            $result['Databases'] = $Databases;
        break;
        case 'GETDATABASECHARSETS':
            $db = new DB($fields->database_type);
            $result['Charsets'] = $db->GetCharsets();
        break;
        case 'CREATEDATABASE':
            $db = new DB($fields->database_type);
            $db_name = $db->CreateDatabase($fields->database_charset);

            $db_parent = new DB();
            $sql = $db->newQuery("
                INSERT INTO DB_BY_HOST
                (DB_NAME, DB_TYPE, WEB_DOMAIN)
                VALUES
                (:DB_NAME, :DB_TYPE, '')
            ");
            $sql->params->DB_NAME = $db_name;
            $sql->params->DB_TYPE = $fields->database_type;
            $sql->Execute();
        break;
        default:
            $result = [ 'code' => 1, 'message' => "No se ha encontrado la opción '{$params->action}'" ];
        break;
    }

} catch(Throwable $e) {
    $result['code'] = -1;
    $result['message'] = $e->getMessage();
}

echo json_encode($result);