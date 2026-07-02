let cart = [];
let discount = 0;

function addToCart(name, price){

const item = cart.find(p=>p.name===name);

if(item){

item.qty++;

}else{

cart.push({
name,
price,
qty:1
});

}

renderCart();

}

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

function changeQty(index,value){

cart[index].qty+=value;

if(cart[index].qty<=0){

cart.splice(index,1);

}

renderCart();

}

function removeItem(index){

cart.splice(index,1);

renderCart();

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
function finishSale(){
    alert("Order Saved Successfully");

    cart = [];
    discount = 0;

    saveCart();
    renderCart();

    document.getElementById("invoiceItems").innerHTML = "";

    closeCheckout();
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

const item = cart.find(p=>p.name===name);

if(item){
    item.qty++;
}else{
    cart.push({ name, price, qty:1 });
}

saveCart();
renderCart();
}
function changeQty(index,value){
    cart[index].qty += value;

    if(cart[index].qty <= 0){
        cart.splice(index,1);
    }

    saveCart();
    renderCart();
}
function removeItem(index){
    cart.splice(index,1);
    saveCart();
    renderCart();
}
function applyDiscount(){
    let d = prompt("Discount Amount");
    discount = Number(d) || 0;

    saveCart();
    renderCart();
}
window.onload = function(){
    loadCart();
};
function showTab(tab){
    document.getElementById("posTab").style.display = tab === "pos" ? "block" : "none";
    document.getElementById("adminTab").style.display = tab === "admin" ? "block" : "none";

    document.querySelectorAll(".tab").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");
}
let products = JSON.parse(localStorage.getItem("products")) || [];
function addProduct(){
    const name = document.getElementById("pName").value;
    const price = Number(document.getElementById("pPrice").value);
    const category = document.getElementById("pCategory").value;

    if(!name || !price) return;

    products.push({ name, price, category });

    localStorage.setItem("products", JSON.stringify(products));

    renderAdminProducts();
    renderPOS();
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

    products.forEach(p => {
        container.innerHTML += `
            <div class="card" data-category="${p.category}" data-name="${p.name}">
                <div class="emoji">🍽</div>
                <h3>${p.name}</h3>
                <p>$${p.price}</p>
                <button onclick="addToCart('${p.name}',${p.price})">Add</button>
            </div>
        `;
    });
}
window.onload = function(){
    renderPOS();
    renderAdminProducts();
    updateClock();
};  
