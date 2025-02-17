<?php

require_once("{$_SERVER['DOCUMENT_ROOT']}/interface/php/lib/parse.php");

class DB {
    protected stdClass $env;
    protected string $language_server;
    protected $connection;
    public function __construct(string $language_server = 'mysql') {
        $this->env = Parse::ENV();
        $this->language_server = $language_server;
        $this->setupConnection();
    }
    public function setCredentials(string $dbhost, string $dbname, string $dbuser, string $dbpassword) {
        $this->env->dbhost = $dbhost;
        $this->env->dbname = $dbname;
        $this->env->dbuser = $dbuser;
        $this->env->dbpassword = $dbpassword;
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
}