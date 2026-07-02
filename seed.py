"""
Run this once to create the database, tables, and seed data.
Usage:  python seed.py
Make sure MySQL is running and the credentials below match app.py
"""
import mysql.connector
from flask_bcrypt import Bcrypt
from flask import Flask

app = Flask(__name__)
bcrypt = Bcrypt(app)

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "nikhil@123"
}

conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor()

cursor.execute("DROP DATABASE IF EXISTS ecommerce")
cursor.execute("CREATE DATABASE ecommerce")
cursor.execute("USE ecommerce")

cursor.execute("""
CREATE TABLE users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         ENUM('admin','customer') DEFAULT 'customer',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

cursor.execute("""
CREATE TABLE categories (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(50) NOT NULL UNIQUE
)
""")

cursor.execute("""
CREATE TABLE products (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    description    TEXT,
    price          DECIMAL(10,2) NOT NULL,
    stock          INT NOT NULL DEFAULT 0,
    category_id    INT,
    image_url      VARCHAR(255),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
)
""")

cursor.execute("""
CREATE TABLE orders (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status       ENUM('Pending','Confirmed','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
    address      TEXT NOT NULL,
    ordered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
""")

cursor.execute("""
CREATE TABLE order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL,
    unit_price  DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
)
""")

# ---------------- Seed users ----------------
admin_pw = bcrypt.generate_password_hash("admin123").decode('utf-8')
customer_pw = bcrypt.generate_password_hash("customer123").decode('utf-8')

cursor.execute("INSERT INTO users (name, email, password, role) VALUES (%s,%s,%s,%s)",
               ("Admin User", "admin@shop.com", admin_pw, "admin"))
cursor.execute("INSERT INTO users (name, email, password, role) VALUES (%s,%s,%s,%s)",
               ("Test Customer", "customer@shop.com", customer_pw, "customer"))

# ---------------- Seed categories ----------------
categories = ["Electronics", "Clothing", "Home & Kitchen", "Books"]
for c in categories:
    cursor.execute("INSERT INTO categories (name) VALUES (%s)", (c,))

# ---------------- Seed 20 products ----------------
products = [
    ("Wireless Mouse", "Ergonomic 2.4GHz wireless mouse", 799.00, 50, 1),
    ("Mechanical Keyboard", "RGB backlit mechanical keyboard", 2499.00, 30, 1),
    ("Bluetooth Headphones", "Over-ear noise cancelling headphones", 3499.00, 25, 1),
    ("USB-C Charger", "65W fast charger", 1299.00, 60, 1),
    ("Smartwatch", "Fitness tracking smartwatch", 4999.00, 20, 1),
    ("Power Bank 10000mAh", "Compact fast-charging power bank", 999.00, 40, 1),
    ("Men's Cotton T-Shirt", "Plain crew neck t-shirt", 499.00, 100, 2),
    ("Women's Denim Jacket", "Classic blue denim jacket", 1899.00, 35, 2),
    ("Running Shoes", "Lightweight breathable running shoes", 2299.00, 45, 2),
    ("Wool Sweater", "Warm winter wool sweater", 1599.00, 30, 2),
    ("Formal Shirt", "Slim fit formal shirt", 899.00, 50, 2),
    ("Non-stick Frying Pan", "28cm non-stick frying pan", 799.00, 40, 3),
    ("Electric Kettle", "1.5L stainless steel kettle", 1199.00, 35, 3),
    ("Knife Set", "5-piece stainless steel knife set", 1499.00, 25, 3),
    ("Blender", "750W multi-purpose blender", 2199.00, 20, 3),
    ("Dinner Set", "16-piece ceramic dinner set", 2999.00, 15, 3),
    ("The Pragmatic Programmer", "Software engineering classic", 599.00, 60, 4),
    ("Clean Code", "A handbook of agile software craftsmanship", 549.00, 55, 4),
    ("Atomic Habits", "Build good habits, break bad ones", 399.00, 80, 4),
    ("Sapiens", "A brief history of humankind", 449.00, 70, 4),
]

for p in products:
    cursor.execute("""
        INSERT INTO products (name, description, price, stock, category_id, image_url)
        VALUES (%s,%s,%s,%s,%s,%s)
    """, (p[0], p[1], p[2], p[3], p[4], ""))

conn.commit()
cursor.close()
conn.close()

print("Database 'ecommerce' created and seeded successfully.")
print("Admin login    -> admin@shop.com / admin123")
print("Customer login -> customer@shop.com / customer123")