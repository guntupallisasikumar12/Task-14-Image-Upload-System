import os
import uuid
from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
app.secret_key = "change-this-secret-key"
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
bcrypt = Bcrypt(app)

# DB CONNECTION
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "nikhil@123",
    "database": "ecommerce"
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

# UPLOAD CONFIG (Task 14)
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename):
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    return ext in ALLOWED_EXTENSIONS


# AUTH ROUTES

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    if cursor.fetchone():
        cursor.close(); db.close()
        return jsonify({"error": "Email already registered"}), 400

    cursor.execute(
        "INSERT INTO users (name, email, password, role) VALUES (%s,%s,%s,%s)",
        (name, email, hashed_pw, 'customer')
    )
    db.commit()
    user_id = cursor.lastrowid
    cursor.close(); db.close()

    session['user_id'] = user_id
    session['role'] = 'customer'
    return jsonify({"id": user_id, "name": name, "email": email, "role": "customer"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    cursor.close(); db.close()

    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid email or password"}), 401

    session['user_id'] = user['id']
    session['role'] = user['role']
    return jsonify({
        "id": user['id'], "name": user['name'],
        "email": user['email'], "role": user['role']
    }), 200


@app.route('/api/logout', methods=['GET'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200


@app.route('/api/me', methods=['GET'])
def me():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, name, email, role FROM users WHERE id=%s", (session['user_id'],))
    user = cursor.fetchone()
    cursor.close(); db.close()
    return jsonify(user), 200


def login_required():
    return 'user_id' in session


def admin_required():
    return session.get('role') == 'admin'


# PRODUCT ROUTES (public)
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    search = request.args.get('search')
    sort = request.args.get('sort')

    query = """
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    """
    params = []

    if category:
        query += " AND p.category_id = %s"
        params.append(category)
    if search:
        query += " AND p.name LIKE %s"
        params.append(f"%{search}%")

    if sort == 'price_asc':
        query += " ORDER BY p.price ASC"
    elif sort == 'price_desc':
        query += " ORDER BY p.price DESC"
    elif sort == 'newest':
        query += " ORDER BY p.created_at DESC"

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(query, params)
    products = cursor.fetchall()
    cursor.close(); db.close()
    return jsonify(products), 200


@app.route('/api/products/<int:pid>', methods=['GET'])
def get_product(pid):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.*, c.name AS category_name
        FROM products p LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id=%s
    """, (pid,))
    product = cursor.fetchone()
    cursor.close(); db.close()

    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product), 200


@app.route('/api/categories', methods=['GET'])
def get_categories():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM categories")
    cats = cursor.fetchall()
    cursor.close(); db.close()
    return jsonify(cats), 200


# PRODUCT ROUTES (admin only)
@app.route('/api/products', methods=['POST'])
def create_product():
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO products (name, description, price, stock, category_id, image_url)
        VALUES (%s,%s,%s,%s,%s,%s)
    """, (
        data['name'], data.get('description', ''), data['price'],
        data['stock'], data.get('category_id'), data.get('image_url', '')
    ))
    db.commit()
    new_id = cursor.lastrowid
    cursor.close(); db.close()
    return jsonify({"id": new_id, "message": "Product created"}), 201


@app.route('/api/products/<int:pid>', methods=['PUT'])
def update_product(pid):
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        UPDATE products SET name=%s, description=%s, price=%s,
        stock=%s, category_id=%s, image_url=%s WHERE id=%s
    """, (
        data['name'], data.get('description', ''), data['price'],
        data['stock'], data.get('category_id'), data.get('image_url', ''), pid
    ))
    db.commit()
    cursor.close(); db.close()
    return jsonify({"message": "Product updated"}), 200


@app.route('/api/products/<int:pid>', methods=['DELETE'])
def delete_product(pid):
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM products WHERE id=%s", (pid,))
    db.commit()
    cursor.close(); db.close()
    return jsonify({"message": "Product deleted"}), 200


# ORDER ROUTES (customer)
@app.route('/api/orders', methods=['POST'])
def create_order():
    if not login_required():
        return jsonify({"error": "Login required"}), 401

    data = request.get_json()
    items = data.get('items', [])
    address = data.get('address')

    if not items or not address:
        return jsonify({"error": "Items and address are required"}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Step 1: validate stock for every item BEFORE making changes
    total_amount = 0
    validated_items = []
    for item in items:
        cursor.execute("SELECT * FROM products WHERE id=%s", (item['product_id'],))
        product = cursor.fetchone()
        if not product:
            cursor.close(); db.close()
            return jsonify({"error": f"Product {item['product_id']} not found"}), 400
        if product['stock'] < item['quantity']:
            cursor.close(); db.close()
            return jsonify({"error": f"Insufficient stock for {product['name']}"}), 400
        total_amount += float(product['price']) * item['quantity']
        validated_items.append((product, item['quantity']))

    # Step 2: create order
    cursor.execute(
        "INSERT INTO orders (user_id, total_amount, status, address) VALUES (%s,%s,%s,%s)",
        (session['user_id'], total_amount, 'Pending', address)
    )
    db.commit()
    order_id = cursor.lastrowid

    # Step 3: create order_items and reduce stock (only after validation passed)
    for product, qty in validated_items:
        cursor.execute(
            "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (%s,%s,%s,%s)",
            (order_id, product['id'], qty, product['price'])
        )
        cursor.execute(
            "UPDATE products SET stock = stock - %s WHERE id=%s",
            (qty, product['id'])
        )
    db.commit()
    cursor.close(); db.close()

    return jsonify({"order_id": order_id, "total_amount": total_amount, "message": "Order placed"}), 201


@app.route('/api/orders/my', methods=['GET'])
def my_orders():
    if not login_required():
        return jsonify({"error": "Login required"}), 401

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM orders WHERE user_id=%s ORDER BY ordered_at DESC", (session['user_id'],))
    orders = cursor.fetchall()

    for order in orders:
        cursor.execute("""
            SELECT oi.*, p.name AS product_name
            FROM order_items oi JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id=%s
        """, (order['id'],))
        order['items'] = cursor.fetchall()

    cursor.close(); db.close()
    return jsonify(orders), 200


# =================================================
# ORDER ROUTES (admin)
# =================================================
@app.route('/api/orders', methods=['GET'])
def all_orders():
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT o.*, u.name AS customer_name
        FROM orders o JOIN users u ON o.user_id = u.id
        ORDER BY o.ordered_at DESC
    """)
    orders = cursor.fetchall()

    for order in orders:
        cursor.execute("""
            SELECT oi.*, p.name AS product_name
            FROM order_items oi JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id=%s
        """, (order['id'],))
        order['items'] = cursor.fetchall()

    cursor.close(); db.close()
    return jsonify(orders), 200


@app.route('/api/orders/<int:oid>/status', methods=['PUT'])
def update_order_status(oid):
    if not admin_required():
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    status = data.get('status')
    valid_statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
    if status not in valid_statuses:
        return jsonify({"error": "Invalid status"}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE orders SET status=%s WHERE id=%s", (status, oid))
    db.commit()
    cursor.close(); db.close()
    return jsonify({"message": "Status updated"}), 200


# =================================================
# IMAGE UPLOAD ROUTE (Task 14)
# =================================================
@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    ext = file.filename.rsplit('.', 1)[-1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_name)
    file.save(filepath)

    image_url = f"/static/uploads/{unique_name}"
    return jsonify({"image_url": image_url}), 201


if __name__ == '__main__':
    app.run(debug=True, port=5000)