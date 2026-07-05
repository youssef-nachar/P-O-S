let cart = [];
let discount = 0;

function renderCart(){

const list=document.getElementById("cartItems");

list.innerHTML="";

let subtotal=0;

cart.forEach((item,index)=>{

subtotal+=item.price*item.qty;

list.innerHTML+=`

<li>

<b>${item.name}</b>

<br>

$${item.price}

<div>

<button onclick="changeQty(${index},-1)">-</button>

${item.qty}

<button onclick="changeQty(${index},1)">+</button>

<button onclick="removeItem(${index})">🗑</button>

</div>

</li>

`;

});

const vat=subtotal*0.15;

const total=subtotal+vat-discount;

document.getElementById("subtotal").innerHTML="$"+subtotal.toFixed(2);

document.getElementById("vat").innerHTML="$"+vat.toFixed(2);

document.getElementById("discount").innerHTML="$"+discount.toFixed(2);

document.getElementById("total").innerHTML="$"+total.toFixed(2);

}

function changeQty(index, value){

    const item = cart[index];

    if(value == -1){

        let product = products.find(p => p.name === item.name);

        if(product){
            product.stock++;
        }

        item.qty--;

        if(item.qty <= 0){
            cart.splice(index,1);
        }

    }else{

        let product = products.find(p => p.name === item.name);

        if(!product || product.stock <= 0){
            alert("Out of Stock");
            return;
        }

        product.stock--;
        item.qty++;

    }

    localStorage.setItem("products", JSON.stringify(products));

    saveCart();

    renderCart();
    renderPOS();
    renderStock();
}
function removeItem(index){

    const item = cart[index];

    let product = products.find(p => p.name === item.name);

    if(product){
        product.stock += item.qty;
    }

    cart.splice(index,1);

    localStorage.setItem("products", JSON.stringify(products));

    saveCart();

    renderCart();
    renderPOS();
    renderStock();
}
function applyDiscount(){

let d=prompt("Discount Amount");

discount=Number(d)||0;

renderCart();

}

function filterCategory(category){

const cards=document.querySelectorAll(".card");

cards.forEach(card=>{

if(category==="All"){

card.style.display="block";

return;

}

card.style.display=

card.dataset.category===category

?"block"

:"none";

});

}

document.getElementById("search").addEventListener("keyup",function(){

let value=this.value.toLowerCase();

document.querySelectorAll(".card").forEach(card=>{

card.style.display=

card.dataset.name.toLowerCase().includes(value)

?"block"

:"none";

});

});

function updateClock(){

document.getElementById("clock").innerHTML=

new Date().toLocaleTimeString();

}

setInterval(updateClock,1000);

updateClock();

function openCheckout(){

renderInvoice();

document.getElementById("checkoutModal").style.display="flex";

}

function closeCheckout(){

document.getElementById("checkoutModal").style.display="none";

}

function renderInvoice() {

    let subtotal = 0;
    let rows = "";

    cart.forEach(item => {

        let itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        rows += `
        <tr>
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${itemTotal.toFixed(2)}</td>
        </tr>
        `;

    });

    document.getElementById("invoiceItems").innerHTML = rows;

    let vat = subtotal * 0.15;
    let total = subtotal + vat - discount;

    document.getElementById("invoiceSubtotal").innerHTML = "$" + subtotal.toFixed(2);
    document.getElementById("invoiceVat").innerHTML = "$" + vat.toFixed(2);
    document.getElementById("invoiceDiscount").innerHTML = "$" + discount.toFixed(2);
    document.getElementById("invoiceTotal").innerHTML = "$" + total.toFixed(2);
}
function printInvoice(){

window.print();

}
let salesOrders = JSON.parse(localStorage.getItem("salesOrders")) || [];

