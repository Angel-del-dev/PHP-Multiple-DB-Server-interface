<?php

class Parse {
    public static function ENV():stdClass {
        $data = new stdClass();
        $route = __dir__.'../../../.env';

        if(!file_exists($route)) throw new Error('Enviroment variables are not set, please create them');
        
        $env = explode("\n", file_get_contents($route));


        foreach($env as $parameter) {
            $columns = explode('=', $parameter);
            $column_name = trim($columns[0]);
            $data->$column_name = str_replace('\r', '', trim($columns[1]));
        }

        return $data;
    }

    public static function Request():stdClass {
        $req = json_decode(base64_decode($_REQUEST['id']));
        
        if(!isset($req->fields)) $req->fields = new stdClass();
        
        return $req;
    }
}