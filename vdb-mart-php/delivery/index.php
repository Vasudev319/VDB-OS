<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

requireRole('delivery');

$stmt = $pdo->prepare("SELECT * FROM orders WHERE delivery_staff_id = ?");
$stmt->execute([$_SESSION['user_id']]);
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Delivery Dashboard - VDB Mart</title>
</head>
<body>
    <h1>Delivery Dashboard</h1>
    <a href="../logout.php">Logout</a>
    <h2>My Deliveries</h2>
    <ul>
        <?php foreach ($orders as $order): ?>
            <li>Order #<?= $order['id'] ?> - Status: <?= $order['status'] ?></li>
        <?php endforeach; ?>
    </ul>
</body>
</html>
