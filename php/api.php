<?php

if(!$_REQUEST) header('Location: /');

require_once(__DIR__.'../lib/parse.php');
require_once(__DIR__.'../lib/db.php');

function GetDatabaseInfo(int $Code):array {
    $db = new DB();
    $sql = $db->newQuery('
        SELECT *
        FROM DB_BY_HOST
        WHERE DB_CODE = :DB_CODE
    ');
    $sql->params->DB_CODE = $Code;
    $Data = $sql->Execute();
    $sql->close();
    return $Data;
}

$result = [ 'code' => 0, 'message' => '' ];

// TODO Rework api system to be inside of a api/ directory with specific cases

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
                    'message' => 'The given database does not exist'
                ];
                break;
            }

            $DB_TYPE = $Data[0]['DB_TYPE'];
            $DB_NAME = $Data[0]['DB_NAME'];
            $sql->close();
            
            $client_db = new DB($DB_TYPE);
            $client_db->setConnectionParameter('dbname', $DB_NAME);

            $error_msg = $client_db->CheckUnauthorizedQueryStrings($upper_request);
            if(strlen(trim($error_msg)) > 0) {
                $result = ['code' => 1, 'message' => $error_msg];
                break;
            }

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
                'RowCount' => "Nº of results: {$sql->rowCount}",
                'Date' => 'Execution date: '.date('d/m/Y'),
                'Time' => 'Execution time: '.date('H:i:s')
            ];

            $sql->close();
            $result['Columns'] = $Columns;
            $result['Result'] = $Result_data;
        break;
        case 'GETDATABASEINFO':
            $Data = GetDatabaseInfo($fields->Database);
            if(count($Data) === 0) {
                $result = ['code' => 1, 'message' => 'The given database was not found'];
                break;
            }
            $Row = $Data[0];
            $db = new DB($Row['DB_TYPE']);
            $db->setConnectionParameter('dbname', $Row['DB_NAME']);
            $result['Info'] = $db->GetDatabaseInfo();
        break;
        case 'SHOWSECTIONINFO':
            $Data = GetDatabaseInfo($fields->Database);
            if(count($Data) === 0) {
                $result = ['code' => 1, 'message' => 'The given database was not found'];
                break;
            }
            $Row = $Data[0];
            $db = new DB($Row['DB_TYPE']);
            $db->setConnectionParameter('dbname', $Row['DB_NAME']);
            $result['Info'] = $db->GetSectionData($fields->Section, $fields->Data);
        break;
        default:
            $result = [ 'code' => 1, 'message' => "The option '{$params->action}' is not supported" ];
        break;
    }

} catch(Throwable $e) {
    $result['code'] = -1;
    $result['message'] = $e->getMessage();
}

echo json_encode($result);