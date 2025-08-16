import axios from 'axios'

interface GetProductsRequest {
  customerUserId: string;
}

export const getProductsForHome = async (
  payload: GetProductsRequest
) => {
  try {
    // http://127.0.0.1:5001/inva-b5b22/us-central1/updateCustomerUserDetail
    // https://getproductsforhome-ty3v52ngjq-uc.a.run.app
    const response = await axios.post('http://127.0.0.1:5001/inva-b5b22/us-central1/getProductsForHomes', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

interface GetProductsRequestForSeller {
  customerUserId: string;
  sellerId: string;
}

export const getProductsForSellerPage = async (
  payload: GetProductsRequestForSeller
) => {
  try {
    const response = await axios.post('https://getsellerproducts-ty3v52ngjq-uc.a.run.app', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getProductsForWishlistPage = async (
  payload: GetProductsRequest
) => {
  try {
    const response = await axios.post('https://getsavedproducts-ty3v52ngjq-uc.a.run.app', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
};


export const updatingUser = async (payload: any) => {
  try {
    const response = await axios.post('http://127.0.0.1:5001/inva-b5b22/us-central1/updateCustomerUserDetail', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("respons e----------------- ", response)
    return response.data;
  } catch (error: any) {
    throw error;
  }
}


export const toggleLike = async (productUserId: string, myUserId: string, title : string, productType : string, tags:any, seller : string) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:5001/inva-b5b22/us-central1/toggleLikeAndUpdateVector",
      { productUserId, myUserId, title, productType, tags, seller },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error toggling like:", error.response?.data || error.message);
    throw error;
  }
};

