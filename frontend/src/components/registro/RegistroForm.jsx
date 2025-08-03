import React, { useState } from 'react';
import axios from 'axios';

const RegistroForm = ({ setMensaje }) => {
  const [formulario, setFormulario] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    celular: '',
    contrasena: ''
  });

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/auth/registro', formulario);
      setMensaje('✅ Usuario registrado correctamente. Revisa tu correo.');
      setFormulario({
        nombres: '',
        apellidos: '',
        correo: '',
        celular: '',
        contrasena: ''
      });
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'Error al registrar usuario');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombres" type="text" className="form-control mb-2" placeholder="Nombres" value={formulario.nombres} onChange={handleChange} required />
      <input name="apellidos" type="text" className="form-control mb-2" placeholder="Apellidos" value={formulario.apellidos} onChange={handleChange} required />
      <input name="correo" type="email" className="form-control mb-2" placeholder="Correo" value={formulario.correo} onChange={handleChange} required />
      <input name="celular" type="text" className="form-control mb-2" placeholder="Celular" value={formulario.celular} onChange={handleChange} required />
      <input name="contrasena" type="password" className="form-control mb-3" placeholder="Contraseña" value={formulario.contrasena} onChange={handleChange} required />
      <button type="submit" className="btn btn-success w-100">Registrarse</button>
    </form>
  );
};

export default RegistroForm;