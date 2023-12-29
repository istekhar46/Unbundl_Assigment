let productDom = document.getElementById("productDom");
let cartBtn = document.getElementById("cartBtn");
let itemCounter = document.getElementById("itemCounter");
let cartDom = document.getElementById("cart-contant");
let clearBtn = document.getElementById("clearCart");
let total = document.getElementById("total");

// addEventListener
document.addEventListener("DOMContentLoaded", displayProduct);
cartBtn.addEventListener("click", cartView);
cartDom.addEventListener("click", DeleteCartDom);
clearBtn.addEventListener("click", clearCart);

let cart2 = [];
let countElement = 0;

// class 
class Products {
    async getProducts() {
        try {
            let result = await fetch("./data.json");
            let data = await result.json();
            return data.items;
        } catch (err) {
            console.log(err);
        }
    }
    static isCartFull() {
        return Storage.getCart().length >= this.cartLimit;
    }
}

class UI {
    displayProduct(product) {
        let results = "";
        product.forEach(({ title, price, image, id }) => {
            results += `
            <div class="card shadow p-3 mb-5 rounded" style="width: 15rem;">
            <img src="${image}" class="card-img-top" alt="...">
            <div class="card-body text-center">
                <h3 class="card-title">${title}</h3>
                <p class="fw-bold">Price: ${price} tk</p>
                <div class="d-flex justify-content-center" >
                    <button class="btn btn-secondary px-3 mx-3 addToCart" data-id=${id}>+</button>
                    <span id="count-${id}">0</span>
                    <button class="btn btn-danger px-3 mx-3 removeFromCart" data-id=${id}>-</button>
                </div>
            </div>
        </div>
            `;
        });
        productDom.innerHTML = results;
        UI.getButton(product);
    }

    static getButton(products) {
        const buttons = [...document.querySelectorAll(".addToCart, .removeFromCart")];
        buttons.forEach(button => {
            button.addEventListener("click", e => {
                if (e.defaultPrevented) {
                    return;
                }
    
                // Mark the event as handled to prevent multiple executions
                e.preventDefault();
                let id = e.target.dataset.id;
                let cart = Storage.getCart() || cart2;
                let inCart = cart.find(item => item.id == id);
                let countElement = document.getElementById(`count-${id}`);
    
                if (button.classList.contains("addToCart")) {
                    let cartProduct = products.find(product => product.id == id);
                    Storage.saveCart(cartProduct);
                    countElement.textContent = parseInt(countElement.textContent) + 1;
                } else if (button.classList.contains("removeFromCart")) {
                    if (parseInt(countElement.textContent) > 0) {
                        Storage.removeCartItem(id);
                        countElement.textContent = parseInt(countElement.textContent) - 1;
                    }
                }

                UI.countItem(Storage.getCart());
            });
    
            let id = button.dataset.id;
            let cart = Storage.getCart() || cart2;
            let inCart = cart.find(item => item.id == id);
    
            if (inCart) {
                countElement.textContent = inCart.count;
            }
        });
    }

    static getCartDisplay() {
        let items = Storage.getCart();
        UI.total(items);

        if (items !== null) {
            let totalRow = "";
            items.forEach((item) => {
                totalRow += `
                <tr>
                    <td ><img src="${item.image}" class="cart-image" alt=""></td>
                    <td>${item.title}</td>
                    <td>${item.price}</td>
                    <td>${item.count}</td>
                    <td ><a href="#"class="delete" > <i class="fas fa-trash-alt " data-id=${item.id} ></i></a></td>
                </tr>
                `;
            });
            cartDom.innerHTML = totalRow;
        }
    }

    static countItem(cart) {
        let uniqueItems = new Set();
        if (cart !== null) {
            cart.forEach(item => {
                uniqueItems.add(item.id);
            });
        }
        itemCounter.innerText = uniqueItems.size;
    }

    static total(cart) {
        let itemTotal = 0;
        cart.forEach(item => {
            itemTotal += item.price * item.count;
        });
        total.innerText = itemTotal;
    }
    static DeleteFromLocalStorage(id) {
        let carts = Storage.getCart();
        carts.forEach((item, index) => {
            if (item.id == id) {
                if (item.count > 1) {
                    item.count--;
                } else {
                    carts.splice(index, 1);
                }
            }
        });
        localStorage.setItem("cart", JSON.stringify(carts));
    }
}

//  Storage

class Storage {
    static saveCart(item) {
        let carts;
        if (localStorage.getItem("cart") == null) {
            carts = [];
        } else {
            carts = JSON.parse(localStorage.getItem("cart"));
        }
        let inCart = carts.find(cartItem => cartItem.id == item.id);
        if (inCart) {
            inCart.count++;
        } else {
            item.count = 1;
            carts.push(item);
        }
        localStorage.setItem("cart", JSON.stringify(carts));
    }

    static removeCartItem(id) {
        let carts = Storage.getCart();
        carts.forEach((item, index) => {
            if (item.id == id) {
                if (item.count > 1) {
                    item.count--;
                } else {
                    carts.splice(index, 1);
                }
            }
        });
        localStorage.setItem("cart", JSON.stringify(carts));
    }

    static getCart() {
        let cartItem;
        if (localStorage.getItem("cart") == null) {
            cartItem = [];
        } else {
            cartItem = JSON.parse(localStorage.getItem("cart"));
        }
        return cartItem;
    }
}

// Functionality

async function displayProduct() {
    let productList = new Products();
    let ui = new UI();
    let product = await productList.getProducts();
    ui.displayProduct(product);
    UI.getButton(product);
    UI.countItem(Storage.getCart());
    cartView();
}

function cartView() {
    UI.getCartDisplay();
}

function DeleteCartDom(e) {
    // Check if the clicked element is the delete button
    if (e.target.classList.contains("fa-trash-alt")) {
        // Prevent the default action of the click event
        e.preventDefault();

        // Retrieve the ID from the clicked element's data-id attribute
        let id = e.target.dataset.id;

        // Delete the item from the cart and update the display
        UI.DeleteFromLocalStorage(id);
        UI.getCartDisplay();
        UI.countItem(Storage.getCart());
        displayProduct();
    }
}


function clearCart() {
    localStorage.clear();
    UI.getCartDisplay();
    displayProduct();
}
