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
            $sql->close();
            foreach($res as $row) {
                $Databases[] = [
                    'Type' => $row['DB_TYPE'],
                    'Name' => $row['DB_NAME'],
                    'Code' => $row['DB_CODE'],
                ];
            }
        
            $result['Databases'] = $Databases;
        break;
        case 'GETDATABASECOLLATIONS':
            $db = new DB($fields->database_type);
            $result['Collations'] = $db->GetCollations();
        break;
        case 'GETDATABASECHARSETS':
            $db = new DB($fields->database_type);
            $result['Charsets'] = $db->GetCharsets();
        break;
        case 'CREATEDATABASE':
            $db = new DB($fields->database_type);
            $db_name = $db->CreateDatabase($fields->database_collation);

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
            $sql->close();
        break;
        case 'DROPDATABASE':
            $parent_db = new DB();
            $get_db = $parent_db->newQuery('
                SELECT DB_NAME, DB_TYPE
                FROM DB_BY_HOST
                WHERE DB_CODE = :DB_CODE
            ');
            $get_db->params->DB_CODE = $fields->Code;
            $Database = $get_db->Execute();
            $get_db->close();
            if(count($Database) === 0) {
                $result = [ 'code' => 1, 'message' => 'Given database does not exist' ];
                break;
            }
            $Database = $Database[0];
            
            $db = new DB($Database['DB_TYPE']);
            $db->DropDatabase($Database['DB_NAME']);
            
            $sql = $parent_db->newQuery('
                DELETE
                FROM DB_BY_HOST
                WHERE DB_CODE = :DB_CODE
            ');
            $sql->params->DB_CODE = $fields->Code;
            $sql->Execute();
            $sql->close();
        break;
        case 'EXECUTE':
            $upper_request = strtoupper($fields->Request);
            if(str_contains($upper_request, 'CREATE DATABASE')) {
                $result = [
                    'code' => 1,
                    'message' => 'No se puede crear una base de datos desde una query'
                ];
                break;
            }

            if(str_contains($upper_request, 'DROP DATABASE')) {
                $result = [
                    'code' => 1,
                    'message' => 'No se puede eliminar una base de datos desde una query'
                ];
                break;
            }


            $parent_db = new DB();
            $sql = $parent_db->newQuery('
                SELECT *
                FROM DB_BY_HOST
                WHERE DB_CODE = :DB_CODE
            ');
            $sql->params->DB_CODE = $fields->DB;
            $Data = $sql->Execute();
            if(count($Data) === 0) {
                $result = [
                    'code' => 1,
                    'message' => 'La base de datos no se ha encontrado'
                ];
                break;
            }

            $DB_TYPE = $Data[0]['DB_TYPE'];
            $sql->close();
            
            $client_db = new DB($DB_TYPE);
            $sql = $client_db->newQuery($fields->Request);
            $Data = $sql->Execute();

            $Columns = [];
            $Result_data = [];

            $i = 0;
            foreach($Data as $row) {
                if(++$i === 1) {
                    foreach($row as $k => $v) {
                        $Columns[] = [
                            'Name' => $k,
                            'Type' => gettype($v)
                        ];
                    }
                }
                $Result_data[] = array_values($row);
            }

            $result['Info'] = [
                'RowCount' => "Nº de líneas: {$sql->rowCount}"
            ];

            $sql->close();
            $result['Columns'] = $Columns;
            $result['Result'] = $Result_data;
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