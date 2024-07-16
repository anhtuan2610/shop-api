import { deleteCart, getCarts, updateCart } from "../../common-script/services/cart-api.js";
import { getVoucher, getVouchers } from "../../common-script/services/voucher-api.js";
import { $, $$ } from "../../common-script/utils.js";

let carts = [];
let vouchers = [];

async function getCartsOnPage() {
    try {
        carts = await getCarts();
        renderCart();
    } catch (error) {
        console.log(error);
    }
}

function renderCart() {
    if (carts.length > 0) {
        const cartsHTML = carts.map((elm) => {
            return `          <tr>
            <td>
                <div data-id="${elm.id}" class="delete-cart">X</div>
            </td>
            <td><img src="${elm.images[0]}" alt="" /></td>
            <td>${elm.title}</td>
            <td>${elm.price}</td>
            <td><input type="number" data-id="${elm.id}" value="${elm.quantity}" class="quantity-input" min="1"/></td>
            <td class="cart-subtotal">${elm.price * elm.quantity}</td>
          </tr>
          <tr>`
        });
        $("cart-list").innerHTML = cartsHTML.join("");
        renderTotalTable();

        $$(".delete-cart").forEach(elm => {
            elm.addEventListener("click", () => {
                handleDeleteCart(elm.getAttribute("data-id"));
            })
        });
        $$(".quantity-input").forEach(elm => {
            elm.addEventListener("input", () => {
                handleInputQuantity(elm.getAttribute("data-id"), elm.value);
            });
        });

        $("apply-voucher").addEventListener("click", handleApplyVoucher)
    }
}

async function handleDeleteCart(cartId) {
    try {
        await deleteCart(cartId);
        getCartsOnPage();
    } catch (error) {
        console.log(error);
    }
}

async function handleInputQuantity(cartId, quantityValue) {
    if (quantityValue > 0) {
        const cartFound = carts.find((cart) => {
            return cart.id === Number(cartId);
        });
        if (cartFound) {
            try {
                cartFound.quantity = quantityValue;
                await updateCart(cartFound)
            } catch (error) {
                console.log(error);
            }
        }
    }
    getCartsOnPage();
}

async function handleApplyVoucher() {
    const inputVoucher = $("input-voucher").value;
    vouchers = await getVouchers();
    if (vouchers.length > 0) {
        const voucher = vouchers.find((elm) => elm.code === inputVoucher);
        if (voucher) {
            renderTotalTable(voucher);
        }
    }
}

let totalDiscount = 0;
function renderTotalTable(voucher) {
    if (carts.length > 0) {
        let totalPrice = 0;
        let finalPrice = 0;

        $$(".cart-subtotal").forEach((elm) => {
            totalPrice += Number(elm.textContent.trim());
        })

        if (voucher) {
            totalDiscount += voucher.discount;
            if (totalDiscount == 0) {
                $("discount-table").style.display = "none";
            } else {
                $("discount-table").innerHTML = `<td>Discount</td>
            <td>${totalDiscount}</td>`
                $("discount-table").style.display = "table-row";
            }
        }

        finalPrice = totalPrice - totalDiscount;
        $("all-cart-subtotal").innerHTML = totalPrice;
        $("total-price").innerHTML = finalPrice;
    } else {
        $("subtotal-table").style.display = "none";
    }
}

window.onload = () => {
    getCartsOnPage();
}