function finishSale(){

    let items = [];
    let total = 0;
    let profit = 0;
    let itemsSold = 0;

    cart.forEach(item => {

        let product = products.find(p => p.name === item.name);

        if(product){

            let cost = product.cost || (product.price * 0.6);

            items.push({
                name: item.name,
                qty: item.qty,
                price: item.price
            });

            total += item.qty * item.price;
            profit += item.qty * (item.price - cost);
            itemsSold += item.qty;
        }
    });

    const order = {
        id: "SOD-" + Date.now(),
        date: new Date().toLocaleString(),
        items: items,
        total,
        profit,
        status: "PAID"
    };

    salesOrders.unshift(order);

    localStorage.setItem("salesOrders", JSON.stringify(salesOrders));

    cart = [];
    discount = 0;

    saveCart();

    renderCart();
    renderPOS();
    renderStock();
    renderSales();
    renderSalesOrders();

    document.getElementById("invoiceItems").innerHTML = "";
    closeCheckout();

    alert("Order Completed ✔");
}
function saveCart(){
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("discount", discount);
}
function loadCart(){
    const savedCart = localStorage.getItem("cart");
    const savedDiscount = localStorage.getItem("discount");

    if(savedCart){
        cart = JSON.parse(savedCart);
    }

    if(savedDiscount){
        discount = Number(savedDiscount);
    }

    renderCart();
}
function addToCart(name, price){

    const product = products.find(p => p.name === name);

    if(!product){
        return;
    }

    if(product.stock <= 0){
        alert("Out Of Stock");
        return;
    }

    product.stock--;

    const item = cart.find(i => i.name === name);

    if(item){
        item.qty++;
    }else{
        cart.push({
            name:name,
            price:price,
            qty:1
        });
    }

    localStorage.setItem("products", JSON.stringify(products));

    saveCart();

    renderCart();
    renderPOS();
    renderStock();
}


function showTab(tab, btn) {
document.getElementById("posTab").style.display =
    tab === "pos" ? "grid" : "none";
    document.getElementById("adminTab").style.display =
        tab === "admin" ? "block" : "none";

    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}
let products = JSON.parse(localStorage.getItem("products")) || [];
function addProduct(){
    const name = document.getElementById("pName").value;
    const price = Number(document.getElementById("pPrice").value);
    const category = document.getElementById("pCategory").value;

    if(!name || !price) return;

    products.push({
    name,
    price,
    category,
    stock: Number(document.getElementById("pStock").value) || 0,
    sold: 0
});
    localStorage.setItem("products", JSON.stringify(products));

    renderAdminProducts();
    renderPOS();
    renderStock();
}
function renderAdminProducts(){
    const div = document.getElementById("adminProducts");
    div.innerHTML = "";

    products.forEach((p, i) => {
        div.innerHTML += `
            <div class="admin-card">
                <b>${p.name}</b> - $${p.price} (${p.category})
                <button onclick="deleteProduct(${i})">Delete</button>
            </div>
        `;
    });
}
function deleteProduct(i){
    products.splice(i,1);
    localStorage.setItem("products", JSON.stringify(products));
    renderAdminProducts();
}
function renderPOS(){
    const container = document.getElementById("products");
    container.innerHTML = "";

    products.forEach(p=>{

    container.innerHTML += `
    <div class="card">

        <div class="emoji">🍽</div>

        <h3>${p.name}</h3>

        <p>$${p.price}</p>

        <small>Stock: ${p.stock}</small>

        <button
            ${p.stock==0 ? "disabled" : ""}
            onclick="addToCart('${p.name}',${p.price})">

            ${p.stock==0 ? "Out of Stock" : "Add"}

        </button>

    </div>
    `;

});
}
window.onload = function () {
    loadCart();
    renderPOS();
    renderAdminProducts();
    updateClock();
    renderStock();
    renderSalesOrders();
};
function showTab(tab, btn){

    document.getElementById("posTab").style.display =
        tab=="pos" ? "grid" : "none";

    document.getElementById("adminTab").style.display =
        tab=="admin" ? "block" : "none";

    document.getElementById("stockTab").style.display =
        tab=="stock" ? "block" : "none";

    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");
}

