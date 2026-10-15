import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Typed versions of the standard hooks. Use these everywhere in the app.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();