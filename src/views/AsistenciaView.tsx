import { useState } from "react";
import { Student, AttendanceRecord, AttendanceStatus, Role } from "../types";
import { Icon } from "../icons";

interface AsistenciaViewProps {
  students: Student[];
  attendanceList: AttendanceRecord[];
  onSaveAttendance: (
    records: {
      studentId: number;
      studentName: string;
      group: string;
      date: string;
      status: Exclude<AttendanceStatus, "">;
    }[],
  ) => void;
  currentRole: Role;
  online: boolean;
}

export function AsistenciaView({
  students,
  attendanceList,
  onSaveAttendance,
  currentRole,
  online,
}: AsistenciaViewProps) {
  const [selectedDate, setSelectedDate] = useState("2025-05-22");
  const [selectedCourse, setSelectedCourse] = useState("Grado 9° A");
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const canEdit = currentRole === "Docente" || currentRole === "Administrativo";
  const isStudentOrGuardian = currentRole === "Estudiante" || currentRole === "Acudiente";

  // Strict privacy: Estudiante and Acudiente ONLY see Ana Martínez González (id: 1)
  const displayedStudents = isStudentOrGuardian
    ? students.filter((s) => s.id === 1)
    : students.filter((s) => s.group === selectedCourse).length > 0
      ? students.filter((s) => s.group === selectedCourse)
      : students;

  // Local draft state for attendance statuses of students for the selected date
  const [draftStatuses, setDraftStatuses] = useState<Record<number, AttendanceStatus>>(() => {
    const initial: Record<number, AttendanceStatus> = {};
    students.forEach((s) => {
      const existing = attendanceList.find((a) => a.studentId === s.id && a.date === "2025-05-22");
      initial[s.id] = existing ? existing.status : "";
    });
    return initial;
  });

  // Check which students already have an attendance record committed for this date
  const existingForDate = attendanceList.filter((a) => a.date === selectedDate);
  const alreadySavedStudentIds = new Set(existingForDate.map((a) => a.studentId));

  // Compute live counts based on displayed students
  const currentStatuses = displayedStudents.map((s) => {
    return draftStatuses[s.id] || "";
  });
  const presentCount = currentStatuses.filter((st) => st === "Presente").length;
  const absentCount = currentStatuses.filter((st) => st === "Ausente").length;
  const excuseCount = currentStatuses.filter((st) => st === "Excusa").length;
  const totalCount = displayedStudents.length;
  const completionPercent =
    totalCount > 0
      ? Math.round(((presentCount + absentCount + excuseCount) / totalCount) * 100)
      : 0;

  const handleSelectStatus = (studentId: number, status: Exclude<AttendanceStatus, "">) => {
    if (!canEdit) return;
    setDraftStatuses((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setFeedbackMessage(null);
  };

  const handleSaveAll = () => {
    if (!canEdit) return;
    const unselected = displayedStudents.filter((s) => !draftStatuses[s.id]);
    if (unselected.length > 0) {
      setFeedbackMessage({
        type: "error",
        text: `Faltan ${unselected.length} estudiantes por marcar asistencia. Selecciona un estado para todos antes de guardar la jornada.`,
      });
      return;
    }

    const payload = displayedStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      group: s.group,
      date: selectedDate,
      status: draftStatuses[s.id] as Exclude<AttendanceStatus, "">,
    }));

    onSaveAttendance(payload);
    setFeedbackMessage({
      type: "success",
      text: `¡Asistencia completa de la jornada (${selectedDate}) guardada con éxito en ${
        online ? "el Servidor Central" : "IndexedDB Local"
      } en una sola operación atómica con UUID v4!`,
    });
  };

  const handleMarkAllPresent = () => {
    if (!canEdit) return;
    const updated: Record<number, AttendanceStatus> = {};
    displayedStudents.forEach((s) => {
      updated[s.id] = "Presente";
    });
    setDraftStatuses(updated);
    setFeedbackMessage({
      type: "info",
      text: "Todos los estudiantes marcados como 'Presente'. Haz clic en 'Guardar Toda la Asistencia' para registrar la jornada.",
    });
  };

  return (
    <div className="view-container">
      {/* Banner for Read Only roles */}
      {currentRole === "Estudiante" && (
        <div className="role-alert-banner">
          <Icon name="lock" size={24} className="text-blue-700" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Modo Solo Consulta · Mi Asistencia Personal (Ana Martínez González)
            </strong>
            <p className="text-slate-700 text-base">
              Visualización protegida y exclusiva de tu asistencia escolar en Grado 9° A.
            </p>
          </div>
        </div>
      )}

      {currentRole === "Acudiente" && (
        <div className="role-alert-banner acudiente">
          <Icon name="user" size={24} className="text-amber-800" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Modo Solo Consulta · Asistencia de mi Acudida (Ana Martínez González)
            </strong>
            <p className="text-slate-700 text-base">
              Visualización exclusiva de la asistencia escolar de tu acudida. Acudiente registrado: Carmen González Rocha.
            </p>
          </div>
        </div>
      )}

      {!canEdit && !isStudentOrGuardian && (
        <div className="role-alert-banner">
          <Icon name="lock" size={24} className="text-slate-700" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Modo Solo Lectura - Rol {currentRole}
            </strong>
            <p className="text-slate-700 text-base">
              Tienes permisos de visualización. No puedes alterar los registros de asistencia
              escolar.
            </p>
          </div>
        </div>
      )}

      {/* Feedback banner */}
      {feedbackMessage && (
        <div className={`feedback-banner ${feedbackMessage.type}`} role="alert">
          <Icon
            name={
              feedbackMessage.type === "success"
                ? "check"
                : feedbackMessage.type === "error"
                  ? "warning"
                  : "alertCircle"
            }
            size={22}
          />
          <p className="text-base font-semibold flex-1">{feedbackMessage.text}</p>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-700 hover:text-slate-900"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <span className="breadcrumb">
            EduAtlántico <span>/</span> Registro Diario
          </span>
          <h1 className="page-title">Control de Asistencia Escolar</h1>
          <p className="page-subtitle">
            Marca el estado de cada estudiante y guarda toda la jornada en un solo clic.
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-3">
            <button
              className="action-btn secondary"
              onClick={handleMarkAllPresent}
              title="Marcar todos como presentes"
            >
              <Icon name="check" size={18} />
              <span>Marcar Todos Presentes</span>
            </button>
            <button
              className="action-btn primary text-base px-6 py-2.5 shadow-sm"
              onClick={handleSaveAll}
            >
              <Icon name="database" size={20} />
              <span>Guardar Toda la Asistencia</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Selection Card */}
      <div className="card-surface mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="filter-label">GRADO / CURSO</label>
            <select
              className="form-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="Grado 9° A">Grado 9° A (Sabanalarga)</option>
              <option value="Grado 9° B">Grado 9° B (Sabanalarga)</option>
              <option value="Grado 10° A">Grado 10° A (Luruaco)</option>
            </select>
          </div>

          <div>
            <label className="filter-label">FECHA DE REGISTRO</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setFeedbackMessage(null);
              }}
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-300">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase block">Completado</span>
                <strong className="text-xl font-bold text-slate-900">{completionPercent}%</strong>
              </div>
              <div className="h-8 w-px bg-slate-300"></div>
              <div className="flex items-center gap-3">
                <span className="status-badge present">{presentCount} Presentes</span>
                <span className="status-badge absent">{absentCount} Ausentes</span>
                <span className="status-badge excuse">{excuseCount} Excusas</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-300">
              {alreadySavedStudentIds.size > 0
                ? `${alreadySavedStudentIds.size} registrados`
                : "Sin guardar hoy"}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card-surface overflow-hidden p-0">
        <div className="table-header-bar px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isStudentOrGuardian
                ? `Registro de Asistencia (${displayedStudents.length} estudiante)`
                : `Listado de Estudiantes (${displayedStudents.length})`}
            </h2>
            <p className="text-base text-slate-700">
              {selectedCourse} · Sesión oficial de asistencia
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300">
            <Icon name="shield" size={16} className="text-emerald-700" />
            Bloqueo de duplicados activo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="custom-table w-full">
            <thead>
              <tr>
                <th className="text-left w-20">N° / CÓD</th>
                <th className="text-left">ESTUDIANTE</th>
                <th className="text-center w-80">ESTADO DE ASISTENCIA</th>
                <th className="text-center w-40">ESTADO LOCAL</th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.map((student, idx) => {
                const currentStatus = draftStatuses[student.id];
                const isAlreadySaved = alreadySavedStudentIds.has(student.id);

                return (
                  <tr key={student.id} className="table-row-hover">
                    <td className="font-semibold text-slate-700 text-base">
                      {String(idx + 1).padStart(2, "0")}{" "}
                      <small className="block text-xs font-bold text-slate-700">
                        {student.code}
                      </small>
                    </td>

                    <td>
                      <div className="flex items-center gap-3">
                        <span className="table-avatar" style={{ background: student.color }}>
                          {student.initials}
                        </span>
                        <div>
                          <strong className="text-slate-900 text-base font-bold block">
                            {student.name}
                          </strong>
                          <span className="text-sm font-medium text-slate-700">
                            {student.document} · Acudiente: {student.guardian.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          disabled={!canEdit}
                          onClick={() => handleSelectStatus(student.id, "Presente")}
                          className={`attendance-option-btn present ${
                            currentStatus === "Presente" ? "active" : ""
                          }`}
                        >
                          <Icon name="check" size={16} />
                          <span>Presente</span>
                        </button>

                        <button
                          disabled={!canEdit}
                          onClick={() => handleSelectStatus(student.id, "Ausente")}
                          className={`attendance-option-btn absent ${
                            currentStatus === "Ausente" ? "active" : ""
                          }`}
                        >
                          <Icon name="close" size={16} />
                          <span>Ausente</span>
                        </button>

                        <button
                          disabled={!canEdit}
                          onClick={() => handleSelectStatus(student.id, "Excusa")}
                          className={`attendance-option-btn excuse ${
                            currentStatus === "Excusa" ? "active" : ""
                          }`}
                        >
                          <Icon name="clock" size={16} />
                          <span>Excusa</span>
                        </button>
                      </div>
                    </td>

                    <td className="text-center">
                      {isAlreadySaved ? (
                        <span className="badge-saved">
                          <Icon name="check" size={14} /> Registrado
                        </span>
                      ) : (
                        <span className="badge-pending">Sin registrar</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer with single save button */}
        <div className="table-footer-bar px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-700 text-base font-medium">
          <div className="flex items-center gap-2">
            <Icon name="shield" size={18} className="text-emerald-700" />
            <span>
              Ley 1581 de 2012 · Consentimiento informado verificado para todos los estudiantes
            </span>
          </div>
          {canEdit && (
            <button
              className="action-btn primary text-base px-6 py-2.5 shadow-sm"
              onClick={handleSaveAll}
            >
              <Icon name="database" size={20} />
              <span>Guardar Toda la Asistencia ({displayedStudents.length} estudiantes)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
