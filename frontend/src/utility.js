import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const http = axios.create({
  baseURL: "http://localhost:3000",
});

export const showSuccess = (message) => {
  toast.success(message, {
    autoClose: 3000,
    position: "top-right",
    theme: "colored",
  });
};
