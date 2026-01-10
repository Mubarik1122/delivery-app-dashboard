const BASE_URL = (import.meta.env.VITE_API_URL as string) ;
// Auth Interfaces
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

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  errorCode: number;
  errorMessage: string | null;
  data?: {
    email: string;
    message: string;
  };
}

// User Interfaces
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
  restaurant_image?: string;
  agreement_docs?: string;
  certificate_doc?: string;
  driver_licence_doc?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  is_food?: boolean;
  is_grocery?: boolean;
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
  restaurant_image?: string;
  agreement_docs?: string;
  password: string;
  latitude?: number;
  longitude?: number;
  is_food?: boolean;
  is_grocery?: boolean;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id?: number;
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

export interface CurrentUserResponse {
  errorCode: number;
  errorMessage: string | null;
  data: User | null;
}

// Category Interfaces
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

// Item Interfaces
export interface ItemSize {
  sizeName: string;
  price: number;
}

export interface Flavor {
  id?: number;
  flavorName: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
}

export interface CreateFlavorRequest {
  id?: number;
  flavor_name: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface FlavorsResponse {
  errorCode: number;
  errorMessage: string | null;
  data: Flavor[] | null;
}

export interface FlavorResponse {
  errorCode: number;
  errorMessage: string | null;
  data: Flavor | null;
}

export interface Item {
  id: number;
  itemName: string;
  shortDescription: string;
  longDescription: string;
  backgroundImageUrl: string;
  coverImageUrl: string;
  categoryIds: number[];
  addonIds?: number[];
  sizes?: ItemSize[];
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
  addonIds?: number[];
  flavorIds?: number[];
  sizes?: ItemSize[];
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
  data: {
    items: Item[];
    message?: string;
  } | Item | null;
}

export interface UpdateItemRequest extends CreateUpdateItemRequest {
  id: number;
}

// Addon Interfaces
export interface Addon {
  id: number;
  addonName: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
}

export interface CreateAddonRequest {
  id?: number;
  addonName: string;
  description: string;
  price: number;
  isActive: boolean;
}

export interface AddonsResponse {
  errorCode: number;
  errorMessage: string | null;
  data: Addon[] | null;
}

export interface AddonResponse {
  errorCode: number;
  errorMessage: string | null;
  data: Addon | null;
}

// Cart Interfaces
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

export interface OrdersParams {
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  order_status?: string;
}

// Payment Interfaces
export interface StripePaymentMethodResponse {
  id: string;
  object: string;
  type: string;
}

// Upload Interfaces
export interface UploadImageResponse {
  success: boolean;
  url: string;
  message: string;
}

// Vendor Dashboard Interfaces
export interface VendorDashboardData {
  total_items: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
  total_customers: number;
  weekly_revenue: number;
  status_counts: {
    Pending: number;
    Confirmed: number;
    Processing: number;
    "Out for delivery": number;
    Delivered: number;
    Cancelled: number;
  };
  daily_sales: Array<{
    day_of_week: number;
    day_name: string;
    orders_count: number;
    revenue: number;
  }>;
  recent_orders: Array<{
    order_id: number;
    order_number: string;
    order_status: string;
    payment_status: string;
    total_amount: number;
    shipping_rate: number;
    order_notes: string | null;
    created_at: string;
    updated_at: string;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
  }>;
}

export interface VendorDashboardResponse {
  errorCode: number;
  errorMessage: string | null;
  data: VendorDashboardData | null;
}

export interface VendorAnalyticsData {
  top_selling_products: Array<{
    item_id: number;
    item_name: string;
    cover_image_url: string;
    background_image_url: string;
    total_quantity_sold: number;
    orders_count: number;
    avg_price: number;
  }>;
  most_rated_products: Array<any>;
  top_customers: Array<{
    customer_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    orders_count: number;
    total_spent: number;
  }>;
}

export interface VendorAnalyticsResponse {
  errorCode: number;
  errorMessage: string | null;
  data: VendorAnalyticsData | null;
}

// API Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
   private base = BASE_URL;
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}, timeout = 15000): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.base}${endpoint}`;
   
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const token = this.getToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let responseData: any;

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        responseData = { message: text };
      }

      // Log requests in development
      if (import.meta.env.DEV) {
        // Log request body for signup to verify image is included
        if (endpoint.includes('/signup') && options.body) {
          try {
            const bodyData = JSON.parse(options.body as string);
            console.log('Signup request payload:', {
              hasRestaurantImage: !!bodyData.restaurant_image,
              imageLength: bodyData.restaurant_image?.length || 0,
              imagePreview: bodyData.restaurant_image?.substring(0, 100) || 'N/A'
            });
          } catch (e) {
            // Ignore parsing errors
          }
        }
        // console.log(`API ${options.method} ${endpoint}:`, {
        //   status: response.status,
        //   response: responseData
        // });
      }

      if (response.ok) {
        return responseData;
      }

      // Handle specific error cases
      if (response.status === 401) {
        this.handleUnauthorized();
      }

      const errorMessage = 
        responseData.errorMessage || 
        responseData.message || 
        `Request failed with status ${response.status}`;
      
      throw new ApiError(
        errorMessage,
        response.status,
        responseData.errorCode,
        responseData
      );
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout: The server took too long to respond');
      }

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError(
          'Network error: Unable to connect to server. Please check your internet connection.'
        );
      }

      throw error;
    }
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private handleUnauthorized(): void {
    // Clear stored auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Redirect to login page if we're in a browser environment
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Auth Methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store user data automatically on successful login
    if (response.errorCode === 0 && response.data) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
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

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return this.makeRequest<ResetPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User Methods
  async getUsers(role?: string, userId?: number): Promise<UsersResponse> {
    let endpoint = '/auth/getUsers';
    const params: string[] = [];
    
    if (role) {
      params.push(`role=${role}`);
    }
    if (userId) {
      params.push(`user_id=${userId}`);
    }
    
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }
    
    return this.makeRequest<UsersResponse>(endpoint, {
      method: 'GET',
    });
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    return this.makeRequest<CurrentUserResponse>('/auth/me', {
      method: 'GET',
    });
  }

  async getProfileData(): Promise<UsersResponse> {
    return this.makeRequest<UsersResponse>('/auth/getProfileData', {
      method: 'GET',
    });
  }

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    return this.makeRequest<UserResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(userId: number, data: UpdateUserRequest): Promise<UserResponse> {
    const updateData = {
      ...data,
      id: userId
    };
    return this.makeRequest<UserResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(
      `/auth/updateUserStatus/${userId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive }),
      }
    );
  }

  async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(
      `/user/delete/${userId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // Vendor Methods
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
    return this.createUser(vendorData);
  }

  // Category Methods
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

  async getCategoryById(id: number): Promise<CategoryResponse> {
    return this.makeRequest<CategoryResponse>(`/category/getById/${id}`, {
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
    return this.createUpdateCategory(data);
  }

  async deleteCategory(data: DeleteCategoryRequest): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<any>('/category/softDeleteOrDetach', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });

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

  // Item Methods
  async getAllItems(): Promise<ItemsResponse> {
    return this.makeRequest<ItemsResponse>('/item/getAllItems', {
      method: 'GET',
    });
  }

  async getItemById(id: number): Promise<ItemResponse> {
    return this.makeRequest<ItemResponse>(`/item/getAllItems?id=${id}`, {
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
    return this.createUpdateItem(data);
  }

  async deleteItem(itemId: number): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(
      `/item/deleteItem/${itemId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // Addon Methods
  async getAllAddons(): Promise<AddonsResponse> {
    return this.makeRequest<AddonsResponse>('/addon/getAll', {
      method: 'GET',
    });
  }

  async getAddonById(id: number): Promise<AddonResponse> {
    return this.makeRequest<AddonResponse>(`/addon/getById/${id}`, {
      method: 'GET',
    });
  }

  async createAddon(data: CreateAddonRequest): Promise<AddonResponse> {
    return this.makeRequest<AddonResponse>('/addon/createOrUpdate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAddon(id: number): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<{ 
      errorCode: number; 
      errorMessage: string | null; 
      data: { message: string; addon?: any } | null 
    }>(
      `/addon/delete/${id}`,
      {
        method: 'DELETE',
      }
    );

    if (response.errorCode === 0) {
      return {
        success: true,
        message: response.data?.message || 'Addon deleted successfully'
      };
    }

    return {
      success: false,
      message: response.errorMessage || 'Failed to delete addon'
    };
  }

  // Flavor Methods
  async getAllFlavors(): Promise<FlavorsResponse> {
    return this.makeRequest<FlavorsResponse>('/flavor/getAll', {
      method: 'GET',
    });
  }

  async getFlavorById(id: number): Promise<FlavorResponse> {
    return this.makeRequest<FlavorResponse>(`/flavor/getById/${id}`, {
      method: 'GET',
    });
  }

  async createOrUpdateFlavor(data: CreateFlavorRequest): Promise<FlavorResponse> {
    return this.makeRequest<FlavorResponse>('/flavor/createOrUpdate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteFlavor(id: number): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest<{ 
      errorCode: number; 
      errorMessage: string | null; 
      data: { message: string; flavor?: any } | null 
    }>(
      `/flavor/delete/${id}`,
      {
        method: 'DELETE',
      }
    );

    if (response.errorCode === 0) {
      return {
        success: true,
        message: response.data?.message || 'Flavor deleted successfully'
      };
    }

    return {
      success: false,
      message: response.errorMessage || 'Failed to delete flavor'
    };
  }

  // Cart Methods
  async getCartDetails(): Promise<CartResponse> {
    return this.makeRequest<CartResponse>('/cart/getCartDetails', {
      method: 'GET',
    });
  }

  async addToCart(data: AddToCartRequest): Promise<CartResponse> {
    return this.makeRequest<CartResponse>('/cart/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCartItem(itemId: number, data: UpdateCartRequest): Promise<CartResponse> {
    return this.makeRequest<CartResponse>(`/cart/update/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeCartItem(itemId: number): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(
      `/cart/remove/${itemId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async clearCart(): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>('/cart/clear', {
      method: 'POST',
    });
  }

  // Order Methods
  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    return this.makeRequest<OrderResponse>('/order/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllOrders(params?: OrdersParams): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.order_status) queryParams.append('order_status', params.order_status);
    
    const queryString = queryParams.toString();
    const url = `/order${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<OrdersResponse>(url, {
      method: 'GET',
    });
  }

  async getVendorOrders(vendorId: number, params?: OrdersParams): Promise<OrdersResponse> {
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

  async getOrder(orderId: string): Promise<{ errorCode: number; errorMessage: string | null; data: any }> {
    return this.makeRequest<{ errorCode: number; errorMessage: string | null; data: any }>(`/order/${orderId}`, {
      method: 'GET',
    });
  }

  async updateOrderStatus(orderId: string, orderStatus: string): Promise<{ errorCode: number; errorMessage: string | null; data: any }> {
    return this.makeRequest<{ errorCode: number; errorMessage: string | null; data: any }>(`/order/update-status/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ order_status: orderStatus }),
    });
  }

  // Vendor Dashboard Methods
  async getVendorDashboard(): Promise<VendorDashboardResponse> {
    return this.makeRequest<VendorDashboardResponse>('/vendor/dashboard', {
      method: 'GET',
    });
  }

  async getVendorAnalytics(): Promise<VendorAnalyticsResponse> {
    return this.makeRequest<VendorAnalyticsResponse>('/vendor/analytics', {
      method: 'GET',
    });
  }

  // Upload Methods
  async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.base}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError('Failed to upload image');
    }

    return response.json();
  }

  // Payment Methods
  async createStripePaymentMethod(cardToken: string): Promise<StripePaymentMethodResponse> {
    const STRIPE_SECRET = import.meta.env.VITE_STRIPE_SECRET_KEY;

    if (!STRIPE_SECRET) {
      throw new ApiError('Stripe secret key not configured');
    }

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
      throw new ApiError(error.error?.message || 'Failed to create payment method');
    }

    return response.json();
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserData(): User | null {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }
}

export const apiService = new ApiService();