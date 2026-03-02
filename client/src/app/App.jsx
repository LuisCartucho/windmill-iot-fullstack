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
    // ✅ Public
    { path: "/login", element: <Login /> },

    // ✅ Protected app ONLY under /app/*
    {
        path: "/app/*",
        element: (
            <RequireAuth>
                <Shell />
            </RequireAuth>
        ),
        children: [
            { index: true, element: <Monitor /> },          // /app
            { path: "control", element: <Control /> },      // /app/control
            { path: "alerts", element: <Alerts /> },        // /app/alerts
            { path: "history", element: <ActionHistory /> } // /app/history
        ],
    },

    // redirect root to /app
    { path: "/", element: <Navigate to="/app" replace /> },

    // unknown -> login
    { path: "*", element: <Navigate to="/login" replace /> },
]);

export default function App() {
    return <RouterProvider router={router} />;
}