// simple frontend-only marketplace logic (localStorage cart)
const PRODUCTS = [
  { id: 1, title: "Moon T-Shirt", price: 120000, img: "assets/img/products/tshirt.jpg", category: "Pakaian" },
  { id: 2, title: "Blue Lunar Bottle", price: 95000, img: "assets/img/products/bottle.jpg", category: "Minuman" },
  { id: 3, title: "Galaxy Sticker Pack", price: 25000, img: "assets/img/products/sticker.jpg", category: "Produk" },
  { id: 4, title: "Moon Hoodie", price: 230000, img: "assets/img/products/hoodie.jpg", category: "Pakaian" },
  { id: 5, title: "Orbit Backpack", price: 189000, img: "assets/img/products/backpack.jpg", category: "Perabotan" },
  { id: 6, title: "Herbal Relief - Obat", price: 45000, img: "assets/img/products/medicine.jpg", category: "Obat-obatan" }
];

const CART_KEY = "moon_cart_v1";

function getCart(){
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch(e){
    return [];
  }
}
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }

function updateCartCount(){
  const cart = getCart();
  const count = cart.reduce((s,i)=>s + (i.qty||1), 0);
  const el = document.getElementById("cartCount");
  if(el) el.textContent = count;
}

// format currency
function toIDR(v){ return "Rp " + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

// render products on index - support both productGrid and productList
function renderProducts(list){
  const grid = document.getElementById("productGrid") || document.getElementById("productList");
  if(!grid) return;
  grid.innerHTML = "";
  list.forEach(p=>{
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="imgwrap"><img loading="lazy" src="${p.img}" alt="${p.title}"></div>
      <h3>${p.title}</h3>
      <div class="price">${toIDR(p.price)}</div>
      <div class="meta">
        <button class="btn-primary" data-id="${p.id}">Tambah ke Keranjang</button>
        <a class="btn-secondary" href="pages/kategori-produk.html?pid=${p.id}">Lihat</a>
      </div>
    `;
    grid.appendChild(card);
  });

  // attach handlers
  document.querySelectorAll(".btn-primary").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = Number(btn.getAttribute("data-id"));
      addToCart(id);
    });
  });
}

function addToCart(productId, qty = 1){
  const p = PRODUCTS.find(x=>x.id === productId);
  if(!p) return alert("Produk tidak ditemukan");
  const cart = getCart();
  const idx = cart.findIndex(i=>i.id === p.id);
  if(idx === -1) cart.push({ id: p.id, title: p.title, price: p.price, img: p.img, qty });
  else cart[idx].qty = (cart[idx].qty || 1) + qty;
  saveCart(cart);
  alert(`${p.title} ditambahkan ke keranjang`);
}

// search - support both searchInput and searchBox
function initSearch(){
  const s = document.getElementById("searchInput") || document.querySelector(".searchBox");
  if(!s) return;
  s.addEventListener("input", ()=>{
    const q = s.value.trim().toLowerCase();
    if(!q) renderProducts(PRODUCTS);
    else renderProducts(PRODUCTS.filter(p=>p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
  });
}

// cart page rendering (cart.html)
function renderCartPage(){
  const area = document.getElementById("cartItems");
  if(!area) return;
  const cart = getCart();
  area.innerHTML = "";
  if(!cart.length){ area.innerHTML = "<div class='card' style='padding:20px'>Keranjang anda kosong.</div>"; return; }
  let total = 0;
  cart.forEach(item=>{
    total += item.price * (item.qty || 1);
    const row = document.createElement("div");
    row.className = "card";
    row.style.display = "flex";
    row.style.gap = "12px";
    row.style.alignItems = "center";
    row.style.marginBottom = "10px";
    row.innerHTML = `
      <img src="${item.img}" style="width:80px;height:70px;object-fit:cover;border-radius:8px">
      <div style="flex:1">
        <div style="font-weight:700">${item.title}</div>
        <div style="color:#bcd; margin-top:6px">${toIDR(item.price)} x ${item.qty || 1}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="inc" data-id="${item.id}">+</button>
        <button class="dec" data-id="${item.id}">-</button>
        <button class="del" data-id="${item.id}">Hapus</button>
      </div>
    `;
    area.appendChild(row);
  });
  const footer = document.getElementById("cartTotal");
  if(footer) footer.textContent = toIDR(total);

  // attach listeners
  document.querySelectorAll(".inc").forEach(b=>{
    b.addEventListener("click", ()=>{
      const id = Number(b.dataset.id);
      const cart = getCart();
      const it = cart.find(x=>x.id===id); if(it){ it.qty = (it.qty||1)+1; saveCart(cart); renderCartPage(); }
    });
  });
  document.querySelectorAll(".dec").forEach(b=>{
    b.addEventListener("click", ()=>{
      const id = Number(b.dataset.id);
      let cart = getCart();
      const it = cart.find(x=>x.id===id);
      if(it){
        it.qty = (it.qty||1)-1;
        if(it.qty <= 0) cart = cart.filter(i=>i.id!==id);
        saveCart(cart); renderCartPage();
      }
    });
  });
  document.querySelectorAll(".del").forEach(b=>{
    b.addEventListener("click", ()=>{
      const id = Number(b.dataset.id);
      if(confirm("Hapus item ini?")){
        let cart = getCart().filter(i=>i.id!==id);
        saveCart(cart); renderCartPage();
      }
    });
  });
}

// checkout page simple handler
function initCheckout(){
  const pay = document.querySelector(".payBtn");
  if(!pay) return;
  pay.addEventListener("click", ()=>{
    // very simple mock
    const cart = getCart();
    if(!cart.length){ alert("Keranjang kosong"); return; }
    localStorage.removeItem(CART_KEY);
    saveCart([]);
    alert("Pembayaran berhasil (mock). Terima kasih!");
    window.location.href = "../index.html";
  });
}

// on load
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartCount();
  initSearch();
  // if index page
  if(document.getElementById("productGrid")) renderProducts(PRODUCTS);

  // if cart page
  if(document.getElementById("cartItems")){
    renderCartPage();
    const totalEl = document.getElementById("cartTotal");
    if(totalEl){
      // compute and set total
      const c = getCart();
      const t = c.reduce((s,i)=> s + i.price * (i.qty||1), 0);
      totalEl.textContent = toIDR(t);
    }
    // attach checkout link to navigate to checkout.html
    const checkoutBtn = document.getElementById("goCheckout");
    if(checkoutBtn) checkoutBtn.addEventListener("click", ()=> location.href = "checkout.html");
  }

  // if checkout page
  if(document.querySelector(".payBtn")) {
    document.querySelector(".payBtn").addEventListener("click", ()=>{
      const cart = getCart();
      if(cart.length === 0) { alert("Keranjang kosong"); return; }
      // here you would call payment API; we just clear cart
      localStorage.removeItem(CART_KEY);
      saveCart([]);
      alert("Pembayaran mock berhasil! Terima kasih.");
      window.location.href = "index.html";
    });
  }
});
