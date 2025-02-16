# How to run the component
```php
// Require the main.php wherever its located
require_once("{$_SERVER['DOCUMENT_ROOT']}/interface/main.php");
$interface = new DBInterface();
/*
 The MountOn route, is the base route to be able to load the inner scripts, inside the /interface folder, there are css and js files and also images that will be loaded automatically
*/
$interface->MountOn('/interface');
echo $interface->Load();
```