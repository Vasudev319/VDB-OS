<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

requireRole('delivery');

// Pagination settings
$limit = 20;
$page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
if ($page < 1) $page = 1;
$offset = ($page - 1) * $limit;

// Get total count for pagination
$countStmt = $pdo->prepare("SELECT COUNT(*) FROM orders WHERE delivery_staff_id = ?");
$countStmt->execute([$_SESSION['user_id']]);
$totalOrders = $countStmt->fetchColumn();
$totalPages = ceil($totalOrders / $limit);

// Fetch orders with pagination
$stmt = $pdo->prepare("SELECT * FROM orders WHERE delivery_staff_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?");
$stmt->bindValue(1, $_SESSION['user_id'], PDO::PARAM_INT);
$stmt->bindValue(2, $limit, PDO::PARAM_INT);
$stmt->bindValue(3, $offset, PDO::PARAM_INT);
$stmt->execute();
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
            <li>Order #<?= $order['id'] ?> - Status: <?= htmlspecialchars($order['status']) ?></li>
        <?php endforeach; ?>
    </ul>

    <!-- Pagination Controls -->
    <?php if ($totalPages > 1): ?>
    <div class="pagination">
        <?php if ($page > 1): ?>
            <a href="?page=<?= $page - 1 ?>">Previous</a>
        <?php endif; ?>

        <span>Page <?= $page ?> of <?= $totalPages ?></span>

        <?php if ($page < $totalPages): ?>
            <a href="?page=<?= $page + 1 ?>">Next</a>
        <?php endif; ?>
    </div>
    <?php endif; ?>
</body>
</html>
