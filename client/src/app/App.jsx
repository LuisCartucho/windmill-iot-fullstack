import { createBrowserRouter, RouterProvider } from "react-router";
import Shell from "../layout/Shell";
import Monitor from "../pages/Monitor";
import Control from "../pages/Control";
import Alerts from "../pages/Alerts";
import ActionHistory from "../pages/ActionHistory";
import Login from "../pages/Login";

const router = createBrowserRouter([
    {
        element: <Shell />,
        children: [
            { path: "/", element: <Monitor /> },
            { path: "/control", element: <Control /> },
            { path: "/alerts", element: <Alerts /> },
            { path: "/history", element: <ActionHistory /> },
        ],
    },
    { path: "/login", element: <Login /> },
]);

export default function App() {
    return <RouterProvider router={router} />;
}
