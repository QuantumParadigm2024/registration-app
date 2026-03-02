import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    loading: false
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        }
    }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;