<?php

class DBResult {
    protected $stmt;
    public stdClass $params;
    public int $rowCount;
    public function __construct($stmt) {
        $this->stmt = $stmt;
        $this->params = new stdClass();
        $this->rowCount = 0;
    }

    public function Debug():void {
        $this->stmt->debugDumpParams();
    }

    public function Execute():array {
        $result = $this->stmt->execute((array)$this->params);
        $this->rowCount = $this->stmt->rowCount();
        return $this->stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function close() {
        $this->stmt = null;
    }
}

/**
 *   @example:
 *   $db = new MysqlPdo();
 *   $sql = $db->newQuery('select * from test where id = :id');
 *   $sql->params->id = 1;
 *   $data = $sql->Execute();
 *   $sql->close();
 * 
 */

class MysqlPdo {
    protected $connection;
    protected $prepared;
    protected DBResult|null $result;
    public function __construct(
        string $host, string $dbname, string $user, string $password
    ) {
        $qString = sprintf('mysql:host=%s;dbname=%s', $host, $dbname);
        $this->connection = new pdo($qString, $user, $password);
    }

    public function newQuery(string $query):DBResult {
        return new DBResult($this->connection->prepare($query));
    }

    public function GetCharsets():array {
        $charsets = [];

        $sql = $this->newQuery('SHOW CHARACTER SET');
        $data = $sql->Execute();
        $sql->close();

        foreach($data as $charset) {
            $charsets[] = [
                'Charset' => $charset['Charset'],
                'Description' => $charset['Description']
            ];
        }

        return $charsets;
    }

    public function GetCollations():array {
        $collations = [];
        $sql = $this->newQuery('SHOW COLLATION');
        $data = $sql->Execute();
        $sql->close();
       
        foreach($data as $collation) {
            if(!isset($collations[$collation['Charset']])) $collations[$collation['Charset']] = [];
            $collations[$collation['Charset']][] = $collation['Collation'];
        }

        return $collations;
    }

