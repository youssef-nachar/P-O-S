// ==========================================
// 1. Initial State & Data Setup
// ==========================================
const defaultProducts = [
    { name: "Zaatar Manousheh", emoji: "🌿", price: 1.0, cost: 0.3, stock: 200, category: "Manakish" },
    { name: "Cheese Manousheh", emoji: "🧀", price: 2.5, cost: 1.0, stock: 150, category: "Manakish" },
    { name: "Lahm Bi Ajeen", emoji: "🥩", price: 3.0, cost: 1.3, stock: 100, category: "Manakish" },
    { name: "Kishk Manousheh", emoji: "🥖", price: 1.5, cost: 0.5, stock: 100, category: "Manakish" },
    { name: "Mix Pizza", emoji: "🍕", price: 6.0, cost: 2.5, stock: 50, category: "Pizza" },
    { name: "Cold Cola", emoji: "🥤", price: 1.0, cost: 0.5, stock: 80, category: "Drinks" }
];

let products = JSON.parse(localStorage.getItem("bakery_products")) || defaultProducts;
let cart = JSON.parse(localStorage.getItem("bakery_cart")) || [];
let salesOrders = JSON.parse(localStorage.getItem("bakery_orders")) || [];
let expenses = JSON.parse(localStorage.getItem("bakery_expenses")) || [
    { id: 1, category: "Shop Rent", title: "Monthly Shop Rent", amount: 50, date: new Date().toLocaleDateString() }
];

let discount = 0;
let exchangeRate = Number(localStorage.getItem("bakery_rate")) || 89500;
let currentCategory = "All";

// ==========================================
// 2. Helper Functions
// ==========================================
function formatUSD(amount) {
    return "$" + Number(amount || 0).toFixed(2);
}

function formatLBP(usdAmt) {
    return (Number(usdAmt || 0) * exchangeRate).toLocaleString() + " LBP";
}

function setExchangeRate() {
    let rate = prompt("Enter USD to LBP Exchange Rate:", exchangeRate);
    if (rate && !isNaN(rate)) {
        exchangeRate = Number(rate);
        localStorage.setItem("bakery_rate", exchangeRate);
        document.getElementById("rateBtn").innerText = exchangeRate.toLocaleString() + " LBP";
        updateAllViews();
    }
}

// ==========================================
// 3. Navigation & Tab Switching
// ==========================================
function showTab(tabId, btn) {
    document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));

    if (tabId === "pos") document.getElementById("posTab").style.display = "grid";
    else document.getElementById(tabId + "Tab").style.display = "block";

    if (btn) btn.classList.add("active");
    updateAllViews();
}

// ==========================================
// 4. POS & Products Display
// ==========================================
function filterCategory(cat) {
    currentCategory = cat;
    renderPOS();
}

function filterProducts() {
    let query = document.getElementById("search").value.toLowerCase();
    renderPOS(query);
}

function renderPOS(searchQuery = "") {
    const container = document.getElementById("products");
    container.innerHTML = "";

    products.forEach(p => {
        let matchesCategory = (currentCategory === "All" || p.category === currentCategory);
        let matchesSearch = p.name.toLowerCase().includes(searchQuery);

        if (matchesCategory && matchesSearch) {
            container.innerHTML += `
                <div class="card" data-category="${p.category}" data-name="${p.name}">
                    <div class="emoji">${p.emoji || '🥖'}</div>
                    <h3>${p.name}</h3>
                    <p>${formatUSD(p.price)}</p>
                    <button onclick="addToCart('${p.name}')" ${p.stock <= 0 ? 'disabled style="background:#ccc;"' : ''}>
                        ${p.stock <= 0 ? 'Out of Stock' : 'Add'}
                    </button>
                </div>
            `;
        }
    });
}

// ==========================================
// 5. Cart Management
// ==========================================
function addToCart(name) {
    let prod = products.find(p => p.name === name);
    if (!prod || prod.stock <= 0) return;

    prod.stock--;
    let cartItem = cart.find(i => i.name === name);

    if (cartItem) {
        cartItem.qty++;
    } else {
        cart.push({ name: prod.name, price: prod.price, cost: prod.cost, qty: 1 });
    }

    saveState();
    updateAllViews();
}

function renderCart() {
    const cartList = document.getElementById("cartItems");
    cartList.innerHTML = "";
    let subtotal = 0;

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        cartList.innerHTML += `
            <li>
                <div style="display:flex; justify-style:space-between; align-items:center;">
                    <div>
                        <b>${item.name}</b><br>
                        <small>${formatUSD(item.price)} × ${item.qty}</small>
                    </div>
                    <div>
                        <button onclick="changeQty(${index}, 1)">+</button>
                        <button onclick="changeQty(${index}, -1)">-</button>
                    </div>
                </div>
            </li>
        `;
    });

    let finalTotal = subtotal - discount;
    if (finalTotal < 0) finalTotal = 0;

    document.getElementById("subtotal").innerText = formatUSD(subtotal);
    document.getElementById("discount").innerText = formatUSD(discount);
    document.getElementById("total").innerText = formatUSD(finalTotal);
    document.getElementById("totalLBP").innerText = formatLBP(finalTotal);
}

