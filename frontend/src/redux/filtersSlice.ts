import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SortBy = "date" | "amount" | "title" | "createdAt";
export type SortOrder = "asc" | "desc";

export interface FiltersState {
  search: string;
  categoryIds: string[];
  paymentMethods: string[];
  dateFrom: string | null; // "YYYY-MM-DD"
  dateTo: string | null;   // "YYYY-MM-DD"
  sortBy: SortBy;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

const initialState: FiltersState = {
  search: "",
  categoryIds: [],
  paymentMethods: [],
  dateFrom: null,
  dateTo: null,
  sortBy: "date",
  sortOrder: "desc",
  page: 1,
  limit: 20,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1; // reset pagination when the query changes
    },
    toggleCategory(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.categoryIds.includes(id)) {
        state.categoryIds = state.categoryIds.filter((c) => c !== id);
      } else {
        state.categoryIds.push(id);
      }
      state.page = 1;
    },
    togglePaymentMethod(state, action: PayloadAction<string>) {
      const m = action.payload;
      if (state.paymentMethods.includes(m)) {
        state.paymentMethods = state.paymentMethods.filter((p) => p !== m);
      } else {
        state.paymentMethods.push(m);
      }
      state.page = 1;
    },
    setDateFrom(state, action: PayloadAction<string | null>) {
      state.dateFrom = action.payload;
      state.page = 1;
    },
    setDateTo(state, action: PayloadAction<string | null>) {
      state.dateTo = action.payload;
      state.page = 1;
    },
    setSort(
      state,
      action: PayloadAction<{ sortBy: SortBy; sortOrder: SortOrder }>
    ) {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.page = 1;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setSearch,
  toggleCategory,
  togglePaymentMethod,
  setDateFrom,
  setDateTo,
  setSort,
  setPage,
  setLimit,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
