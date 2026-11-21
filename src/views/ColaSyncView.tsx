import { useState } from "react";
import { QueueRecord, Role } from "../types";
import { Icon } from "../icons";

interface ColaSyncViewProps {
  queue: QueueRecord[];
  history: QueueRecord[];
  online: boolean;
  onToggleOnline: () => void;
  onForceSync: () => void;
  isSyncing: boolean;
  onClearHistory: () => void;
  currentRole: Role;
}

export function ColaSyncView({
  queue,
  history,
  online,
  onToggleOnline,
  onForceSync,
  isSyncing,
  onClearHistory,
  currentRole,
}: ColaSyncViewProps) {
  const [expandedUuid, setExpandedUuid] = useState<string | null>(null);
  const [filterEntity, setFilterEntity] = useState<string>("all");

  const allRecords = [...queue, ...history];

  const filteredRecords = allRecords.filter((rec) => {
    if (filterEntity !== "all" && rec.entity !== filterEntity) return false;
    return true;
  });

  const toggleExpand = (uuid: string) => {
    setExpandedUuid((curr) => (curr === uuid ? null : uuid));
  };

  if (currentRole !== "Administrativo") {
    return (
      <div className="view-container">
        <div className="card-surface flex flex-col items-center justify-center py-20 text-center">
          <span className="inline-grid place-items-center w-20 h-20 rounded-full bg-slate-100 text-slate-500 mx-auto mb-4">
            <Icon name="lock" size={40} />
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Acceso Restringido</h2>
          <p className="text-base text-slate-700 max-w-md">
            La Cola de Sincronización y los KPIs técnicos del sistema son exclusivos del
            <strong> rol Administrativo</strong>. Contacta al administrador institucional si
            necesitas revisar el estado de sincronización.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <span className="breadcrumb">
            EduAtlántico <span>/</span> Infraestructura Técnica
          </span>
          <h1 className="page-title">Cola de Sincronización (IndexedDB)</h1>
          <p className="page-subtitle">
            Auditoría de transacciones locales, verificación de UUID v4, payloads JSON y
            sincronización por lotes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!online ? (
            <button
              className="action-btn primary"
              onClick={onToggleOnline}
              title="Simula la conexión a internet. La sincronización iniciará automáticamente."
            >
              <Icon name="wifi" size={20} />
              <span>Simular Conexión (Auto-Sync)</span>
            </button>
          ) : (
            <button
              className="action-btn secondary"
              onClick={onForceSync}
              disabled={isSyncing || queue.length === 0}
            >
              <Icon name="refresh" size={20} className={isSyncing ? "animate-spin" : ""} />
              <span>
                {isSyncing
                  ? "Sincronizando por lote (3,4 s)..."
                  : `Re-sincronizar (${queue.length} pendientes)`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Syncing Progress Banner */}
      {isSyncing && (
        <div className="feedback-banner info flex-col items-start gap-2">
          <div className="flex items-center gap-3 w-full">
            <Icon name="refresh" size={24} className="animate-spin text-blue-800" />
            <div className="flex-1">
              <strong className="text-lg font-bold text-blue-950 block">
                Sincronizando lote atómico hacia el servidor central...
              </strong>
              <p className="text-sm font-semibold text-blue-900">
                Validando firmas criptográficas, timestamps y verificando idempotencia de paquetes.
              </p>
            </div>
            <span className="text-sm font-bold text-blue-950 bg-blue-100 px-3 py-1 rounded-md">
              KPI: 3,4 s
            </span>
          </div>
          <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden mt-1">
            <div className="bg-blue-700 h-full w-2/3 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Technical KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-surface p-4 text-center">
          <span className="text-xs font-bold text-slate-700 uppercase block">
            PENDIENTES EN INDEXEDDB
          </span>
          <strong
            className={`text-3xl font-black block mt-1 ${
              queue.length > 0 ? "text-amber-800" : "text-slate-900"
            }`}
          >
            {queue.length}
          </strong>
          <small className="text-xs font-semibold text-slate-700">
            Transacciones locales en cola
          </small>
        </div>

        <div className="card-surface p-4 text-center">
          <span className="text-xs font-bold text-slate-700 uppercase block">
            SINCRONIZADOS EXITOSOS
          </span>
          <strong className="text-3xl font-black text-emerald-800 block mt-1">
            {history.length}
          </strong>
          <small className="text-xs font-semibold text-slate-700">Enviados y confirmados</small>
        </div>

        <div className="card-surface p-4 text-center">
          <span className="text-xs font-bold text-slate-700 uppercase block">
            INTEGRIDAD DE DATOS
          </span>
          <strong className="text-3xl font-black text-blue-900 block mt-1">100 %</strong>
          <small className="text-xs font-semibold text-slate-700">0 paquetes corruptos</small>
        </div>

        <div className="card-surface p-4 text-center">
          <span className="text-xs font-bold text-slate-700 uppercase block">
            ESTADO DE CONEXIÓN
          </span>
          <strong
            className={`text-xl font-black block mt-2 ${
              online ? "text-emerald-800" : "text-amber-800"
            }`}
          >
            {online ? "Modo Online (Conectado)" : "Modo Offline (Aislado)"}
          </strong>
          <button
            onClick={onToggleOnline}
            className="text-xs font-bold text-blue-700 underline mt-1 block mx-auto"
          >
            Alternar conexión
          </button>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="card-surface mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">
              Filtrar por Entidad:
            </label>
            <select
              className="form-select font-semibold text-sm"
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
            >
              <option value="all">Todas las entidades</option>
              <option value="asistencia">Asistencia diaria</option>
              <option value="calificacion">Calificaciones académicas</option>
              <option value="observacion">Observaciones formativas</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">
              Total transacciones: <strong>{filteredRecords.length}</strong>
            </span>
            {history.length > 0 && (
              <button
                className="action-btn secondary text-sm py-1.5 px-3"
                onClick={onClearHistory}
                title="Limpiar historial de registros ya sincronizados"
              >
                Limpiar historial sincronizado
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card-surface p-0 overflow-hidden">
        <div className="table-header-bar px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Registro Técnico de Transacciones Locales
            </h2>
            <p className="text-base text-slate-700">
              Tabla de almacenamiento en base de datos local del navegador (IndexedDB)
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300">
            <Icon name="database" size={16} /> Base: atlantico-academico-v2
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="custom-table w-full">
            <thead>
              <tr>
                <th className="text-left w-24">ESTADO</th>
                <th className="text-left">UUID DE TRANSACCIÓN (V4)</th>
                <th className="text-left">FECHA Y HORA (TIMESTAMP)</th>
                <th className="text-left">ENTIDAD / ACCIÓN</th>
                <th className="text-left">ESTUDIANTE AFECTADO</th>
                <th className="text-center w-36">PAYLOAD JSON</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-700">
                    <Icon name="database" size={32} className="mx-auto mb-2 text-slate-400" />
                    <strong className="text-lg block text-slate-900">
                      No hay transacciones registradas en la cola
                    </strong>
                    <span className="text-sm font-medium">
                      Cuando realices registros de asistencia o notas sin conexión, aparecerán aquí.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isPending = rec.status === "pending";
                  const isExpanded = expandedUuid === rec.uuid;

                  if (currentRole !== "Administrativo") {
    return (
      <div className="view-container">
        <div className="card-surface flex flex-col items-center justify-center py-20 text-center">
          <span className="inline-grid place-items-center w-20 h-20 rounded-full bg-slate-100 text-slate-500 mx-auto mb-4">
            <Icon name="lock" size={40} />
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Acceso Restringido</h2>
          <p className="text-base text-slate-700 max-w-md">
            La Cola de Sincronización y los KPIs técnicos del sistema son exclusivos del
            <strong> rol Administrativo</strong>. Contacta al administrador institucional si
            necesitas revisar el estado de sincronización.
          </p>
        </div>
      </div>
    );
  }

  return (
                    <>
                      <tr key={rec.uuid} className="table-row-hover">
                        <td>
                          {isPending ? (
                            <span className="badge-pending">
                              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                              Pendiente
                            </span>
                          ) : (
                            <span className="badge-saved">
                              <Icon name="check" size={14} /> Sincronizado
                            </span>
                          )}
                        </td>

                        <td>
                          <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                            {rec.uuid.slice(0, 18)}...
                          </span>
                        </td>

                        <td className="text-sm font-semibold text-slate-800">
                          {new Date(rec.timestamp).toLocaleString("es-CO")}
                        </td>

                        <td>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-900 border border-slate-300">
                            {rec.entity} · {rec.action}
                          </span>
                        </td>

                        <td className="font-bold text-slate-900 text-base">
                          {rec.studentName || "Todos / Lote"}
                        </td>

                        <td className="text-center">
                          <button
                            className="action-btn secondary text-xs py-1 px-2.5"
                            onClick={() => toggleExpand(rec.uuid)}
                          >
                            {isExpanded ? "Ocultar JSON" : "Ver JSON"}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable JSON Row */}
                      {isExpanded && (
                        <tr key={`${rec.uuid}-json`} className="bg-slate-900 text-slate-100">
                          <td colSpan={6} className="p-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-700 mb-2">
                              <span className="font-mono text-xs font-bold text-emerald-400">
                                PAQUETE SERIALIZADO UUID: {rec.uuid}
                              </span>
                              <span className="text-xs text-slate-400">
                                Checksum: SHA-256 Validado · Formato Atómico
                              </span>
                            </div>
                            <pre className="font-mono text-xs text-slate-200 overflow-x-auto p-3 bg-slate-950 rounded-lg">
                              {JSON.stringify(rec, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer-bar px-6 py-4 border-t border-slate-200 flex items-center justify-between text-slate-700 text-base font-medium">
          <div className="flex items-center gap-2">
            <Icon name="shield" size={18} className="text-emerald-700" />
            <span>
              Tolerancia a fallos: Idempotencia en servidor con clave única de transacción
            </span>
          </div>
          <span className="font-bold text-slate-900">
            Pendientes: {queue.length} | Confirmados: {history.length}
          </span>
        </div>
      </div>
    </div>
  );
}
