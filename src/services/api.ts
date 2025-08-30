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
    console.log('Creating/Updating category with data:', data);
    return this.makeRequest<CategoryResponse>('/category/createUpdateCategory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // async updateCategory(data: UpdateCategoryRequest): Promise<CategoryResponse> {
  //   console.log('Updating category with data:', data);
  //   const response = await this.makeRequest<CategoryResponse>('/category/createUpdateCategory', {
  //     method: 'POST',
  //     body: JSON.stringify(data),
  //   });
  //   return response;
  // }

  async deleteCategory(data: DeleteCategoryRequest): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>('/category/softDeleteOrDetach', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
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
    // console.log('Creating/Updating item with data:', data);
    return this.makeRequest<ItemResponse>('/item/createUpdateItem', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(data: UpdateItemRequest): Promise<ItemResponse> {
    // console.log('Updating item with data:', data);
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
}

export const apiService = new ApiService();