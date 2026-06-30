const SpinnerCentrado = ({ texto = "Cargando..." }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="w-7 h-7 rounded-full border-2 border-[#00c57a] border-t-transparent animate-spin" />
    {texto && <p className="text-sm text-gray-400">{texto}</p>}
  </div>
);

export default SpinnerCentrado;
