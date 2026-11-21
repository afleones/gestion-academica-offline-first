import { Student, AttendanceRecord, QueueRecord, View, Role } from "../types";
import { Icon } from "../icons";

interface ResumenViewProps {
  students: Student[];
  attendanceList: AttendanceRecord[];
  queue: QueueRecord[];
  history: QueueRecord[];
  online: boolean;
  currentRole: Role;
  onNavigate: (view: View) => void;
}

export function ResumenView({
  students,
  attendanceList,
  queue,
  history,
  online,
  currentRole,
  onNavigate,
}: ResumenViewProps) {
  // Compute today's attendance summary (2025-05-22 as canonical active date)
  const today = "2025-05-22";
  const todayRecords = attendanceList.filter((a) => a.date === today);
  const presentCount = todayRecords.filter((a) => a.status === "Presente").length;
  const absentCount = todayRecords.filter((a) => a.status === "Ausente").length;
  const excuseCount = todayRecords.filter((a) => a.status === "Excusa").length;
  const totalCount = students.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Alerts for students with grade < 3.0 or high absences
  const studentsWithAlert = students.filter(
    (s) =>
      s.grades.matematicas < 3.0 ||
      s.grades.ciencias < 3.0 ||
      s.grades.lengua < 3.0 ||
      s.absences >= 3,
  );

  return (
    <div className="view-container">
      {/* Role notice banner if viewing as Estudiante or Acudiente */}
      {currentRole === "Estudiante" && (
        <div className="role-alert-banner">
          <Icon name="lock" size={24} className="text-blue-700" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Modo Solo Lectura - Rol Estudiante (Ana Martínez)
            </strong>
            <p className="text-slate-700 text-base">
              Estás visualizando tu panel de seguimiento académico personal. Las funciones de
              edición docente están deshabilitadas.
            </p>
          </div>
        </div>
      )}

      {currentRole === "Acudiente" && (
        <div className="role-alert-banner acudiente">
          <Icon name="user" size={24} className="text-amber-800" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Modo Solo Lectura - Rol Acudiente (Carmen González Rocha)
            </strong>
            <p className="text-slate-700 text-base">
              Acceso familiar exclusivo para consulta de boletines, tareas, asistencia y observaciones de tu
              acudida (Ana Martínez González). Los datos de otros estudiantes permanecen confidenciales.
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="breadcrumb">
            EduAtlántico <span>/</span>{" "}
            {currentRole === "Administrativo" ? "Panel Ejecutivo" :
             currentRole === "Docente" ? "Panel Docente" :
             currentRole === "Estudiante" ? "Mi Panel Personal" : "Panel Familiar"}
          </span>
          <h1 className="page-title">
            {currentRole === "Administrativo" ? "Resumen Institucional" :
             currentRole === "Docente" ? "Resumen Académico" :
             currentRole === "Estudiante" ? "Mi Resumen Académico" : "Seguimiento Familiar"}
          </h1>
          <p className="page-subtitle">
            {currentRole === "Administrativo"
              ? "Monitoreo en tiempo real de desempeño offline, asistencia y cumplimiento de metas técnicas."
              : currentRole === "Docente"
                ? "Consulta rápida de asistencia del día y estado académico de tu grupo."
                : currentRole === "Estudiante"
                  ? "Tu asistencia, calificaciones y estado de tareas en un solo lugar."
                  : "Consulta de asistencia, calificaciones y boletines de tu acudido."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(currentRole === "Administrativo" || currentRole === "Docente") && (
            <button className="action-btn primary" onClick={() => onNavigate("asistencia")}>
              <Icon name="calendar" size={20} />
              <span>Tomar Asistencia</span>
            </button>
          )}
          <button className="action-btn secondary" onClick={() => onNavigate("boletines")}>
            <Icon name="report" size={20} />
            <span>Ver Boletines</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid — solo visible para Administrativo */}
      {currentRole === "Administrativo" && (
        <div className="kpi-grid">
          {/* KPI 1 */}
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-tag">LATENCIA LOCAL (INDEXEDDB)</span>
              <span className="kpi-badge success">Meta: &lt; 300 ms</span>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value text-slate-900">185 ms</span>
              <span className="kpi-status-pill text-emerald-800 bg-emerald-100">
                <Icon name="check" size={16} /> -38% vs Meta
              </span>
            </div>
            <p className="kpi-desc">
              Escritura y lectura asíncrona en cliente sin depender de la nube.
            </p>
          </div>

          {/* KPI 2 */}
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-tag">SINCRONIZACIÓN DE LOTE</span>
              <span className="kpi-badge success">Meta: ≤ 10,0 s</span>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value text-slate-900">3,4 s</span>
              <span className="kpi-status-pill text-emerald-800 bg-emerald-100">
                <Icon name="check" size={16} /> Óptimo
              </span>
            </div>
            <p className="kpi-desc">
              Envío agrupado de 50 transacciones atómicas al pasar a Modo Online.
            </p>
          </div>

          {/* KPI 3 */}
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-tag">INTEGRIDAD DE DATOS</span>
              <span className="kpi-badge success">Auditoría Cero Errores</span>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value text-slate-900">100 %</span>
              <span className="kpi-status-pill text-emerald-800 bg-emerald-100">
                <Icon name="shield" size={16} /> Sin Pérdidas
              </span>
            </div>
            <p className="kpi-desc">
              UUID v4 y checksum local verificado para cada registro académico.
            </p>
          </div>

          {/* KPI 4 */}
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-tag">BLOQUEO DE ERRORES</span>
              <span className="kpi-badge info">Validación Estricta</span>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value text-slate-900">100 %</span>
              <span className="kpi-status-pill text-blue-800 bg-blue-100">
                <Icon name="check" size={16} /> Pre-Commit
              </span>
            </div>
            <p className="kpi-desc">
              Filtra notas inválidas (&lt; 0 o &gt; 5) y previene duplicados antes de guardar.
            </p>
          </div>
        </div>
      )}

      {/* Main Content: Attendance + Alerts grid — full width for non-Admin, side panel for Admin */}
      <div className={`grid gap-6 mt-6 ${currentRole === "Administrativo" ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"}`}>
        {/* Performance Chart — solo Admin, spans 2 cols */}
        {currentRole === "Administrativo" && (
          <div className="card-surface lg:col-span-2">
            <div className="card-header-row">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Rendimiento de Operación: Offline vs Online
                </h2>
                <p className="text-base text-slate-700 mt-1">
                  Comparativa de tiempos de respuesta demostrando viabilidad en escuelas rurales del
                  Atlántico.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> IndexedDB Local
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Sincronización Cloud
                </span>
              </div>
            </div>

            <div className="chart-wrapper mt-4">
              <div className="benchmark-bars">
                <div className="benchmark-item">
                  <div className="benchmark-labels">
                    <strong className="text-base font-bold text-slate-900">Lectura inicial de planilla (60 estudiantes)</strong>
                    <span className="text-base font-bold text-slate-900">18 ms <small className="text-slate-700 font-medium">(Meta &lt; 100 ms)</small></span>
                  </div>
                  <div className="benchmark-track"><div className="benchmark-fill bg-blue-600" style={{ width: "18%" }}></div></div>
                </div>
                <div className="benchmark-item">
                  <div className="benchmark-labels">
                    <strong className="text-base font-bold text-slate-900">Escritura local de registro en IndexedDB</strong>
                    <span className="text-base font-bold text-slate-900">35 ms <small className="text-slate-700 font-medium">(Meta &lt; 150 ms)</small></span>
                  </div>
                  <div className="benchmark-track"><div className="benchmark-fill bg-blue-600" style={{ width: "23%" }}></div></div>
                </div>
                <div className="benchmark-item">
                  <div className="benchmark-labels">
                    <strong className="text-base font-bold text-slate-900">Validación de reglas y consistencia en memoria</strong>
                    <span className="text-base font-bold text-slate-900">4 ms <small className="text-slate-700 font-medium">(Meta &lt; 50 ms)</small></span>
                  </div>
                  <div className="benchmark-track"><div className="benchmark-fill bg-blue-600" style={{ width: "8%" }}></div></div>
                </div>
                <div className="benchmark-item">
                  <div className="benchmark-labels">
                    <strong className="text-base font-bold text-slate-900">Latencia total de ciclo Offline</strong>
                    <span className="text-base font-bold text-slate-900">185 ms <small className="text-slate-700 font-medium">(Meta &lt; 300 ms)</small></span>
                  </div>
                  <div className="benchmark-track"><div className="benchmark-fill bg-blue-700" style={{ width: "61%" }}></div></div>
                </div>
                <div className="benchmark-item">
                  <div className="benchmark-labels">
                    <strong className="text-base font-bold text-slate-900">Sincronización por lote online (50 registros)</strong>
                    <span className="text-base font-bold text-slate-900">3,4 s <small className="text-slate-700 font-medium">(Meta ≤ 10,0 s)</small></span>
                  </div>
                  <div className="benchmark-track"><div className="benchmark-fill bg-emerald-600" style={{ width: "34%" }}></div></div>
                </div>
              </div>
              <div className="chart-legend-box mt-4">
                <Icon name="shield" size={20} className="text-emerald-700" />
                <p className="text-sm font-medium text-slate-800">
                  <strong>Garantía de Continuidad:</strong> El sistema almacena transacciones con idempotencia (UUID v4), permitiendo reintentos seguros sin duplicar registros al reconectar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Attendance Today + Quick Alerts (Role Protected) */}
        <div className={`flex flex-col gap-6 ${currentRole !== "Administrativo" ? "lg:col-span-2" : ""}`}>
          {currentRole === "Estudiante" || currentRole === "Acudiente" ? (
            <>
              {/* Personal / Family Attendance Card */}
              <div className="card-surface">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {currentRole === "Estudiante" ? "Mi Asistencia Escolar" : "Asistencia de mi Acudida"}
                    </h3>
                    <p className="text-sm text-slate-700 font-medium">
                      Ana Martínez González · Grado 9° A · Sesión del 22 de Mayo de 2025
                    </p>
                  </div>
                  <span className="attendance-percent-tag">95%</span>
                </div>

                <div className="attendance-metric-grid mt-4">
                  <div className="metric-box present">
                    <span className="metric-num text-emerald-700">Presente</span>
                    <span className="metric-name text-slate-800 font-semibold">Estado de la Jornada</span>
                  </div>
                  <div className="metric-box absent">
                    <span className="metric-num text-slate-800">1</span>
                    <span className="metric-name text-slate-800 font-semibold">Falla Justificada</span>
                  </div>
                  <div className="metric-box excuse">
                    <span className="metric-num text-emerald-700">0</span>
                    <span className="metric-name text-slate-800 font-semibold">Sin Justificar</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-base text-slate-800 font-medium">
                    Cumplimiento de asistencia: <strong>Óptimo</strong>
                  </span>
                  <button
                    className="text-base font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
                    onClick={() => onNavigate("asistencia")}
                  >
                    Ver detalle de asistencia <Icon name="arrow" size={16} />
                  </button>
                </div>
              </div>

              {/* Personal / Family Academic Progress Card */}
              <div className="card-surface">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <span className="text-blue-700">
                    <Icon name="grade" size={22} />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {currentRole === "Estudiante" ? "Mi Desempeño Académico" : "Desempeño de mi Acudida"}
                    </h3>
                    <p className="text-sm text-slate-700 font-medium">
                      Segundo Periodo 2025 · Promedio Acumulado: <strong>4.22 / 5.0</strong>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-xs font-bold text-slate-600 uppercase block">Matemáticas</span>
                    <strong className="text-2xl font-black text-slate-900">4.5</strong>
                    <small className="text-emerald-700 font-bold block text-xs">Alto</small>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-xs font-bold text-slate-600 uppercase block">Lengua</span>
                    <strong className="text-2xl font-black text-slate-900">4.2</strong>
                    <small className="text-emerald-700 font-bold block text-xs">Alto</small>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-xs font-bold text-slate-600 uppercase block">Sociales</span>
                    <strong className="text-2xl font-black text-slate-900">4.4</strong>
                    <small className="text-emerald-700 font-bold block text-xs">Alto</small>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-xs font-bold text-slate-600 uppercase block">Inglés</span>
                    <strong className="text-2xl font-black text-slate-900">4.1</strong>
                    <small className="text-emerald-700 font-bold block text-xs">Alto</small>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-base text-slate-800 font-medium">
                    Habeas Data Ley 1581: <strong>Consentimiento Activo</strong>
                  </span>
                  <button
                    className="action-btn primary text-sm py-1.5 px-4"
                    onClick={() => onNavigate("boletines")}
                  >
                    <Icon name="report" size={16} />
                    <span>Consultar Boletín Completo</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Attendance of the day card for Docente / Admin */}
              <div className="card-surface">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Asistencia de la Jornada</h3>
                    <p className="text-sm text-slate-700 font-medium">
                      Fecha: 22 de Mayo de 2025 · Grado 9° A
                    </p>
                  </div>
                  <span className="attendance-percent-tag">{attendanceRate}%</span>
                </div>

                <div className="attendance-metric-grid mt-4">
                  <div className="metric-box present">
                    <span className="metric-num text-emerald-700">{presentCount}</span>
                    <span className="metric-name text-slate-800 font-semibold">Presentes</span>
                  </div>
                  <div className="metric-box absent">
                    <span className="metric-num text-red-700">{absentCount}</span>
                    <span className="metric-name text-slate-800 font-semibold">Ausentes</span>
                  </div>
                  <div className="metric-box excuse">
                    <span className="metric-num text-amber-700">{excuseCount}</span>
                    <span className="metric-name text-slate-800 font-semibold">Excusas</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-base text-slate-800 font-medium">
                    Total estudiantes: <strong>{totalCount}</strong>
                  </span>
                  <button
                    className="text-base font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
                    onClick={() => onNavigate("asistencia")}
                  >
                    Gestionar asistencia <Icon name="arrow" size={16} />
                  </button>
                </div>
              </div>

              {/* Early warning alerts card for Docente / Admin */}
              <div className="card-surface">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <span className="text-amber-700">
                    <Icon name="warning" size={22} />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Alertas Tempranas ({studentsWithAlert.length})
                    </h3>
                    <p className="text-sm text-slate-700 font-medium">
                      Riesgo académico o fallas acumuladas en el grupo
                    </p>
                  </div>
                </div>

                <div className="alerts-list mt-3">
                  {studentsWithAlert.map((s) => (
                    <div key={s.id} className="alert-row">
                      <span className="alert-avatar" style={{ background: s.color }}>
                        {s.initials}
                      </span>
                      <div className="flex-1">
                        <strong className="text-base text-slate-900 font-bold block">{s.name}</strong>
                        <span className="text-sm text-slate-700 font-medium">
                          Mat: {s.grades.matematicas} · Fallas: {s.absences}
                        </span>
                      </div>
                      <button
                        className="view-bulletin-mini-btn"
                        onClick={() => onNavigate("boletines")}
                        title="Ver boletín de este estudiante"
                      >
                        Boletín
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
