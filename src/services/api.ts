const API_BASE_URL = 'https://groceryapp-production-d3fc.up.railway.app/api';

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  errorCode: number;
  errorMessage: string | null;
  data: {
    token: string;
    user: {
      id: number;
      email: string;
      role: string;
      first_name: string;
      last_name: string;
    };
  } | null;
}

export interface RequestOTPRequest {
  email: string;
}

export interface RequestOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      email: string;
      role: string;
      name?: string;
    };
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface Category {
  id: number;
  categoryName: string;
  isSubCategory: boolean;
  longDescription: string;
  shortDescription: string;
  coverImage: string;
  parentCategoryIds: number[];
  createdAt?: string;
  updatedAt?: string;
  parentCategories?: Category[];
  subCategories?: Category[];
  isDeleted?: boolean;
  vendorId?: number;
}

export interface CreateUpdateCategoryRequest {
  id?: number;
  categoryName: string;
  isSubCategory: boolean;
  longDescription: string;
  shortDescription: string;
  coverImage: string;
  parentCategoryIds: number[];
}

export interface DeleteCategoryRequest {
  categoryId: number;
  parentCategoryId?: number;
}

export interface CategoriesResponse {
  errorCode: number;
  errorMessage: string | null;
  data: Category[] | null;
}

export interface CategoryResponse {
  errorCode: number;
  errorMessage: string | null;
  data: Category | null;
}

export interface UpdateCategoryRequest extends CreateUpdateCategoryRequest {
  id: number;
}
export interface Item {
  id: number;
  itemName: string;
  shortDescription: string;
  longDescription: string;
  backgroundImageUrl: string;
  coverImageUrl: string;
  categoryIds: number[];
  quantity?: number;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
  vendorId?: number;
}

export interface CreateUpdateItemRequest {
  id?: number;
  itemName: string;
  shortDescription: string;
  longDescription: string;
  backgroundImageUrl: string;
  coverImageUrl: string;
  categoryIds: number[];
  quantity?: number;
  price?: number;
}

export interface ItemsResponse {
  errorCode: number;
  errorMessage: string | null;
  data: {
    items: Item[];
    message?: string;
  } | null;
}

export interface ItemResponse {
  errorCode: number;
  errorMessage: string | null;
  data: Item | null;
}

export interface UpdateItemRequest extends CreateUpdateItemRequest {
  id: number;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  street_address1: string;
  street_address2?: string;
  city: string;
  state: string;
  zip_code: string;
  role_name: string;
  description?: string;
  restaurant_name?: string;
  agreement_docs?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface CreateUserRequest {
  role_name: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email_address: string;
  street_address1: string;
  street_address2?: string;
  city: string;
  state: string;
  zip_code: string;
  description?: string;
  restaurant_name?: string;
  agreement_docs?: string;
  password: string;
}

export interface UsersResponse {
  errorCode: number;
  errorMessage: string | null;
  data: User[] | null;
}

export interface UserResponse {
  errorCode: number;
  errorMessage: string | null;
  data: User | null;
}

export interface CartItem {
  item_id: number;
  quantity: number;
  item_name?: string;
  price?: number;
  cover_image_url?: string;
}

export interface CartResponse {
  errorCode: number;
  errorMessage: string | null;
  data: {
    items: CartItem[];
    total: number;
  } | null;
}

export interface AddToCartRequest {
  item_id: number;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}

export interface CreateOrderRequest {
  shipping_address: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  payment_method_id: string;
  order_total: string;
  items: {
    item_id: number;
    quantity: number;
  }[];
}

export interface OrderResponse {
  errorCode: number;
  errorMessage: string | null;
  data: {
    order_id: string;
    status: string;
    message: string;
  } | null;
}

export interface StripePaymentMethodResponse {
  id: string;
  object: string;
  type: string;
}
// Add these interfaces to your api.ts file
export interface Order {
  id: string;
  order_id: string;
  status: string;
  order_status: string;
  order_total: string;
  created_at: string;
  updated_at: string;
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  items: Array<{
    item_id: number;
    quantity: number;
  }>;
  user_id?: number;
  vendor_id?: number;
}

export interface OrdersResponse {
  errorCode: number;
  errorMessage: string | null;
  data: {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}
class ApiService {
  private async makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const contentType = response.headers.get('content-type');
    let responseData: any;

    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = { message: text };
    }

    // ✅ Return responseData on success
    if (response.ok) {
      return responseData;
    }

