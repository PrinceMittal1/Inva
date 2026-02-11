import axios from 'axios'
import { apiUrl } from './env';


interface GetProductsRequestForSeller {
  customerUserId: string;
  sellerId: string;
}



export const creatingUserApi = async (payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}users/create`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("response is ----- -", response)
    return response;

  } catch (e: any) {
    console.log("response is ----- - + ", e)
    if (axios.isAxiosError(e)) {
      return [e.response?.status, e.response?.data];
    } else {
      console.log("Unexpected Error:", e);
    }
  }
}

export const updatingUserApi = async (payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}users/updating`,
      payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error: any) {
    throw error;
  }
}

export const getProductsForHome = async (payload: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}product/all/products/for/customer`,
      {
        params: payload,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response;
  } catch (error: any) {
    console.log("response is ----- home ", error)
  }
};

export const toggleLike = async (payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}product/like`,
      payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const toggleSaved = async (payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}product/save`,
      payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};


export const followSeller = async (user_id: string, seller_id: string) => {
  try {
    const response = await axios.post(`${apiUrl}seller/follow`, {
      user_id,
      seller_id,
    });

    return response;
  } catch (error: any) {
    console.error("Follow API error:", error.response?.data || error.message);
    throw error;
  }
};

export const gettingProductDetail = async (payload: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}product/detail`,
      {
        params: payload,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response;
  } catch (error: any) {
    console.log("response is ----- detail ", error)
  }
}

export const updatingFCM = async (payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}users/updating/fcm`,
      payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response;
  } catch (error: any) {
    // console.log("response is ----- profile  ", error)
  }
};

// /seller/product/details


export const fetchingSellerProfile = async (payload: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}seller/profile`,
      {
        params: payload,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response;
  } catch (error: any) {
    console.log("response is  ", error)
  }
}

export const getProductsForSellerPage = async (payload: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}product/seller/products/for/customer`,
      {
        params: payload,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response;
  } catch (error: any) {
    console.log("response is ----- seller page ", error)
  }
}


export const handleItemViewed = async (product_id: string) => {
  try {
    const response = await axios.post(`${apiUrl}product/viewed`, {
      product_id,
    });
    return response;
  } catch (error: any) {
    console.error("Follow API error:", error.response?.data || error.message);
    throw error;
  }
}


export const getProductsForWishlistPage = async (
  payload: any
) => {
  try {
    const response = await axios.get(
      `${apiUrl}users/wishlist`,
      {
        params: payload,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response;
  } catch (error: any) {
    console.log("response is ----- wishlist page ", error)
  }
};


export const getUserProfile = async (
  payload: any
) => {
  try {
    const response = await axios.get(
      `${apiUrl}users/detail`,
      {
        params: payload,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response;
  } catch (error: any) {
    // console.log("response is ----- profile  ", error)
  }
};


export const deleteUser = async (payload: any) => {
  try {
    const response = await axios.delete(`${apiUrl}users/delete`, {
      headers: { 'Content-Type': 'application/json' },
      data: payload
    });
    return response;
  } catch (error: any) {
    console.log("response is ----- delete ", error);
  }
};


export const gettingPrivacyPolicy = async () => {
  try {
    const response = await axios.get(
      `${apiUrl}content/inva/privacy_policy`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response;
  } catch (error: any) {
    // console.log("response is ----- profile  ", error)
  }
};

export const gettingTerms = async () => {
  try {
    const response = await axios.get(
      `${apiUrl}content/inva/terms_conditions`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response;
  } catch (error: any) {
    // console.log("response is ----- profile  ", error)
  }
};


export const gettingIntersetsType = async (payload: any) => {
  try {
    const response = await axios.get(
      `${apiUrl}productType/interest/types`,
      {
        params: payload,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response;
  } catch (error: any) {
    // console.log("response is ----- gettingIntersetsType  ", error)
  }
};

export const submittingSuggestion = async (payload: any) => {
  try {
    const response = await axios.post(
      `${apiUrl}suggestion/support`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (e: any) {
    console.log("response is ----- - + ", e)
    if (axios.isAxiosError(e)) {
      return [e.response?.status, e.response?.data];
    } else {
      console.log("Unexpected Error:", e);
    }
  }
};
