import { useState } from "react";
import { Student, ObservationRecord, Role } from "../types";
import { Icon } from "../icons";

interface ObservacionesViewProps {
  students: Student[];
  observations: ObservationRecord[];
  onAddObservation: (obs: Omit<ObservationRecord, "id" | "synced">) => void;
  currentRole: Role;
  online: boolean;
}

export function ObservacionesView({
  students,
  observations,
  onAddObservation,
  currentRole,
  online,
}: ObservacionesViewProps) {
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New observation form state
  const [formStudentId, setFormStudentId] = useState<number>(students[0]?.id || 1);
  const [formDate, setFormDate] = useState("2025-05-22");
  const [formType, setFormType] = useState<"Pedagógica" | "Disciplinaria" | "Felicitación">(
    "Pedagógica",
  );
  const [formTitle, setFormTitle] = useState("");
  const [formDetail, setFormDetail] = useState("");
  const [formTeacher, setFormTeacher] = useState("Lic. Roberto Gómez (Matemáticas)");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const canEdit = currentRole === "Docente" || currentRole === "Administrativo";

  // Filter observations based on role and user filters
  const filteredObservations = observations.filter((obs) => {
    // If Estudiante: only Ana Martínez (studentId 1)
    if (currentRole === "Estudiante" && obs.studentId !== 1) {
      return false;
    }
    // If Acudiente: only Ana Martínez (studentId 1)
    if (currentRole === "Acudiente" && obs.studentId !== 1) {
      return false;
    }
    // UI filters
    if (selectedStudentFilter !== "all" && obs.studentId !== Number(selectedStudentFilter)) {
      return false;
    }
    if (selectedTypeFilter !== "all" && obs.type !== selectedTypeFilter) {
      return false;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formTitle.trim()) {
      setErrorMsg("Debes ingresar un título o motivo de la observación.");
      return;
    }
    if (!formDetail.trim()) {
      setErrorMsg("Debes detallar la descripción de la observación.");
      return;
    }

    const studentObj = students.find((s) => s.id === Number(formStudentId));
    if (!studentObj) return;

    onAddObservation({
      studentId: studentObj.id,
      studentName: studentObj.name,
      date: formDate,
      type: formType,
      title: formTitle.trim(),
      detail: formDetail.trim(),
      teacher: formTeacher,
    });

    setFormTitle("");
    setFormDetail("");
    setIsModalOpen(false);
    setSuccessMsg(`Observación de ${studentObj.name} guardada en IndexedDB con UUID v4.`);
  };

  return (
    <div className="view-container">
      {/* Role notice */}
      {currentRole === "Estudiante" && (
        <div className="role-alert-banner">
          <Icon name="lock" size={24} className="text-blue-700" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Modo Solo Consulta · Mi Observador del Alumno (Ana Martínez González)
            </strong>
            <p className="text-slate-700 text-base">
              Historial oficial de anotaciones pedagógicas, felicitaciones y compromisos formativos personales.
            </p>
          </div>
        </div>
      )}

      {currentRole === "Acudiente" && (
        <div className="role-alert-banner acudiente">
          <Icon name="user" size={24} className="text-amber-800" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Modo Solo Consulta · Observador de mi Acudida (Ana Martínez González)
            </strong>
            <p className="text-slate-700 text-base">
              Seguimiento pedagógico y formativo exclusivo de tu acudida. Acudiente registrado: Carmen González Rocha.
            </p>
          </div>
        </div>
      )}

      {!canEdit && currentRole !== "Estudiante" && currentRole !== "Acudiente" && (
        <div className="role-alert-banner">
          <Icon name="lock" size={24} className="text-slate-700" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Modo Solo Lectura - Rol {currentRole}
            </strong>
            <p className="text-slate-700 text-base">
              Visualización del observador del estudiante. Las anotaciones disciplinarias y
              pedagógicas oficiales son registradas por los docentes.
            </p>
          </div>
        </div>
      )}

      {/* Success notification */}
      {successMsg && (
        <div className="feedback-banner success">
          <Icon name="check" size={22} />
          <p className="text-base font-semibold flex-1">{successMsg}</p>
          <button onClick={() => setSuccessMsg("")} className="text-slate-700 hover:text-slate-900">
            <Icon name="close" size={20} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <span className="breadcrumb">
            EduAtlántico <span>/</span> Convivencia y Pedagogía
          </span>
          <h1 className="page-title">
            {currentRole === "Estudiante"
              ? "Mi Observador del Estudiante"
              : currentRole === "Acudiente"
                ? "Observador del Alumno · Ana Martínez"
                : "Historial de Observaciones"}
          </h1>
          <p className="page-subtitle">
            Seguimiento formativo y disciplinario por estudiante con fecha, docente responsable y
            estado de sincronización.
          </p>
        </div>
        {canEdit && (
          <button className="action-btn primary" onClick={() => setIsModalOpen(true)}>
            <Icon name="plus" size={20} />
            <span>Nueva Observación</span>
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="card-surface mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="filter-label">FILTRAR POR ESTUDIANTE</label>
            <select
              className="form-select font-semibold"
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              disabled={currentRole === "Estudiante" || currentRole === "Acudiente"}
            >
              {currentRole === "Estudiante" || currentRole === "Acudiente" ? (
                <option value="1">Ana Martínez González (EST-09024)</option>
              ) : (
                <>
                  <option value="all">Todos los estudiantes</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="filter-label">TIPO DE OBSERVACIÓN</label>
            <select
              className="form-select font-semibold"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="Pedagógica">Pedagógica (Académica)</option>
              <option value="Disciplinaria">Disciplinaria / Convivencial</option>
              <option value="Felicitación">Felicitación / Reconocimiento</option>
            </select>
          </div>

          <div className="flex items-center justify-between bg-slate-100 p-3.5 rounded-xl border border-slate-300">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase block">
                Total Registros
              </span>
              <strong className="text-xl font-bold text-slate-900">
                {filteredObservations.length} observaciones
              </strong>
            </div>
            <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-300">
              {online ? "Modo Online" : "Modo Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Observations List */}
      <div className="space-y-4">
        {filteredObservations.length === 0 ? (
          <div className="card-surface text-center py-12">
            <span className="inline-grid place-items-center w-16 h-16 rounded-full bg-slate-100 text-slate-700 mx-auto mb-3">
              <Icon name="note" size={32} />
            </span>
            <h3 className="text-xl font-bold text-slate-900">No hay observaciones registradas</h3>
            <p className="text-base text-slate-700 mt-1 max-w-md mx-auto">
              No se encontraron anotaciones con los filtros seleccionados.
            </p>
          </div>
        ) : (
          filteredObservations.map((obs) => {
            const isPedagogica = obs.type === "Pedagógica";
            const isDisciplinaria = obs.type === "Disciplinaria";

            return (
              <div key={obs.id} className="card-surface">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${
                        isPedagogica
                          ? "bg-blue-100 text-blue-900 border border-blue-200"
                          : isDisciplinaria
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                      }`}
                    >
                      {obs.type}
                    </span>
                    <strong className="text-xl font-bold text-slate-900">{obs.title}</strong>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <Icon name="calendar" size={16} /> Fecha: {obs.date}
                    </span>
                    {obs.synced ? (
                      <span className="badge-saved">
                        <Icon name="check" size={14} /> Sincronizado
                      </span>
                    ) : (
                      <span className="badge-pending">
                        <Icon name="database" size={14} /> Local (IndexedDB)
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-slate-700">ESTUDIANTE:</span>
                    <span className="text-base font-bold text-slate-900">{obs.studentName}</span>
                  </div>
                  <p className="text-base text-slate-800 leading-relaxed font-normal bg-slate-50 p-4 rounded-xl border border-slate-200">
                    &quot;{obs.detail}&quot;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <Icon name="user" size={16} />
                    <span>
                      Docente responsable: <strong>{obs.teacher}</strong>
                    </span>
                  </div>
                  <span>UUID: {obs.id}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Observation Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div
            className="help-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-obs-title"
          >
            <header className="help-modal-header">
              <div className="flex items-center gap-3">
                <span className="help-modal-icon">
                  <Icon name="note" size={26} />
                </span>
                <div>
                  <h2 id="new-obs-title" className="text-2xl font-bold text-slate-900">
                    Registrar Nueva Observación
                  </h2>
                  <p className="text-base text-slate-700">
                    Seguimiento pedagógico y convivencial · Ley 1581 de 2012
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-700 hover:text-slate-900"
              >
                <Icon name="close" size={24} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="feedback-banner error">
                  <Icon name="warning" size={20} />
                  <p className="text-sm font-bold">{errorMsg}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="filter-label">ESTUDIANTE</label>
                  <select
                    className="form-select font-bold"
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(Number(e.target.value))}
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="filter-label">FECHA DE REGISTRO</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="filter-label">TIPO DE ANOTACIÓN</label>
                  <select
                    className="form-select font-bold"
                    value={formType}
                    onChange={(e) =>
                      setFormType(e.target.value as "Pedagógica" | "Disciplinaria" | "Felicitación")
                    }
                  >
                    <option value="Pedagógica">Pedagógica / Académica</option>
                    <option value="Disciplinaria">Disciplinaria / Convivencial</option>
                    <option value="Felicitación">Felicitación / Reconocimiento</option>
                  </select>
                </div>

                <div>
                  <label className="filter-label">DOCENTE RESPONSABLE</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formTeacher}
                    onChange={(e) => setFormTeacher(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="filter-label">TÍTULO O ASUNTO</label>
                <input
                  type="text"
                  className="form-input font-bold"
                  placeholder="Ej: Compromiso académico en álgebra"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="filter-label">
                  DESCRIPCIÓN DETALLADA DE LOS HECHOS Y ACUERDOS
                </label>
                <textarea
                  className="form-input h-32 py-2.5 font-normal leading-relaxed"
                  placeholder="Describe la situación ocurrida, las fortalezas observadas o los compromisos formativos acordados con el estudiante y su familia..."
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                ></textarea>
              </div>

              <footer className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="action-btn primary">
                  <Icon name="database" size={18} />
                  <span>Guardar Observación Local</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
