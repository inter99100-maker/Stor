<?php
/**
 * Alladin.pk Database Configuration File
 * Real, production-ready secure database connection using PDO.
 * Protected against SQL injections by enforcing Prepared Statements.
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'alladin_db');
define('DB_CHARSET', 'utf8mb4');

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Throw exceptions on error
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Fetch associative arrays
        PDO::ATTR_EMULATE_PREPARES   => false,                  // Disable emulation of prepared statements
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
} catch (\PDOException $e) {
    // Hide delicate database credentials in production
    error_log("Database Connection Failed: " . $e->getMessage());
    die("An error occurred while connecting to the store database. Please check your configurations.");
}
?>
