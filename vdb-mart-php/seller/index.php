<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

requireRole('seller');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Seller Dashboard - VDB Mart</title>
</head>
<body>
    <h1>Seller Dashboard</h1>
    <nav>
        <a href="products.php">My Products</a>
        <a href="../logout.php">Logout</a>
    </nav>
</body>
</html>
