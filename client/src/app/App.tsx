import { createBrowserRouter, RouterProvider, Navigate, useNavigate } from "react-router";
import Shell from "../layout/Shell";
import Monitor from "../pages/Monitor";
import Control from "../pages/Control";
import Alerts from "../pages/Alerts";
import CommandHistory from "../pages/CommandHistory";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import { ReactNode, useEffect } from "react";
import {
    clearAuthSession,
    getToken,
    isAuthenticated,
    isOperator,
    isSessionExpired,
    touchAuthActivity,
} from "../api/http";

function RequireAuth({ children }: { children: ReactNode }) {
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function RequireOperator({ children }: { children: ReactNode }) {
    if (!isOperator()) return <Navigate to="/app/monitor" replace />;
    return <>{children}</>;
}

function AuthSessionWatcher() {
    const navigate = useNavigate();

    useEffect(() => {
        const events: Array<keyof WindowEventMap> = [
            "click",
            "keydown",
            "mousemove",
            "scroll",
            "touchstart",
        ];

        const handleActivity = () => {
            if (getToken()) {
                touchAuthActivity();
            }
        };

        const checkExpiry = () => {
            if (isSessionExpired()) {
                clearAuthSession();
                navigate("/login", { replace: true });
            }
        };

        events.forEach((event) => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        const intervalId = window.setInterval(checkExpiry, 30_000);

        checkExpiry();

        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });

            window.clearInterval(intervalId);
        };
    }, [navigate]);

    return null;
}

function AppLayout() {
    return (
        <>
            <AuthSessionWatcher />
            <Shell />
        </>
    );
}

const router = createBrowserRouter([
    { path: "/login", element: <Login /> },

    {
        path: "/app/*",
        element: (
            <RequireAuth>
                <AppLayout />
            </RequireAuth>
        ),
        children: [
            { index: true, element: <Dashboard /> },
            { path: "monitor", element: <Monitor /> },
            {
                path: "control",
                element: (
                    <RequireOperator>
                        <Control />
                    </RequireOperator>
                ),
            },
            { path: "alerts", element: <Alerts /> },
            { path: "history", element: <CommandHistory /> },
        ],
    },

    { path: "/", element: <Navigate to="/app" replace /> },
    { path: "*", element: <Navigate to="/login" replace /> },
]);

export default function App() {
    return <RouterProvider router={router} />;
}