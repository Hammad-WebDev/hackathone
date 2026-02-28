import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

let toastId = null;

const Notification = ({ error }) => {

  useEffect(() => {
    if (error) {
      if (!toast.isActive(toastId)) {
        toastId = toast.error(error, {
          autoClose: 3000,
          position: "top-right",
          theme: "colored",
        });
      }
    }
  }, [error]);

  return <ToastContainer />;
};

export default Notification;
