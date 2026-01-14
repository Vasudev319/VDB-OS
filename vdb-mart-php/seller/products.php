<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

requireRole('seller');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'];
    $price = $_POST['price'];
    $stock = $_POST['stock'];
    $seller_id = $_SESSION['user_id'];

    $stmt = $pdo->prepare("INSERT INTO products (seller_id, name, price, stock) VALUES (?, ?, ?, ?)");
    $stmt->execute([$seller_id, $name, $price, $stock]);
}

$stmt = $pdo->prepare("SELECT * FROM products WHERE seller_id = ?");
$stmt->execute([$_SESSION['user_id']]);
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Products - VDB Mart</title>
</head>
<body>
    <h1>My Products</h1>
    <a href="index.php">Back to Dashboard</a>

    <h2>Add Product</h2>
    <form method="POST">
        <input type="text" name="name" placeholder="Product Name" required>
        <input type="number" step="0.01" name="price" placeholder="Price" required>
        <input type="number" name="stock" placeholder="Stock" required>
        <button type="submit">Add</button>
    </form>

    <h2>List</h2>
    <ul>
        <?php foreach ($products as $p): ?>
            <li><?= htmlspecialchars($p['name']) ?> - $<?= htmlspecialchars($p['price']) ?></li>
        <?php endforeach; ?>
    </ul>
</body>
</html>
