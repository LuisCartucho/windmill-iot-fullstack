import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import Shell from "../layout/Shell";
import Monitor from "../pages/Monitor";
import Control from "../pages/Control";
import Alerts from "../pages/Alerts";
import ActionHistory from "../pages/ActionHistory";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

const router = createBrowserRouter([
    { path: "/login", element: <Login /> },  // Public Login Route

    {
        path: "/app/*",
        element: (
            <RequireAuth>
                <Shell />
            </RequireAuth>
        ),
        children: [
            { index: true, element: <Dashboard /> },         // /app (default route)
            { path: "monitor", element: <Monitor /> },       // /app/monitor
            { path: "control", element: <Control /> },       // /app/control
            { path: "alerts", element: <Alerts /> },         // /app/alerts
            { path: "history", element: <ActionHistory /> }, // /app/history
        ],
    },

    { path: "/", element: <Navigate to="/app" replace /> },  // Redirect from root to /app

    { path: "*", element: <Navigate to="/login" replace /> }, // Redirect from any undefined route to login
]);

export default function App() {
    return <RouterProvider router={router} />;
}