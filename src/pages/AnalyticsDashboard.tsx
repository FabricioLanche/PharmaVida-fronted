import React, { useEffect, useState } from "react";
import { fetchAnalitica, fetchAnaliticaRaw } from "../services/analitica/analiticaAPI";

type Fila = Record<string, string | number>;

export default function AnalyticsDashboard() {
  const [datos, setDatos] = useState<Fila[]>([]);
  const [status, setStatus] = useState("Conectando...");
  const [consultaActiva, setConsultaActiva] = useState("ventas");
  const [columnas, setColumnas] = useState<string[]>([]);

  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 10;

  const cargarDatos = async (endpoint: string) => {
    setStatus("Cargando datos...");
    setConsultaActiva(endpoint);
    setPaginaActual(1);
    try {
      const ping = await fetchAnaliticaRaw("ping");
      const pingMsg = (ping && (ping.message || ping.status || ping.msg)) ||
        "Conectado correctamente con Flask y Athena ✅";
      setStatus(String(pingMsg));

      const data = await fetchAnalitica(endpoint);
      if (Array.isArray(data) && data.length > 0) {
        setColumnas(Object.keys(data[0] as Fila));
        setDatos(data as Fila[]);
      } else {
        setColumnas([]);
        setDatos([]);
      }
    } catch (error: any) {
      setStatus(`Error al conectar con backend 😔`);
      setColumnas([]);
      setDatos([]);
    }
  };

  useEffect(() => {
    cargarDatos("ventas");
  }, []);

  const totalPaginas = Math.ceil(datos.length / filasPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * filasPorPagina;
  const datosPagina = datos.slice(indiceInicio, indiceInicio + filasPorPagina);

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel Analítico</h1>
      <p className="text-gray-600 mb-4">{status}</p>

      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { id: "ventas", label: "Ventas por Día" },
          { id: "top-productos", label: "Top Productos" },
          { id: "top-usuarios", label: "Top Usuarios" },
          { id: "productos-sin-venta", label: "Productos sin Venta" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => cargarDatos(item.id)}
            className={`px-4 py-2 rounded transition ${
              consultaActiva === item.id
                ? "bg-green-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {columnas.map((col, idx) => (
                <th
                  key={idx}
                  className="border border-gray-300 px-4 py-2 text-left capitalize"
                >
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datosPagina.length > 0 ? (
              datosPagina.map((fila, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {columnas.map((col) => (
                    <td key={col} className="border border-gray-300 px-4 py-2">
                      {fila[col]?.toString() || ""}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columnas.length || 1}
                  className="text-center py-3 text-gray-500"
                >
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {datos.length > filasPorPagina && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className={`px-3 py-1 rounded ${
              paginaActual === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            ← Anterior
          </button>

          <span className="text-gray-700">
            Página {paginaActual} de {totalPaginas}
          </span>

          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className={`px-3 py-1 rounded ${
              paginaActual === totalPaginas
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Siguiente &rarr;
          </button>
        </div>
      )}
    </div>
  );
}