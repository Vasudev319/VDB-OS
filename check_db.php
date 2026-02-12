<?php
require_once 'vdb-mart-php/includes/config.php';

try {
    $stmt = $pdo->query("SELECT 1");
    echo "Database connection successful.\n";
} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage() . "\n";
}
?>
