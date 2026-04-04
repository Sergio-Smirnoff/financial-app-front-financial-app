import { api } from './client'
import type { Category, CreateCategoryRequest, CreateSubcategoryRequest, Subcategory } from '@/types/finances'

const BASE = '/api/v1/finances'

export const categoriesApi = {
  getTree: () =>
    api.get<Category[]>(`${BASE}/categories`),

  create: (data: CreateCategoryRequest) =>
    api.post<Category>(`${BASE}/categories`, data),

  createSubcategory: (parentId: number, data: CreateSubcategoryRequest) =>
    api.post<Subcategory>(`${BASE}/categories/${parentId}/subcategories`, data),

  deleteCategory: (id: number) =>
    api.delete<void>(`${BASE}/categories/${id}`),

  deleteSubcategory: (id: number) =>
    api.delete<void>(`${BASE}/subcategories/${id}`),
}
