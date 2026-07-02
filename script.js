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

function renderInvoice(){

let html="";

let subtotal=0;

cart.forEach(item=>{

subtotal+=item.price*item.qty;

html+=`

<p>

${item.name}

×

${item.qty}

=

$${item.price*item.qty}

</p>

`;

});

let vat=subtotal*0.15;

let total=subtotal+vat-discount;

document.getElementById("invoiceItems").innerHTML += `
<tr>
    <td>Product Name</td>
    <td>2</td>
    <td>$10</td>
    <td>$20</td>
</tr>
`;

document.getElementById("invoiceSubtotal").innerHTML="$"+subtotal.toFixed(2);

document.getElementById("invoiceVat").innerHTML="$"+vat.toFixed(2);

document.getElementById("invoiceDiscount").innerHTML="$"+discount.toFixed(2);

document.getElementById("invoiceTotal").innerHTML="$"+total.toFixed(2);

}

function printInvoice(){

window.print();

}

function finishSale(){

alert("Order Saved Successfully");

cart=[];

discount=0;

renderCart();

closeCheckout();

}
