# Language independent DB connector

**Required**
```php
require_once("{$MountRoute}/php/lib/db.php");
```

**Initialize**

```php
$db = new DB();
```

**Optional parameters**
```php
// Additionally, a DB Language server can be specified
$db = new DB('mysql');
/*
 This functionality allows to execute queries from any language
 server without having to use another class
*/
```

# Example
```php
$db = new DB('mysql');
$query = $db->newQuery('select * from my_table where date = :date');
$query->params->date = current_date;
$data = $query->Execute();
$query->close();
```