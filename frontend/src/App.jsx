import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import RutaAdmin from "./components/admin/RutaAdmin";
import Admin from "./pages/Admin";
import RutaUsuario from "./components/user/RutaUsuario";
import PanelUsuario from "./pages/PanelUsuario";
import OAuthSuccess from "./pages/OAuthSuccess";
import OlvideContrasena from "./pages/OlvideContrasena";
import RestablecerContrasena from "./pages/RestablecerContrasena";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route path="/oauth-success" element={<OAuthSuccess />} />

        <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
        <Route path="/restablecer/:token" element={<RestablecerContrasena />} />

        <Route
          path="/admin"
          element={
            <RutaAdmin>
              <Admin />
            </RutaAdmin>
          }
        />

        <Route
          path="/usuario"
          element={
            <RutaUsuario>
              <PanelUsuario />
            </RutaUsuario>
          }
        />

        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;