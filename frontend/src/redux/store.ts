// frontend/src/redux/store.ts

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import filtersReducer from "./filtersSlice";

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed versions of the standard hooks
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();