function changeQty(index, delta) {
    let item = cart[index];
    let prod = products.find(p => p.name === item.name);

    if (delta === 1) {
        if (prod.stock <= 0) return alert("Not enough stock!");
        prod.stock--;
        item.qty++;
    } else {
        prod.stock++;
        item.qty--;
        if (item.qty <= 0) cart.splice(index, 1);
    }

    saveState();
    updateAllViews();
}

function applyDiscount() {
    let d = prompt("Enter Discount Amount ($):", discount);
    discount = Number(d) || 0;
    renderCart();
}

// ==========================================
// 6. Checkout & Invoice
// ==========================================
function openCheckout() {
    if (cart.length === 0) return alert("Cart is empty!");

    let subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    let total = subtotal - discount;

    const invoiceTable = document.getElementById("invoiceItems");
    invoiceTable.innerHTML = "";

    cart.forEach(item => {
        invoiceTable.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${formatUSD(item.price)}</td>
                <td>${formatUSD(item.price * item.qty)}</td>
            </tr>
        `;
    });
 document.getElementById("invoiceOrderNo").innerText = "#ORD-" + Date.now().toString().slice(-4); document.getElementById("invoiceDate").innerText = new Date().toLocaleDateString();
    document.getElementById("invoiceSubtotal").innerText = formatUSD(subtotal);
    document.getElementById("invoiceDiscount").innerText = formatUSD(discount);
    document.getElementById("invoiceTotal").innerText = formatUSD(total);
    document.getElementById("invoiceTotalLBP").innerText = formatLBP(total);

    document.getElementById("checkoutModal").style.display = "flex";
}

function closeCheckout() {
    document.getElementById("checkoutModal").style.display = "none";
}

function finishSale() {
    let subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    let totalUSD = subtotal - discount;
    let totalCostUSD = cart.reduce((sum, i) => sum + (i.cost * i.qty), 0);

    const order = {
        id: "ORD-" + Date.now().toString().slice(-4),
        date: new Date().toLocaleString(),
        items: [...cart],
        total: totalUSD,
        cost: totalCostUSD
    };

    salesOrders.unshift(order);
    cart = [];
    discount = 0;

    localStorage.setItem("bakery_orders", JSON.stringify(salesOrders));
    saveState();
    updateAllViews();
    closeCheckout();
    alert("Sale completed successfully!");
}

// ==========================================
// 7. Sales, Expenses & Financial Reporting
// ==========================================
function addExpense() {
    let category = document.getElementById("expCategory").value;
    let title = document.getElementById("expTitle").value.trim();
    let amount = Number(document.getElementById("expAmount").value);

    if (!title || !amount || amount <= 0) {
        return alert("Please enter valid expense details.");
    }

    expenses.unshift({
        id: Date.now(),
        category,
        title,
        amount,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem("bakery_expenses", JSON.stringify(expenses));
    document.getElementById("expTitle").value = "";
    document.getElementById("expAmount").value = "";
    renderFinancials();
}

function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem("bakery_expenses", JSON.stringify(expenses));
    renderFinancials();
}

function renderFinancials() {
    // 1. إجمالي المبيعات (Revenue)
    let totalRevenue = salesOrders.reduce((sum, o) => sum + o.total, 0);

    // 2. تكلفة المواد المباعة فقط (Cost of Goods Sold - COGS)
    let totalCOGS = salesOrders.reduce((sum, o) => sum + o.cost, 0);

    // 3. مجمل الربح من البضاعة (Gross Profit)
    let grossProfit = totalRevenue - totalCOGS;

    // 4. المصاريف التشغيلية الثابتة فقط (إيجار، كهرباء...)
    let totalOperationalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 5. صافي الربح الحقيقي (Net Profit)
    let netProfit = grossProfit - totalOperationalExpenses;

    // تحديث الواجهة (أرقام واضحة ومفصلة)
    if (document.getElementById("totalRevenue")) 
        document.getElementById("totalRevenue").innerText = formatUSD(totalRevenue);

    // تعرض فقط المصاريف التشغيلية (مثل الإيجار) بدون تكلفة المواد
    if (document.getElementById("totalExpenses")) 
        document.getElementById("totalExpenses").innerText = formatUSD(totalOperationalExpenses);

    // إظهار صافي الربح النهائـي
    if (document.getElementById("totalProfit")) 
        document.getElementById("totalProfit").innerText = formatUSD(netProfit);

    // (اختياري) إذا كان لديك عنصر لمجمل الربح Gross Profit في الـ HTML
    if (document.getElementById("grossProfit")) 
        document.getElementById("grossProfit").innerText = formatUSD(grossProfit);

    if (document.getElementById("totalOrders")) 
        document.getElementById("totalOrders").innerText = salesOrders.length;

    // Render Expenses Log
    const expTbody = document.getElementById("expensesTable");
    if (expTbody) {
        expTbody.innerHTML = "";
        expenses.forEach(e => {
            expTbody.innerHTML += `
                <tr>
                    <td>${e.date}</td>
                    <td><b>${e.category}</b></td>
                    <td>${e.title}</td>
                    <td style="color:#f43f5e; font-weight:bold;">${formatUSD(e.amount)}</td>
                    <td>${formatLBP(e.amount)}</td>
                    <td><button onclick="deleteExpense(${e.id})" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button></td>
                </tr>
            `;
        });
    }

    // Render Orders Log
    const ordersTbody = document.getElementById("ordersTable");
    if (ordersTbody) {
        ordersTbody.innerHTML = "";
        salesOrders.forEach(o => {
            let itemsStr = o.items.map(i => `${i.name} (${i.qty})`).join(", ");
            ordersTbody.innerHTML += `
                <tr>
                    <td>${o.id}</td>
                    <td>${o.date}</td>
                    <td>${itemsStr}</td>
                    <td style="color:#22c55e; font-weight:bold;">${formatUSD(o.total)}</td>
                    <td>${formatLBP(o.total)}</td>
                </tr>
            `;
        });
    }
}


// ==========================================
// 8. Admin & Stock Management
// ==========================================
function renderAdminProducts() {
    const container = document.getElementById("adminProducts");
    container.innerHTML = "";

    products.forEach((p, index) => {
        container.innerHTML += `
            <div class="admin-card">
                <div class="info">
                    <span class="name">${p.emoji || '🥖'} ${p.name}</span>
                    <span class="category">${p.category} | Cost: ${formatUSD(p.cost)} | Stock: ${p.stock}</span>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <span class="price">${formatUSD(p.price)}</span>
                    <button class="delete-btn" onclick="deleteProduct(${index})">Delete</button>
                </div>
            </div>
        `;
    });
}

function renderStockTable() {
    const tbody = document.getElementById("stockTable");
    tbody.innerHTML = "";

    products.forEach(p => {
        let status = p.stock > 20 ? '<span style="color:#22c55e">In Stock</span>' : '<span style="color:#ef4444">Low Stock</span>';
        tbody.innerHTML += `
            <tr>
                <td><b>${p.name}</b></td>
                <td>${p.category}</td>
                <td>${formatUSD(p.price)}</td>
                <td>${formatUSD(p.cost)}</td>
                <td>${p.stock}</td>
                <td>${status}</td>
            </tr>
        `;
    });
}

function addProduct() {
    let name = document.getElementById("pName").value.trim();
    let emoji = document.getElementById("pEmoji").value.trim() || "🥖";
    let price = Number(document.getElementById("pPrice").value);
    let cost = Number(document.getElementById("pCost").value) || 0;
    let stock = Number(document.getElementById("pStock").value) || 100;
    let category = document.getElementById("pCategory").value;

    if (!name || !price) return alert("Please enter product name and price!");

    products.push({ name, emoji, price, cost, stock, category });
    localStorage.setItem("bakery_products", JSON.stringify(products));

    document.getElementById("pName").value = "";
    document.getElementById("pEmoji").value = "";
    document.getElementById("pPrice").value = "";
    document.getElementById("pCost").value = "";
    updateAllViews();
}

function deleteProduct(index) {
    products.splice(index, 1);
    localStorage.setItem("bakery_products", JSON.stringify(products));
    updateAllViews();
}

// ==========================================
// 9. Sync & Clock Initialization
// ==========================================
function saveState() {
    localStorage.setItem("bakery_products", JSON.stringify(products));
    localStorage.setItem("bakery_cart", JSON.stringify(cart));
}

function updateAllViews() {
    renderPOS();
    renderCart();
    renderAdminProducts();
    renderStockTable();
    renderFinancials();
}

window.onload = function () {
    document.getElementById("rateBtn").innerText = exchangeRate.toLocaleString() + " LBP";
    updateAllViews();

    setInterval(() => {
        let clockEl = document.getElementById("clock");
        if (clockEl) clockEl.innerText = new Date().toLocaleTimeString();
    }, 1000);
};
