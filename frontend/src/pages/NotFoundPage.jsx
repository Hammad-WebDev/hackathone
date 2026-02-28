import { Link } from "react-router";

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-5">

            <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
            <p className="text-2xl font-semibold mt-4">Page Not Found</p>
            <p className="text-gray-600 mt-2 text-center max-w-md">
                The page you're looking for doesn't exist or has been moved to another location.
            </p>

            <Link
                to={'/'}
                className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all font-medium"
            >
                ⬅ Go Back Home
            </Link>

        </div>
    );
};

export default NotFoundPage;
