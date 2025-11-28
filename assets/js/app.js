const products = [
{id:1,name:"Moon T-Shirt",price:120000,img:"https://via.placeholder.com/200"},
{id:2,name:"Blue Lunar Bottle",price:95000,img:"https://via.placeholder.com/200"},
{id:3,name:"Galaxy Sticker Pack",price:25000,img:"https://via.placeholder.com/200"},
{id:4,name:"Moon Hoodie",price:230000,img:"https://via.placeholder.com/200"},
{id:5,name:"Orbit Backpack",price:189000,img:"https://via.placeholder.com/200"},
];


let cart = JSON.parse(localStorage.getItem("cart") || "[]");


function saveCart(){ localStorage.setItem("cart",JSON.stringify(cart)); }


function loadProducts(){
const list=document.getElementById("productList");
if(!list) return;


products.forEach(p=>{
list.innerHTML+=`
<div class='card'>
<img src='${p.img}' />
<h4>${p.name}</h4>
<p>Rp ${p.price.toLocaleString()}</p>
<button onclick="addToCart(${p.id})">Tambah</button>
</div>`;
});
}


function addToCart(id){
const item=products.find(p=>p.id===id);
cart.push(item);
saveCart();
alert("Ditambahkan ke keranjang");
}


function loadCart(){
const area=document.getElementById("cartItems");
if(!area) return;


area.innerHTML="";
let total=0;


cart.forEach(item=>{
total+=item.price;
area.innerHTML+=`<p>${item.name} — Rp ${item.price.toLocaleString()}</p>`;
});


area.innerHTML+=`<hr><strong>Total: Rp ${total.toLocaleString()}</strong>`;
}


loadProducts();
loadCart();