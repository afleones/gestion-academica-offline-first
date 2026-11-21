import { useState } from "react";
import { QueueRecord, Role } from "../types";
import { Icon } from "../icons";

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: QueueRecord[];
  history: QueueRecord[];
  online: boolean;
  onToggleOnline: () => void;
  onForceSync: () => void;
  isSyncing: boolean;
  onClearHistory: () => void;
  currentRole?: Role | null;
}

export function QueueDrawer({
  isOpen,
  onClose,
  queue,
  history,
  online,
  onToggleOnline,
  onForceSync,
  isSyncing,
  onClearHistory,
  currentRole,
}: QueueDrawerProps) {
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [expandedUuid, setExpandedUuid] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentRecords = tab === "pending" ? queue : history;

  const toggleExpand = (uuid: string) => {
    setExpandedUuid((curr) => (curr === uuid ? null : uuid));
  };

  return (
    <div className="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside
        className="queue-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="queue-drawer-title"
      >
        {/* Header */}
        <header className="queue-drawer-header">
          <div className="flex items-center gap-3">
            <span className="drawer-icon">
              <Icon name="database" size={24} />
            </span>
            <div>
              <h2
                id="queue-drawer-title"
                className="text-xl font-extrabold text-slate-900 leading-tight"
              >
                Cola de Sincronización
              </h2>
              <p className="text-sm font-semibold text-slate-700">
                IndexedDB Local · Sesión: {currentRole || "Docente"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Cerrar panel de sincronización"
          >
            <Icon name="close" size={24} />
          </button>
        </header>

        {/* Stats Summary Grid */}
        <div className="drawer-stats-grid">
          <div className="drawer-stat-card">
            <span className="stat-label">PENDIENTES</span>
            <strong
              className={`stat-number ${queue.length > 0 ? "text-amber-800" : "text-slate-900"}`}
            >
              {queue.length}
            </strong>
            <small className="stat-sub">en esta sesión</small>
          </div>

          <div className="drawer-stat-card">
            <span className="stat-label">SINCRONIZADOS</span>
            <strong className="stat-number text-emerald-800">{history.length}</strong>
            <small className="stat-sub">en esta sesión</small>
          </div>

          <div className="drawer-stat-card">
            <span className="stat-label">INTEGRIDAD</span>
            <strong className="stat-number text-blue-900">100%</strong>
            <small className="stat-sub">paquetes válidos</small>
          </div>
        </div>

        {/* Connection status bar with auto-sync notice */}
        <div
          className={`drawer-conn-bar ${
            online ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={online ? "text-emerald-700" : "text-amber-700"}>
              <Icon name={online ? "wifi" : "cloudOff"} size={22} />
            </span>
            <div>
              <strong className="text-base font-bold text-slate-900 block leading-tight">
                {online ? "Modo Online (Conectado)" : "Modo Offline (Sin Internet)"}
              </strong>
              <small className="text-sm font-semibold text-slate-700">
                {online
                  ? "Sincronización automática de cambios activa."
                  : "Al alternar a Online, se sincronizará automáticamente."}
              </small>
            </div>
          </div>
          <button
            type="button"
            className={`toggle ${online ? "on" : ""}`}
            onClick={onToggleOnline}
            title="Haz clic para alternar internet y sincronizar automáticamente"
          >
            <i />
          </button>
        </div>

        {/* Syncing Progress Indicator */}
        {isSyncing && (
          <div className="mx-5 my-2 p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between text-sm font-bold text-blue-950 mb-1">
              <span className="flex items-center gap-2">
                <Icon name="refresh" size={16} className="animate-spin text-blue-800" />
                Sincronizando automáticamente en segundo plano...
              </span>
              <span>Meta KPI: 3,4 s</span>
            </div>
            <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-3/4 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Tab switcher: Pendientes vs Sincronizados */}
        <div className="drawer-tabs-row">
          <button
            className={`drawer-tab-btn ${tab === "pending" ? "active" : ""}`}
            onClick={() => setTab("pending")}
          >
            <span>Pendientes ({queue.length})</span>
          </button>
          <button
            className={`drawer-tab-btn ${tab === "history" ? "active" : ""}`}
            onClick={() => setTab("history")}
          >
            <span>Historial Sincronizado ({history.length})</span>
          </button>
        </div>

        {/* Records list */}
        <div className="drawer-content-scroll">
          {currentRecords.length === 0 ? (
            <div className="drawer-empty-state">
              <span className="empty-icon-wrap">
                <Icon name="database" size={32} />
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-3">
                {tab === "pending"
                  ? `No hay cambios pendientes en tu sesión`
                  : "Historial de sincronización de la sesión vacío"}
              </h4>
              <p className="text-base text-slate-700 mt-1 max-w-xs mx-auto">
                {tab === "pending"
                  ? "Las modificaciones que realices en modo offline se registrarán aquí y se sincronizarán de forma automática al activar el internet."
                  : "Al pasar a Modo Online, los paquetes procesados de tu sesión se reflejarán aquí."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentRecords.map((record, index) => {
                const isExpanded = expandedUuid === record.uuid;

                return (
                  <article key={record.uuid} className="package-card">
                    <div className="package-card-header">
                      <div className="flex items-center gap-2.5">
                        <span className="package-index">#{String(index + 1).padStart(2, "0")}</span>
                        <div>
                          <strong className="text-base font-bold text-slate-900 block leading-tight">
                            {record.studentName || "Lote Académico"}
                          </strong>
                          <span className="text-xs font-semibold uppercase text-slate-700">
                            {record.entity} · {record.action}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`status-chip ${
                          record.status === "pending" ? "pending" : "synced"
                        }`}
                      >
                        {record.status === "pending" ? "PENDIENTE" : "SINCRONIZADO"}
                      </span>
                    </div>

                    <div className="package-card-meta">
                      <span className="text-xs font-mono text-slate-700 font-bold">
                        UUID: {record.uuid.slice(0, 20)}...
                      </span>
                      <button
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                        onClick={() => toggleExpand(record.uuid)}
                      >
                        {isExpanded ? "Ocultar JSON" : "Ver JSON"}
                      </button>
                    </div>

                    {isExpanded && (
                      <pre className="package-json-viewer">{JSON.stringify(record, null, 2)}</pre>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <footer className="queue-drawer-footer">
          {!online ? (
            <>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3 text-left">
                <div className="flex items-start gap-2">
                  <span className="text-amber-800 mt-0.5 shrink-0">
                    <Icon name="wifi" size={18} />
                  </span>
                  <div className="text-xs text-slate-800">
                    <strong className="font-bold text-amber-950 block">Sincronización Automática</strong>
                    <p className="mt-0.5 leading-snug font-medium text-slate-700">
                      Al alternar a <strong>Modo Online</strong>, los <strong>{queue.length}</strong>{" "}
                      cambio(s) de tu sesión se sincronizarán <strong>automáticamente sin presionar ningún botón</strong>.
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="action-btn primary w-full text-base py-3 font-bold"
                onClick={onToggleOnline}
              >
                <Icon name="wifi" size={20} />
                <span>Simular Conexión a Internet (Auto-Sync)</span>
              </button>
            </>
          ) : isSyncing ? (
            <button
              type="button"
              className="action-btn primary w-full text-base py-3 font-bold"
              disabled
            >
              <Icon name="refresh" size={20} className="animate-spin" />
              <span>Sincronizando automáticamente (3,4 s)...</span>
            </button>
          ) : queue.length === 0 ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="text-emerald-900 font-bold text-sm flex items-center justify-center gap-2">
                <Icon name="check" size={18} className="text-emerald-700" />
                Todos los cambios de tu sesión están sincronizados
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="action-btn secondary w-full text-base py-2.5 font-bold"
              onClick={onForceSync}
            >
              <Icon name="refresh" size={20} />
              <span>Re-sincronizar ({queue.length} pendientes)</span>
            </button>
          )}

          {history.length > 0 && (
            <button
              className="w-full text-center text-sm font-bold text-slate-700 hover:text-slate-900 mt-2 py-1"
              onClick={onClearHistory}
            >
              Limpiar historial sincronizado
            </button>
          )}

          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
            <Icon name="shield" size={16} className="text-emerald-700" />
            <span>Paquete cifrado · UUID v4 · Ley 1581 de 2012</span>
          </div>
        </footer>
      </aside>
    </div>
  );
}
