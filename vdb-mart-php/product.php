<?php
require_once 'includes/config.php';
require_once 'includes/functions.php';

$id = $_GET['id'] ?? 0;
$stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
$stmt->execute([$id]);
$product = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    die("Product not found.");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?= htmlspecialchars($product['name']) ?> - VDB Mart</title>
</head>
<body>
    <a href="index.php">Back to Home</a>
    <h1><?= htmlspecialchars($product['name']) ?></h1>
    <p>Price: $<?= htmlspecialchars($product['price']) ?></p>
    <p>Stock: <?= htmlspecialchars($product['stock']) ?></p>
    <p><?= nl2br(htmlspecialchars($product['description'] ?? '')) ?></p>

    <form action="cart.php" method="POST">
        <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
        <button type="submit">Add to Cart</button>
    </form>
</body>
</html>
