<?php

class Parse {
    public static function ENV() {
        // TODO Add controls for the .env
        $env = file_get_contents(__dir__.'../../../.env');
        print_r($env);
    }
}