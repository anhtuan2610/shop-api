import { PER_PAGE } from "../../common-script/constants.js";
import { getProducts } from "../../common-script/services/product-api.js";
import { $, $$, getQueryString } from "../../common-script/utils.js";
import { createCart, getCarts, updateCart } from "../../common-script/services/cart-api.js"

let params = {
  _limit: PER_PAGE,
  _page: 1,
  _totalRows: 0, // tổng số sản phẩm
};
let products = [];
let carts = [];

async function init() {
  try {
    const { data, pagination } = await getProducts(getQueryString(params)); // câu query này trả về 1 mảng gồm 2 đối tượng , 1 là 1 đối tượng mảng gồm các sản phẩm, 2 là thông tin paging
    products = data;
    params = {
      ...params,
      ...pagination, // ghi đè lên params (thuộc tính nào giống tên thì sẽ bị thay thế bởi pagination), nếu không có thì sẽ được thêm vào
    };
    renderProducts();
    renderPagination();
  } catch (error) {
    console.log(error);
  }
}

function renderPagination() {
  if (params._totalRows < PER_PAGE) {
    return;
  }
  const totalPages = Math.ceil(params._totalRows / PER_PAGE);
  const paginationHtml = [...Array(totalPages)].map( // tạo ra 1 mảng trống có số phần tử bằng với total page
    (_, index) => // vì là chỉ muốn lấy index nên cần truyền 2 tham số (giá trị phần tử , index) , mà ở đây chỉ cần lấy index nên truyền _ để biểu thị rằng giá trị của phần tử không quan trọng.
      `<a data-page="${index + 1}" class="page ${params._page === index + 1 && "active"
      }">${index + 1}</a>`
  );

  $("pagination").innerHTML = paginationHtml.join(""); // join thành một chuỗi

  $$(".page").forEach((page) => {
    page.onclick = () => {
      handlePageChange(page.getAttribute("data-page"));
    };
  });
}

async function handlePageChange(page) {
  try {
    const { data, pagination } = await getProducts(
      getQueryString({
        ...params, // giữ nguyên các phần tử khác của params
        _page: page, // trong params thay đổi page
      })
    );
    products = data;
    params = {
      ...params,
      ...pagination,
    };
    renderProducts();
    renderPagination();
    window.scrollTo(0, 0); // đẩy màn hình người dùng nhìn lên trên cùng 
  } catch (error) {
    console.log(error);
  }
}

function renderProducts() {
  if (products.length === 0) {
    return;
  }

  const productsHtml = products.map(
    (
      product
    ) => ` <div class="pro" onclick="window.location.href='../productDetail/index.html?id=${product.id}';">
          <img src="${product.images[0]}" alt="" />
          <div class="des">
            <span>${product.category.name}</span>
            <h5>${product.title}</h5>
            <div class="star">
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
            </div>
            <h4>$${product.price}</h4>
          </div>
          <button data-id="${product.id}" class="add-to-cart">btn</button>
        </div>`
  );

  $("product-render").innerHTML = productsHtml.join("");

  ($$(".add-to-cart") || []).forEach((btn) => (
    btn.onclick = handleAddToCart
  ));
}

async function handleAddToCart(e) {
  e.stopPropagation();
  getCartsOnPage();
  const productId = e.target.getAttribute("data-id"); // e là phần tử window , đang xem xem phần tử nào đang được target đến để lấy attribute
  const product = products.find((p) => {
    return productId == p.id;
  });
  const newProductToCart = {
    ...product,
    productId: product.id, // id của sản phẩm
    quantity: 1,
    userId: "abc",
    id: null // phải để như này để cho server tự tạo id không trùng với id của product
  };
  const findCart = carts.find((cart) => {
    return cart.productId == product.id; // true || false
  })

  if (findCart) {
    try {
      findCart.quantity++;
      // await updateCart({ ...newProductToCart, quantity: findCart.quantity++ });
      await updateCart({ ...findCart });
      return;
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      await createCart(newProductToCart);
    } catch (error) {
      console.log(error);
    }
  }
}



async function getCartsOnPage() {
  try {
    carts = await getCarts();
  } catch (error) {
    console.log(error);
  }
}

$("search-product").addEventListener("input", handleSearch);

async function handleSearch() {
  // var title_like = $("search-product").value;
  // var productSearched = await getProducts(getQueryString({ ...params, title_like }));
  // products = productSearched;
  // renderProducts();
  // renderPagination()

  try {
    var title_like = $("search-product").value;
    const { data, pagination } = await getProducts(getQueryString({ ...params, title_like }));
    products = data;
    params = {
      ...params,
      ...pagination,
    };
    renderProducts();
    renderPagination();
  } catch (error) {
    console.log(error);
  }
}

/// start
init();
getCartsOnPage();