    public function CreateDatabase(string $collation):string {
        $db_name = uniqid();

        $sql = $this->newQuery(sprintf("
            CREATE DATABASE %s COLLATE %s
        ", $db_name, $collation));
        $sql->Execute();
        $sql->close();
        return $db_name;
    }

    public function DropDatabase(string $database):void {
        $sql = $this->newQuery(sprintf("
            DROP DATABASE IF EXISTS %s
        ", $database));
        $sql->Execute();
        $sql->close();
    }

    public function GetCreateDatabasePrefix():string {
        return 'CREATE DATABASE';
    }

    public function GetDropDatabasePrefix():string {
        return 'DROP DATABASE';
    }

    public function CheckUnauthorizedQueryStrings(string $queryString):string {
        $error_msg = '';

        $unauthorizedQueryBits = [
            $this->GetCreateDatabasePrefix() => 'Command "database creation" not allowed',
            $this->GetDropDatabasePrefix() => 'Command "database removal" not allowed',
            'USE' => 'Keyword "USE" is not allowed',
            'SHOW DATABASES' => 'Command "show databases" not allowed',
            'CREATE USER' => 'Command "user creation" not allowed',
            'DROP USER' => 'Command "user removal" not allowed'
        ];

        $queryString = strtoupper($queryString);

        foreach($unauthorizedQueryBits as $queryBit => $message) {
            if(str_contains($queryString, $queryBit)) $error_msg .= "<br />{$message}";
        }

        return $error_msg;
    }

    public function GetAllTables():array {
        $sql = $this->newQuery('SHOW TABLES');
        $Data = $sql->Execute();
        $sql->close();
        $result = [];
        foreach($Data as $row) { $result[] = array_values($row)[0]; }
        return $result;
    }

    public function GetAllProcedures():array {
        $sql = $this->newQuery('SHOW PROCEDURE STATUS');
        $Data = $sql->Execute();
        $sql->close();
        $result = [];
        foreach($Data as $row) $result[] = $row['Name'];
        return $result;
    }

    public function GetAllFunctions():array {
        $sql = $this->newQuery('SHOW FUNCTION STATUS');
        $Data = $sql->Execute();
        $sql->close();
        $result = [];
        foreach($Data as $row) { $result[] = $row['Name']; }
        return $result;
    }

    public function GetAllTriggers():array {
        // ACTION_STATEMENT -> trigger DDL
        $sql = $this->newQuery('
            SELECT TRIGGER_NAME
            FROM INFORMATION_SCHEMA.TRIGGERS
        ');
        $Data = $sql->Execute();
        $sql->close();
        $result = [];
        foreach($Data as $row) { $result[] = $row['TRIGGER_NAME']; }
        return $result;
    }

    public function GetDatabaseInfo():stdClass {
        $Info = new stdClass();
        $Info->Tables = $this->GetAllTables();
        $Info->Procedures = $this->GetAllProcedures();
        $Info->Functions = $this->GetAllFunctions();
        $Info->Triggers = $this->GetAllTriggers();

        return $Info;
    }

    protected function GetDDL(string $section, string $requested_data):string {
        $ddl = '';

        $sql = $this->newQuery(sprintf('
            SHOW CREATE %s %s
        ', $section, $requested_data));
        $Data = $sql->Execute();
        if(count($Data) > 0) {
            $ddl = $Data[0]['Create '.ucfirst(strtolower($section))];
        }

        $sql->close();

        return $ddl;
    }

    public function GetSchema(string $requested_data):stdClass {
        $data = new stdClass();

        $sql = $this->newQuery('
            SELECT T1.COLUMN_NAME, T1.DATA_TYPE, T1.IS_NULLABLE, T1.COLUMN_DEFAULT, T2.TABLE_NAME, T2.CONSTRAINT_NAME, T2.REFERENCED_TABLE_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS T1
            LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE T2 ON T1.TABLE_NAME = T2.TABLE_NAME AND T1.COLUMN_NAME = T2.COLUMN_NAME
            WHERE T1.TABLE_NAME = :TABLE_NAME
            ORDER BY T1.ORDINAL_POSITION ASC 
        ');
        $sql->params->TABLE_NAME = $requested_data;
        $Info = $sql->Execute();
        $sql->close();

        $data->Columns = [
            ['Name' => 'Column Name', 'Type' => 'string'],
            ['Name' => 'Data Type', 'Type' => 'string'],
            ['Name' => 'Is Null', 'Type' => 'string'],
            ['Name' => 'Default Value', 'Type' => 'string'],
        ];
        $data->Data = [];

        foreach($Info as $result) {
            $Col_Name = $result['COLUMN_NAME'];
            if($result['CONSTRAINT_NAME'] !== '') {
                $Color = 'gold';
                $Title = '';
                if($result['CONSTRAINT_NAME'] !== 'PRIMARY') {
                    $Color = 'lightgray';
                    $Title = "Referenced table: {$result['REFERENCED_TABLE_NAME']}";
                }
                $Icon = "<i class='fa-solid fa-key fa-xs' style='color: {$Color};' title='{$Title}'></i>";
                $Col_Name .= $Icon;
                $Col_Name = "<div style='width: fit-content;display: flex; justify-content: flex-start; align-items: center; gap: 5px;'>{$Col_Name}</div>";
            }
            $data->Data[] = [
                $Col_Name,
                $result['DATA_TYPE'],
                $result['IS_NULLABLE'],
                $result['COLUMN_DEFAULT']
            ];
        }

        return $data;
    }

    public function GetSectionData(string $section, string $requested_data):stdClass {
        $data = new stdClass();
        $sections = [ 'TABLES' => 'TABLE', 'PROCEDURES' => 'PROCEDURE', 'FUNCTIONS' => 'FUNCTION'];

        if(in_array(strtoupper($section), ['TABLES'])) $data->SCHEMA = $this->GetSchema($requested_data);
        $data->DDL = $this->GetDDL($sections[strtoupper($section)], $requested_data);
        

        return $data;
    }

    public function __destruct() {
        $this->connection = null;
    }
}