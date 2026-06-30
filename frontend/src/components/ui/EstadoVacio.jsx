const EstadoVacio = ({ icono, titulo, descripcion }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
    <span className="text-5xl">{icono}</span>
    <p className="font-semibold text-base mt-1">{titulo}</p>
    {descripcion && <p className="text-sm text-gray-400">{descripcion}</p>}
  </div>
);

export default EstadoVacio;
