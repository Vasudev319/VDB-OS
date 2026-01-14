<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

requireRole('admin');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard - VDB Mart</title>
    <link rel="stylesheet" href="../assets/style.css">
</head>
<body>
    <h1>Admin Dashboard</h1>
    <nav>
        <a href="users.php">Manage Users</a>
        <a href="../logout.php">Logout</a>
    </nav>
    <div class="stats">
        <p>Welcome, Admin!</p>
        <!-- Add statistics queries here -->
    </div>
</body>
</html>
