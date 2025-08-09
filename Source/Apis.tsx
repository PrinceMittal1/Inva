import axios from 'axios'

interface GetProductsRequest {
  customerUserId: string;
}

export const getProductsForHome = async (
  payload: GetProductsRequest
) => {
  try {
    const response = await axios.post('https://getproductsforhome-ty3v52ngjq-uc.a.run.app', payload, {
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
  sellerId : string;
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


