<?php
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function redirect($url) {
    header("Location: $url");
    exit();
}

function hasRole($role) {
    return isset($_SESSION['role']) && $_SESSION['role'] === $role;
}

function requireRole($role) {
    if (!isLoggedIn() || !hasRole($role)) {
        redirect('../login.php');
    }
}

function getCartItems($userId = null) {
    global $pdo;
    if ($userId) {
        $stmt = $pdo->prepare("
            SELECT p.id, p.name, p.price, c.quantity, (p.price * c.quantity) as subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        if (!isset($_SESSION['cart']) || empty($_SESSION['cart'])) {
            return [];
        }
        $ids = implode(',', array_map('intval', array_keys($_SESSION['cart'])));
        if (empty($ids)) return [];
        $stmt = $pdo->query("SELECT id, name, price FROM products WHERE id IN ($ids)");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $cartItems = [];
        foreach ($products as $p) {
            $qty = $_SESSION['cart'][$p['id']];
            $cartItems[] = [
                'id' => $p['id'],
                'name' => $p['name'],
                'price' => $p['price'],
                'quantity' => $qty,
                'subtotal' => $p['price'] * $qty
            ];
        }
        return $cartItems;
    }
}

function addToCart($productId, $quantity, $userId = null) {
    global $pdo;
    if ($userId) {
        $stmt = $pdo->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?");
        $stmt->execute([$userId, $productId, $quantity, $quantity]);
    } else {
        if (!isset($_SESSION['cart'])) {
            $_SESSION['cart'] = [];
        }
        $_SESSION['cart'][$productId] = ($_SESSION['cart'][$productId] ?? 0) + $quantity;
    }
}

function removeFromCart($productId, $userId = null) {
    global $pdo;
    if ($userId) {
        $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, $productId]);
    } else {
        if (isset($_SESSION['cart'][$productId])) {
            unset($_SESSION['cart'][$productId]);
        }
    }
}

function updateCartQuantity($productId, $quantity, $userId = null) {
    global $pdo;
    if ($quantity <= 0) {
        removeFromCart($productId, $userId);
        return;
    }
    if ($userId) {
        $stmt = $pdo->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$quantity, $userId, $productId]);
    } else {
        $_SESSION['cart'][$productId] = $quantity;
    }
}

function mergeCart($userId) {
    global $pdo;
    if (isset($_SESSION['cart']) && !empty($_SESSION['cart'])) {
        foreach ($_SESSION['cart'] as $productId => $quantity) {
            // Using addToCart logic to handle potential duplicates in DB
            // However, addToCart increments. If user already has item in DB, session quantity adds to it.
            // This is usually desired behavior.
            addToCart($productId, $quantity, $userId);
        }
        unset($_SESSION['cart']);
    }
}
?>
