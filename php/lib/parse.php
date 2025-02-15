<?php

class Parse {
    public static function ENV():stdClass {
        $data = new stdClass();
        // TODO Add controls for the .env
        $env = explode("\n", file_get_contents(__dir__.'../../../.env'));


        foreach($env as $parameter) {
            $columns = explode('=', $parameter);
            $column_name = trim($columns[0]);
            $data->$column_name = str_replace('\r', '', trim($columns[1]));
        }

        return $data;
    }
}