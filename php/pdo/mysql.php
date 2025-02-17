<?php

class DBResult {
    protected $stmt;
    public stdClass $params;
    public function __construct($stmt) {
        $this->stmt = $stmt;
        $this->params = new stdClass();
    }

    public function Debug():void {
        $this->stmt->debugDumpParams();
    }

    public function Execute():array {
        $result = $this->stmt->execute((array)$this->params);
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

    public function __destruct() {
        $this->connection = null;
    }
}