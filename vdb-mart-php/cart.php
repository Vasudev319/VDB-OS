<?php
require_once 'includes/config.php';
require_once 'includes/functions.php';

// Simple session-based cart for demo
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['product_id'])) {
    $pid = $_POST['product_id'];
    $_SESSION['cart'][$pid] = ($_SESSION['cart'][$pid] ?? 0) + 1;
}

// Fetch products in cart
$cart_products = [];
if (!empty($_SESSION['cart'])) {
    $ids = implode(',', array_keys($_SESSION['cart']));
    $stmt = $pdo->query("SELECT * FROM products WHERE id IN ($ids)");
    $cart_products = $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Shopping Cart - VDB Mart</title>
</head>
<body>
    <h1>Your Cart</h1>
    <a href="index.php">Continue Shopping</a>
    <?php if (empty($cart_products)): ?>
        <p>Cart is empty.</p>
    <?php else: ?>
        <ul>
            <?php
            $total = 0;
            foreach ($cart_products as $p):
                $qty = $_SESSION['cart'][$p['id']];
                $subtotal = $p['price'] * $qty;
                $total += $subtotal;
            ?>
                <li>
                    <?= htmlspecialchars($p['name']) ?>
                    (x<?= $qty ?>) - $<?= number_format($subtotal, 2) ?>
                </li>
            <?php endforeach; ?>
        </ul>
        <h3>Total: $<?= number_format($total, 2) ?></h3>
        <button>Checkout</button>
    <?php endif; ?>
</body>
</html>
