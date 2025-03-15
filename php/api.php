<?php

if(!$_REQUEST) header('Location: /');

require_once(__DIR__.'../lib/parse.php');
require_once(__DIR__.'../lib/db.php');

function GetDatabaseInfo(int $Code, array &$result):DB|null {
    $db = new DB();
    $sql = $db->newQuery('
        SELECT 
            DB_CODE, DB_NAME, DB_TYPE,
            WEB_DOMAIN, DB_HOST, DB_PORT,
            DB_USER, DB_PASSWORD
        FROM DB_BY_HOST
        WHERE DB_CODE = :DB_CODE
    ');
    $sql->params->DB_CODE = $Code;
    $Data = $sql->Execute();
    $sql->close();
    if(count($Data) === 0) {
        $result = ['code' => 1, 'message' => 'The given database was not found'];
        return null;
    }
    $Row = $Data[0];
    $db = new DB($Row['DB_TYPE']);
    $db->setCredentials(
        $Row['DB_HOST'], $Row['DB_NAME'], 
        $Row['DB_USER'], $Row['DB_PASSWORD']
    );

    return $db;
}

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
            $DB_Obj = new stdClass();
            $DB_Obj->Host = 'localhost';
            $DB_Obj->Name = uniqid();
            $DB_Obj->Port = 3303;
            $DB_Obj->User = uniqid();
            $DB_Obj->Password = uniqid();

            $db = new DB($fields->database_type);
            $db->CreateDatabase($fields->database_collation, $DB_Obj);

            $db_parent = new DB();
            $sql = $db->newQuery("
                INSERT INTO DB_BY_HOST
                (DB_NAME, DB_TYPE, WEB_DOMAIN, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD)
                VALUES
                (:DB_NAME, :DB_TYPE, :WEB_DOMAIN, :DB_HOST, :DB_PORT, :DB_USER, :DB_PASSWORD)
            ");
            $sql->params->DB_NAME = $DB_Obj->Name;
            $sql->params->DB_TYPE = $fields->database_type;
            $sql->params->WEB_DOMAIN = '';
            $sql->params->DB_HOST = $DB_Obj->Host;
            $sql->params->DB_PORT = $DB_Obj->Port;
            $sql->params->DB_USER = $DB_Obj->User;
            $sql->params->DB_PASSWORD = $DB_Obj->Password;
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
            $client_db = GetDatabaseInfo($fields->DB, $result);
            if($result['code'] !== 0) break;

            $upper_request = strtoupper($fields->Request);

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
            $db = GetDatabaseInfo($fields->Database, $result);
            if($result['code'] !== 0) break;
            $result['Info'] = $db->GetDatabaseInfo();
        break;
        case 'SHOWSECTIONINFO':
            $db = GetDatabaseInfo($fields->Database, $result);
            if($result['code'] != 0) break;
            $result['Info'] = $db->GetSectionData($fields->Section, $fields->Data);
        break;
        case 'GETSLICEFROMTABLE':
            $db = GetDatabaseInfo($fields->Database, $result);
            if($result['code'] !== 0) break;
            $result['Data'] = $db->GetSliceFromTable($fields->Table, $fields->Offset, $fields->ChunkSize);
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