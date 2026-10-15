export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
}

export interface CategoryListResponse {
  categories: Category[];
}

export interface CategoryResponse {
  category: Category;
}