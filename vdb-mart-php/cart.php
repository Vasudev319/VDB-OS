<?php
require_once 'includes/config.php';
require_once 'includes/functions.php';

$userId = isLoggedIn() ? $_SESSION['user_id'] : null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['product_id'])) {
    $pid = $_POST['product_id'];
    // Default quantity to 1 if not specified (for add)
    $qty = isset($_POST['quantity']) ? (int)$_POST['quantity'] : 1;

    // Check for action (add, update, remove)
    if (isset($_POST['action']) && $_POST['action'] === 'remove') {
        removeFromCart($pid, $userId);
    } elseif (isset($_POST['action']) && $_POST['action'] === 'update') {
        updateCartQuantity($pid, $qty, $userId);
    } else {
        // Default action is add (increment)
        addToCart($pid, $qty, $userId);
    }
}

$cart_products = getCartItems($userId);
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
                $total += $p['subtotal'];
            ?>
                <li>
                    <?= htmlspecialchars($p['name']) ?>
                    (x<?= $p['quantity'] ?>) - $<?= number_format($p['subtotal'], 2) ?>
                    <form method="POST" style="display:inline;">
                        <input type="hidden" name="product_id" value="<?= $p['id'] ?>">
                        <input type="hidden" name="action" value="remove">
                        <button type="submit">Remove</button>
                    </form>
                </li>
            <?php endforeach; ?>
        </ul>
        <h3>Total: $<?= number_format($total, 2) ?></h3>
        <button>Checkout</button>
    <?php endif; ?>
</body>
</html>
