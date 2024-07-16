import restApi from "./index.js";

export async function getVouchers(query) {
    try {
        return await restApi({
            endpoint: `vouchers?${query}`,
            method: "GET",
        });
    } catch (error) {
        console.log(error);
    }
}

export async function getVoucher(id) {
    try {
        return await restApi({
            endpoint: `vouchers/${id}`,
            method: "GET",
        });
    } catch (error) {
        console.log(error);
    }
}
