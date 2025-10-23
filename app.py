from flask import Flask, render_template, jsonify, request, session, url_for
import json, os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret")

DATA_PATH = os.path.join(app.static_folder, "assets", "data", "products.json")

CATEGORIES_PATH = os.path.join(app.static_folder, "assets", "data", "categories.json")

def load_categories():
    with open(CATEGORIES_PATH, encoding="utf-8") as f:
        return json.load(f)

@app.context_processor
def inject_nav_categories():
    return {"nav_categories": load_categories()}


def load_products():
    with open(DATA_PATH, encoding="utf-8") as f:
        return json.load(f)

def cart_state():
    cart = session.get("cart", {})
    items = []
    products = {str(p["id"]): p for p in load_products()}
    for pid, qty in cart.items():
        p = products.get(str(pid))
        if not p:
            continue
        items.append({
            "id": p["id"],
            "title": p["title"],
            "price": float(p["price"]),
            "image": p.get("image", ""),
            "qty": int(qty),
        })
    total = sum(i["price"]*i["qty"] for i in items)
    count = sum(i["qty"] for i in items)
    return {"items": items, "total": round(total, 2), "count": count}

@app.route("/")
def home():
    products = load_products()
    return render_template("pages/home.html", products=products)


@app.route("/shop")
def shop():
    q = request.args.get("q","").lower().strip()
    cat = request.args.get("cat","").strip()
    sub = request.args.get("sub","").strip()
    products = load_products()
    if q:
        products = [p for p in products if q in p["title"].lower() or q in (p.get("description","").lower())]
    if cat:
        products = [p for p in products if p.get("category")==cat]
    if sub:
        products = [p for p in products if p.get("subcategory")==sub]
    return render_template("pages/shop.html", products=products, selected_cat=cat, selected_sub=sub)


@app.route("/product/<int:pid>")
def product_page(pid):
    products = load_products()
    #print("Productos cargados:", len(products))
    #print(pid)
    #for p in products:
    #    print(p)

    prod = next((p for p in products if int(p["id"]) == pid), None)


    if not prod:
        #return render_template("pages/shop.html", products=products), 404
        return "<h2>Producto no encontrado</h2>", 404

    return render_template("pages/product.html", product=prod)





@app.route("/cart")
def cart_page():
    return render_template("pages/cart.html")

@app.route("/checkout")
def checkout_page():
    return render_template("pages/checkout.html")

@app.route("/about")
def about():
    return render_template("pages/about.html")

@app.route("/contact")
def contact():
    return render_template("pages/contact.html")

@app.route("/become-seller")
def become_seller():
    return render_template("pages/become-seller.html")

@app.get("/api/cart")
def api_cart():
    return jsonify(cart_state())

@app.post("/api/cart/add")
def api_cart_add():
    data = request.get_json(force=True)
    pid = str(data.get("id"))
    qty = int(data.get("qty") or 1)
    cart = session.get("cart", {})
    cart[pid] = int(cart.get(pid, 0)) + qty
    session["cart"] = cart
    session.modified = True
    return jsonify(cart_state())

@app.post("/api/cart/remove")
def api_cart_remove():
    data = request.get_json(force=True)
    pid = str(data.get("id"))
    cart = session.get("cart", {})
    if pid in cart:
        cart.pop(pid)
    session["cart"] = cart
    session.modified = True
    return jsonify(cart_state())

@app.post("/api/cart/clear")
def api_cart_clear():
    session["cart"] = {}
    session.modified = True
    return jsonify(cart_state())

if __name__ == "__main__":
    app.run(debug=True)