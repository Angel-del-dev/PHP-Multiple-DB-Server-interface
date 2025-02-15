<?php

require_once("{$_SERVER['DOCUMENT_ROOT']}/interface/php/lib/parse.php");

class DB {
    protected stdClass $env;
    public function __construct() {
        $this->env = Parse::ENV();
    }
}