function renderStock(){

    const table = document.getElementById("stockTable");

    table.innerHTML = "";

    products.forEach(product=>{

        let status = "";
        let color = "";

        if(product.stock == 0){

            status = "Out of Stock";
            color = "red";

        }else if(product.stock <= 5){

            status = "Low Stock";
            color = "orange";

        }else{

            status = "In Stock";
            color = "green";

        }

        table.innerHTML += `
        <tr>

            <td>${product.name}</td>

            <td>${product.category}</td>

            <td>$${product.price}</td>

            <td>${product.stock}</td>

            <td style="color:${color};font-weight:bold;">
                ${status}
            </td>

        </tr>
        `;

    });

}
function showTab(tab, btn){

    document.getElementById("posTab").style.display =
        tab=="pos" ? "grid" : "none";

    document.getElementById("adminTab").style.display =
        tab=="admin" ? "block" : "none";

    document.getElementById("stockTab").style.display =
        tab=="stock" ? "block" : "none";

    document.getElementById("salesTab").style.display =
        tab=="sales" ? "block" : "none";

    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");
}

function renderSales(){

    let totalRevenue = 0;
    let totalProfit = 0;
    let itemsSold = 0;

    const table = document.getElementById("salesTable");
    table.innerHTML = "";

    products.forEach(p => {

        let sold = p.sold || 0;

        let revenue = sold * p.price;
        let cost = p.cost || (p.price * 0.6); // افتراضي
        let profit = sold * (p.price - cost);

        totalRevenue += revenue;
        totalProfit += profit;
        itemsSold += sold;

        if(sold > 0){

            table.innerHTML += `
            <tr>
                <td>${p.name}</td>
                <td>${sold}</td>
                <td>$${revenue.toFixed(2)}</td>
                <td>$${profit.toFixed(2)}</td>
            </tr>
            `;
        }
    });

    document.getElementById("totalRevenue").innerHTML =
        "$" + totalRevenue.toFixed(2);

    document.getElementById("totalProfit").innerHTML =
        "$" + totalProfit.toFixed(2);

    document.getElementById("itemsSold").innerHTML =
        itemsSold;

    document.getElementById("totalProducts").innerHTML =
        products.length;
}
function showTab(tab, btn){

    document.getElementById("posTab").style.display =
        tab=="pos" ? "grid" : "none";

    document.getElementById("adminTab").style.display =
        tab=="admin" ? "block" : "none";

    document.getElementById("stockTab").style.display =
        tab=="stock" ? "block" : "none";

    document.getElementById("salesTab").style.display =
        tab=="sales" ? "block" : "none";

    document.getElementById("ordersTab").style.display =
        tab=="orders" ? "block" : "none";

    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");
}
function renderSalesOrders(){

    const table = document.getElementById("ordersTable");

    table.innerHTML = "";

    let totalOrders = salesOrders.length;
    let totalRevenue = 0;
    let totalProfit = 0;
    let itemsSold = 0;

    salesOrders.forEach(order => {

        totalRevenue += order.total;
        totalProfit += order.profit;

        let itemsText = order.items.map(i =>
            `${i.name} x${i.qty}`
        ).join("<br>");

        order.items.forEach(i=>{
            itemsSold += i.qty;
        });

        table.innerHTML += `
        <tr>
            <td>${order.id}</td>
            <td>${order.date}</td>
            <td>${itemsText}</td>
            <td style="color:#22c55e">$${order.total.toFixed(2)}</td>
            <td style="color:#facc15">$${order.profit.toFixed(2)}</td>
            <td><span style="background:#22c55e;padding:4px 8px;border-radius:6px;font-size:12px">PAID</span></td>
        </tr>
        `;
    });

    document.getElementById("totalOrders").innerText = totalOrders;
    document.getElementById("totalRevenue").innerText = "$" + totalRevenue.toFixed(2);
    document.getElementById("totalProfit").innerText = "$" + totalProfit.toFixed(2);
    document.getElementById("itemsSold").innerText = itemsSold;
}
