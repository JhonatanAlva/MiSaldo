import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import RutaAdmin from "./components/admin/RutaAdmin";
import Admin from "./pages/Admin";
import RutaUsuario from "./components/user/RutaUsuario";
import PanelUsuario from "./pages/PanelUsuario";
import OAuthSuccess from "./pages/OAuthSuccess";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route path="/oauth-success" element={<OAuthSuccess />} />

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