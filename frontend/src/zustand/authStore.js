import { create } from 'zustand';
import Cookies from 'js-cookie';
import axios from 'axios';

let token = Cookies.get('token');

const useAuthStore = create((set) => ({
    token: token || null,
    user: null,
    isCheckingAuth: true,

    setToken: (token) => set({ token }),
}));

export const getUserFromToken = async () => {
    try {
        useAuthStore.setState({ isCheckingAuth: true });
        token = Cookies.get('token');
        if (!token) {
            useAuthStore.setState({ user: null, token: null });
            return;
        }

        let res = await axios.get("http://localhost:3000/auth/verify",
            {
                headers: { Authorization: `Bearer ${token}` }
            });

        useAuthStore.setState({ user: res.data.user });

    } catch (error) {
        useAuthStore.setState({ user: null, token: null });
        console.log(error);
    } finally {
        useAuthStore.setState({ isCheckingAuth: false });
    }
}
getUserFromToken();

export default useAuthStore;
