<?php

require_once("{$_SERVER['DOCUMENT_ROOT']}/interface/php/lib/parse.php");

// TODO restrict command SHOW DATABASES

class DB {
    protected stdClass $env;
    protected string $language_server;
    protected $connection;
    public function __construct(string $language_server = 'mysql') {
        $this->env = Parse::ENV();
        $this->language_server = $language_server;
        $this->setupConnection();
    }
    public function setCredentials(string $dbhost, string $dbname, string $dbuser, string $dbpassword):void {
        $this->env->dbhost = $dbhost;
        $this->env->dbname = $dbname;
        $this->env->dbuser = $dbuser;
        $this->env->dbpassword = $dbpassword;
    }

    public function setConnectionParameter(string $key, string $value):void {
        $this->env->$key = $value;
        $this->setupConnection();
    }

    private function setupConnection() {
        switch(strtoupper($this->language_server)) {
            case 'MYSQL':
                require_once(__DIR__.'../../pdo/mysql.php');
                $this->connection = new MysqlPdo($this->env->dbhost, $this->env->dbname, $this->env->dbuser, $this->env->dbpassword);
            break;
            default:
                throw new Error("The language server '{$this->language_server}' is not supported");
            break;
        }
    }

    public function newQuery(string $query) {
        return $this->connection->newQuery($query);
    }

    // Inner functions
    public function GetCollations() { return $this->connection->GetCollations(); }
    public function GetCharsets() { return $this->connection->GetCharsets(); }
    public function CreateDatabase(string $collation) { return $this->connection->CreateDatabase($collation); }
    public function DropDatabase(string $database) { return $this->connection->DropDatabase($database); }
    public function CheckUnauthorizedQueryStrings(string $queryString):string { return $this->connection->CheckUnauthorizedQueryStrings($queryString); }
    public function GetCreateDatabasePrefix() { return $this->connection->GetCreateDatabasePrefix(); }
    public function GetDropDatabasePrefix() { return $this->connection->GetDropDatabasePrefix(); }
    public function GetDatabaseInfo() { return $this->connection->GetDatabaseInfo(); }
}