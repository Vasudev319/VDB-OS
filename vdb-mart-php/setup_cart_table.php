<?php
require 'includes/config.php';

$sql = file_get_contents('sql/cart.sql');

try {
    $pdo->exec($sql);
    echo "Cart table created successfully.\n";
} catch (PDOException $e) {
    echo "Error creating cart table: " . $e->getMessage() . "\n";
}
?>
