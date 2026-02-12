<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

requireRole('admin');

// Pagination settings
$limit = 10;
$page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
if ($page < 1) $page = 1;
$offset = ($page - 1) * $limit;

// Get total number of users
$count_stmt = $pdo->query("SELECT COUNT(*) FROM users");
$total_users = $count_stmt->fetchColumn();
$total_pages = ceil($total_users / $limit);

// Ensure page is within valid range
if ($page > $total_pages && $total_pages > 0) {
    $page = $total_pages;
    $offset = ($page - 1) * $limit;
}

// Fetch users for the current page
$stmt = $pdo->prepare("SELECT * FROM users LIMIT :limit OFFSET :offset");
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Manage Users - VDB Mart</title>
    <style>
        .pagination { margin-top: 20px; }
        .pagination a, .pagination span { padding: 8px 16px; text-decoration: none; border: 1px solid #ddd; color: black; margin: 0 4px; }
        .pagination a:hover { background-color: #ddd; }
        .pagination .active { background-color: #4CAF50; color: white; border: 1px solid #4CAF50; }
    </style>
</head>
<body>
    <h1>Manage Users</h1>
    <a href="index.php">Back to Dashboard</a>
    <br><br>
    <table border="1" cellpadding="10" cellspacing="0">
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($users as $user): ?>
            <tr>
                <td><?= htmlspecialchars($user['id']) ?></td>
                <td><?= htmlspecialchars($user['name']) ?></td>
                <td><?= htmlspecialchars($user['email']) ?></td>
                <td><?= htmlspecialchars($user['role']) ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div class="pagination">
        <?php if ($page > 1): ?>
            <a href="?page=<?= $page - 1 ?>">&laquo; Prev</a>
        <?php endif; ?>

        <?php
        // Simple pagination with ellipses
        $range = 2;
        for ($i = 1; $i <= $total_pages; $i++) {
            if ($i == 1 || $i == $total_pages || ($i >= $page - $range && $i <= $page + $range)) {
                if ($i == $page) {
                    echo '<span class="active">' . $i . '</span>';
                } else {
                    echo '<a href="?page=' . $i . '">' . $i . '</a>';
                }
            } elseif ($i == $page - $range - 1 || $i == $page + $range + 1) {
                echo '<span>...</span>';
            }
        }
        ?>

        <?php if ($page < $total_pages): ?>
            <a href="?page=<?= $page + 1 ?>">Next &raquo;</a>
        <?php endif; ?>
    </div>
</body>
</html>
