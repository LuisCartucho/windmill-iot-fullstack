import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import Shell from "../layout/Shell";
import Monitor from "../pages/Monitor";
import Control from "../pages/Control";
import Alerts from "../pages/Alerts";
import ActionHistory from "../pages/ActionHistory";
import Login from "../pages/Login";

function RequireAuth({ children }) {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;
    return children;
}

const router = createBrowserRouter([
    // If someone hits "/", require auth
    {
        element: (
            <RequireAuth>
                <Shell />
            </RequireAuth>
        ),
        children: [
            { path: "/", element: <Monitor /> },
            { path: "/control", element: <Control /> },
            { path: "/alerts", element: <Alerts /> },
            { path: "/history", element: <ActionHistory /> },
        ],
    },

    // Login route (public)
    { path: "/login", element: <Login /> },

    // Any unknown route -> go home
    { path: "*", element: <Navigate to="/" replace /> },
]);

export default function App() {
    return <RouterProvider router={router} />;
}