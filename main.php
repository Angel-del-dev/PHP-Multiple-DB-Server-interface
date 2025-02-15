<?php

class DBInterface {
    protected string $mount_route;
    protected string $app_id;

    public function __construct() {
        $this->mount_route = '';
        $this->app_id = uniqid();
    }
    public function __destruct() {}

    public function MountOn(string $mount_route) {
        $this->mount_route = $mount_route;
    }

    public function Load():string {
        if($this->mount_route === '') {
            throw new Error('DBInterface could not be loaded, "missing mount route"');
        }
        $html = "
            <link rel='stylesheet' href='{$this->mount_route}/css/variables.css'>
            <link rel='stylesheet' href='{$this->mount_route}/css/interface.css'>
            <script type='module' defer>
                import { Main } from '{$this->mount_route}/js/interface.js';
                Main({ MountRoute: `{$this->mount_route}`, AppId: `{$this->app_id}` });
            </script>
            <div id='{$this->app_id}_container' class='dbinterface__maincontainer'>
                <section id='{$this->app_id}_db_selector' class='dbinterface__db_selector'>
                </section>
                <section id='{$this->app_id}_db_manager' class='dbinterface__db_manager'>
                </section>
            </div>
        ";

        return $html;
    }
}