    // ❌ Extract errorMessage from backend response
    const errorMessage =
      responseData.errorMessage || responseData.message || 'Request failed';
    throw new Error(errorMessage);
  } catch (error: any) {
    // ✅ Only show this if it's a real fetch/network failure
    if (
      error instanceof TypeError &&
      error.message.includes('Failed to fetch')
    ) {
      throw new Error(
        'Network error: Unable to connect to server. Please check your internet connection.'
      );
    }

    throw error;
  }
}


  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async requestOTP(data: RequestOTPRequest): Promise<RequestOTPResponse> {
    return this.makeRequest<RequestOTPResponse>('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return this.makeRequest<VerifyOTPResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return this.makeRequest<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Category APIs
  async getAllCategories(): Promise<CategoriesResponse> {
    return this.makeRequest<CategoriesResponse>('/category/getAll', {
      method: 'GET',
    });
  }

  async getParentCategories(): Promise<CategoriesResponse> {
    return this.makeRequest<CategoriesResponse>('/category/getOnlyParentCategories', {
      method: 'GET',
    });
  }

  async getSubCategories(parentId: number): Promise<CategoriesResponse> {
    return this.makeRequest<CategoriesResponse>(`/category/getSubCategories/${parentId}`, {
      method: 'GET',
    });
  }

  async createUpdateCategory(data: CreateUpdateCategoryRequest): Promise<CategoryResponse> {
    return this.makeRequest<CategoryResponse>('/category/createUpdateCategory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(data: UpdateCategoryRequest): Promise<CategoryResponse> {
    return this.makeRequest<CategoryResponse>('/category/createUpdateCategory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(data: DeleteCategoryRequest): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<any>('/category/softDeleteOrDetach', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });

    // Handle different response structures
    if (response.errorCode === 0) {
      return {
        success: true,
        message: response.errorMessage || response.message || 'Category deleted successfully'
      };
    }

    return {
      success: false,
      message: response.errorMessage || response.message || 'Failed to delete category'
    };
  }

  async getCategoryById(id: number): Promise<CategoryResponse> {
    return this.makeRequest<CategoryResponse>(`/category/getById/${id}`, {
      method: 'GET',
    });
  }

  async uploadImage(file: File): Promise<{ success: boolean; url: string; message: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return response.json();
  }

  // Item APIs
  async getAllItems(): Promise<ItemsResponse> {
    return this.makeRequest<ItemsResponse>('/item/getAllItems', {
      method: 'GET',
    });
  }

  async createUpdateItem(data: CreateUpdateItemRequest): Promise<ItemResponse> {
    return this.makeRequest<ItemResponse>('/item/createUpdateItem', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(data: UpdateItemRequest): Promise<ItemResponse> {
    return this.makeRequest<ItemResponse>('/item/createUpdateItem', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(itemId: number): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/item/deleteItem/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getItemById(id: number): Promise<ItemResponse> {
    return this.makeRequest<ItemResponse>(`/item/getAllItems/${id}`, {
      method: 'GET',
    });
  }

  // User APIs
  async getUsers(): Promise<UsersResponse> {
    return this.makeRequest<UsersResponse>('/auth/getUsers', {
      method: 'GET',
    });
  }

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    return this.makeRequest<UserResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/auth/updateUserStatus/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  async updateUser(userId: number, data: Partial<CreateUserRequest>): Promise<UserResponse> {
    const updateData = {
      ...data,
      id: userId
    };
    return this.makeRequest<UserResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  }

  async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/auth/deleteUser/${userId}`, {
      method: 'DELETE',
    });
  }

  // Vendor-specific APIs
  async getVendors(): Promise<UsersResponse> {
    return this.makeRequest<UsersResponse>('/auth/getUsers?role=vendor', {
      method: 'GET',
    });
  }

  async createVendor(data: CreateUserRequest): Promise<UserResponse> {
    const vendorData = {
      ...data,
      role_name: 'Vendor'
    };
    return this.makeRequest<UserResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  }

  async requestOtp(data: { email: string }): Promise<{
    errorCode: number;
    errorMessage: string | null;
    data?: {
      message: string;
      otp: string;
      expiresAt: string;
    };
  }> 
  
  {
    return this.makeRequest('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOtp(data: { email: string; otp: string }): Promise<VerifyOtpResponse> {
    return this.makeRequest<VerifyOtpResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // services/api.ts
  async resetPassword(data: { email: string; newPassword: string }): Promise<{
    errorCode: number;
    errorMessage: string | null;
    data?: {
      email: string;
      message: string;
    };
  }>
  {
    return this.makeRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Cart APIs
  async addToCart(data: AddToCartRequest): Promise<CartResponse> {
    return this.makeRequest<CartResponse>('/cart/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCartDetails(): Promise<CartResponse> {
    return this.makeRequest<CartResponse>('/cart/getCartDetails', {
      method: 'GET',
    });
  }

  async updateCartItem(itemId: number, data: UpdateCartRequest): Promise<CartResponse> {
    return this.makeRequest<CartResponse>(`/cart/update/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeCartItem(itemId: number): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/cart/remove/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>('/cart/clear', {
      method: 'POST',
    });
  }

  // Order APIs
  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    return this.makeRequest<OrderResponse>('/order/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
// Add this to your ApiService class in api.ts
async getAllOrders(params?: {
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  order_status?: string;
}): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.order_status) queryParams.append('order_status', params.order_status);
    
    const queryString = queryParams.toString();
    const url = `/order${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.makeRequest<any>(url, {
      method: 'GET',
    });
    
    return response;
  } catch (error) {
    throw error;
  }
}
// Add method to get vendor-specific orders
async getVendorOrders(vendorId: number, params?: {
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  order_status?: string;
}): Promise<OrdersResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.order_status) queryParams.append('order_status', params.order_status);
  
  const queryString = queryParams.toString();
  const url = `/order/vendor/${vendorId}${queryString ? `?${queryString}` : ''}`;
  
  return this.makeRequest<OrdersResponse>(url, {
    method: 'GET',
  });
}
  // Stripe Payment Method Creation
  async createStripePaymentMethod(cardToken: string): Promise<StripePaymentMethodResponse> {
    // const stripeSecretKey = ;
    const STRIPE_SECRET = import.meta.env.VITE_STRIPE_SECRET_KEY;


    const formData = new URLSearchParams();
    formData.append('type', 'card');
    formData.append('card[token]', cardToken);

    const response = await fetch('https://api.stripe.com/v1/payment_methods', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create payment method');
    }

    return response.json();
  }
}

export const apiService = new ApiService();