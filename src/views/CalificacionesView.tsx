import { useState, useMemo } from "react";
import { Student, Role } from "../types";
import { Icon } from "../icons";

interface CalificacionesViewProps {
  students: Student[];
  onUpdateGrades: (updatedStudents: Student[]) => void;
  currentRole: Role;
  online: boolean;
}

export function CalificacionesView({
  students,
  onUpdateGrades,
  currentRole,
  online,
}: CalificacionesViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<
    "matematicas" | "lengua" | "ciencias" | "sociales" | "ingles"
  >("matematicas");
  const [selectedTerm, setSelectedTerm] = useState("Periodo 2 (Actual)");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const canEdit = currentRole === "Docente" || currentRole === "Administrativo";
  const isStudentOrGuardian = currentRole === "Estudiante" || currentRole === "Acudiente";

  // Strict privacy: Estudiante and Acudiente ONLY see Ana Martínez González (id: 1)
  const displayedStudents = useMemo(() => {
    if (isStudentOrGuardian) {
      return students.filter((s) => s.id === 1);
    }
    return students;
  }, [students, isStudentOrGuardian]);

  // Local draft of grades by student id (as strings so user can type freely before validation)
  const [gradesDraft, setGradesDraft] = useState<Record<number, string>>(() => {
    const draft: Record<number, string> = {};
    students.forEach((s) => {
      draft[s.id] = String(s.grades[selectedSubject]);
    });
    return draft;
  });

  // Keep track of which student has an error
  const invalidStudents = useMemo(() => {
    const invalids: { id: number; name: string; value: string }[] = [];
    displayedStudents.forEach((s) => {
      const raw = gradesDraft[s.id];
      if (raw === undefined || raw === "") return;
      const num = Number(raw);
      if (isNaN(num) || num < 0.0 || num > 5.0) {
        invalids.push({ id: s.id, name: s.name, value: raw });
      }
    });
    return invalids;
  }, [displayedStudents, gradesDraft]);

  const hasBlockingErrors = invalidStudents.length > 0;

  // Handle grade change
  const handleGradeChange = (studentId: number, value: string) => {
    if (!canEdit) return;
    setSaveSuccess(false);
    setGradesDraft((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  // Change subject
  const handleSubjectChange = (
    newSubject: "matematicas" | "lengua" | "ciencias" | "sociales" | "ingles",
  ) => {
    setSelectedSubject(newSubject);
    setSaveSuccess(false);
    const draft: Record<number, string> = {};
    students.forEach((s) => {
      draft[s.id] = String(s.grades[newSubject]);
    });
    setGradesDraft(draft);
  };

  // Calculate live average for this subject across all students
  const validGradesList = students
    .map((s) => Number(gradesDraft[s.id]))
    .filter((g) => !isNaN(g) && g >= 0 && g <= 5);

  const subjectAverage =
    validGradesList.length > 0
      ? (validGradesList.reduce((acc, curr) => acc + curr, 0) / validGradesList.length).toFixed(2)
      : "0.0";

  // Calculate individual average for a student considering all their subjects + current drafted subject
  const getStudentGeneralAverage = (student: Student) => {
    const currentSubjectGrade = Number(gradesDraft[student.id]);
    const validCurrent =
      !isNaN(currentSubjectGrade) && currentSubjectGrade >= 0 && currentSubjectGrade <= 5
        ? currentSubjectGrade
        : student.grades[selectedSubject];

    const all = [
      selectedSubject === "matematicas" ? validCurrent : student.grades.matematicas,
      selectedSubject === "lengua" ? validCurrent : student.grades.lengua,
      selectedSubject === "ciencias" ? validCurrent : student.grades.ciencias,
      selectedSubject === "sociales" ? validCurrent : student.grades.sociales,
      selectedSubject === "ingles" ? validCurrent : student.grades.ingles,
    ];

    const sum = all.reduce((a, b) => a + b, 0);
    return (sum / all.length).toFixed(2);
  };

  const getPerformanceBadge = (gradeNum: number) => {
    if (gradeNum < 3.0) {
      return <span className="performance-chip low">Bajo (&lt; 3.0)</span>;
    } else if (gradeNum <= 3.9) {
      return <span className="performance-chip basic">Básico (3.0 - 3.9)</span>;
    } else if (gradeNum <= 4.5) {
      return <span className="performance-chip high">Alto (4.0 - 4.5)</span>;
    } else {
      return <span className="performance-chip superior">Superior (4.6 - 5.0)</span>;
    }
  };

  const handleSaveGrades = () => {
    if (!canEdit || hasBlockingErrors) return;

    const updated = students.map((s) => {
      const raw = gradesDraft[s.id];
      const val = raw !== undefined && raw !== "" ? Number(raw) : s.grades[selectedSubject];
      return {
        ...s,
        grades: {
          ...s.grades,
          [selectedSubject]: val,
        },
      };
    });

    onUpdateGrades(updated);
    setSaveSuccess(true);
  };

  const subjectLabels: Record<
    "matematicas" | "lengua" | "ciencias" | "sociales" | "ingles",
    string
  > = {
    matematicas: "Matemáticas (Álgebra y Geometría)",
    lengua: "Lengua Castellana y Literatura",
    ciencias: "Ciencias Naturales y Educación Ambiental",
    sociales: "Ciencias Sociales e Historia",
    ingles: "Inglés y Bilingüismo",
  };

  return (
    <div className="view-container">
      {/* Read only alert */}
      {currentRole === "Estudiante" && (
        <div className="role-alert-banner">
          <Icon name="lock" size={24} className="text-blue-700" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Modo Solo Consulta · Mis Calificaciones Académicas (Ana Martínez González)
            </strong>
            <p className="text-slate-700 text-base">
              Visualización exclusiva de tus calificaciones escolares en Grado 9° A.
            </p>
          </div>
        </div>
      )}

      {currentRole === "Acudiente" && (
        <div className="role-alert-banner acudiente">
          <Icon name="user" size={24} className="text-amber-800" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Modo Solo Consulta · Calificaciones de mi Acudida (Ana Martínez González)
            </strong>
            <p className="text-slate-700 text-base">
              Visualización exclusiva de las notas de tu acudida. Acudiente registrado: Carmen González Rocha.
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
              Visualización oficial de planilla. La modificación de notas está reservada para
              Docentes y Directivos.
            </p>
          </div>
        </div>
      )}

      {/* BIG RED ALERT IF VALUE < 0.0 OR > 5.0 (Strict requirement) */}
      {hasBlockingErrors && (
        <div className="critical-error-banner" role="alert">
          <div className="flex items-start gap-4">
            <span className="critical-error-icon">
              <Icon name="warning" size={32} />
            </span>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-red-900 leading-tight">
                ¡ERROR CRÍTICO DE INTEGRIDAD ACADÉMICA - GUARDADO BLOQUEADO!
              </h3>
              <p className="text-base font-bold text-red-800 mt-1">
                La escala oficial nacional del MEN (Decreto 1290) permite únicamente calificaciones
                entre 0.0 y 5.0. Se han detectado valores fuera de rango que impiden guardar la
                planilla:
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1 text-base font-semibold text-red-900">
                {invalidStudents.map((item) => (
                  <li key={item.id}>
                    <strong>{item.name}:</strong> Ingresaste el valor &quot;
                    <span className="underline decoration-2">{item.value}</span>
                    &quot;. Debe corregirse a una nota entre 0.0 y 5.0.
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success banner */}
      {saveSuccess && (
        <div className="feedback-banner success" role="status">
          <Icon name="check" size={22} />
          <p className="text-base font-semibold flex-1">
            ¡Planilla de {subjectLabels[selectedSubject]} guardada con éxito en{" "}
            {online ? "el Servidor Institucional" : "IndexedDB Local"} con UUID v4 y 100% de
            integridad!
          </p>
          <button
            onClick={() => setSaveSuccess(false)}
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
            EduAtlántico <span>/</span> Evaluación Formativa
          </span>
          <h1 className="page-title">Planilla de Calificaciones</h1>
          <p className="page-subtitle">
            Registro por asignatura y periodo con validación estricta en vivo y cálculo automático
            de promedios.
          </p>
        </div>
        {canEdit && (
          <button
            className={`action-btn primary ${
              hasBlockingErrors ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSaveGrades}
            disabled={hasBlockingErrors}
          >
            <Icon name="database" size={20} />
            <span>
              {hasBlockingErrors
                ? "Guardado Bloqueado (Corregir Errores)"
                : online
                  ? "Guardar en Servidor"
                  : "Guardar en IndexedDB"}
            </span>
          </button>
        )}
      </div>

      {/* Selectors and Stats Bar */}
      <div className="card-surface mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-2">
            <label className="filter-label">ASIGNATURA</label>
            <select
              className="form-select font-bold"
              value={selectedSubject}
              onChange={(e) =>
                handleSubjectChange(
                  e.target.value as "matematicas" | "lengua" | "ciencias" | "sociales" | "ingles",
                )
              }
            >
              <option value="matematicas">Matemáticas (Álgebra y Geometría)</option>
              <option value="lengua">Lengua Castellana y Literatura</option>
              <option value="ciencias">Ciencias Naturales y Biología</option>
              <option value="sociales">Ciencias Sociales e Historia</option>
              <option value="ingles">Inglés y Bilingüismo</option>
            </select>
          </div>

          <div>
            <label className="filter-label">PERIODO ACADÉMICO</label>
            <select
              className="form-select"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
            >
              <option value="Periodo 1">Periodo 1 (Cerrado)</option>
              <option value="Periodo 2 (Actual)">Periodo 2 (En curso)</option>
              <option value="Periodo 3">Periodo 3 (Próximo)</option>
              <option value="Periodo 4">Periodo 4 (Final)</option>
            </select>
          </div>

          <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase block">
                Promedio del Curso
              </span>
              <strong className="text-2xl font-black text-blue-950">
                {subjectAverage}{" "}
                <small className="text-sm font-semibold text-blue-800">/ 5.0</small>
              </strong>
            </div>
            {getPerformanceBadge(Number(subjectAverage))}
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="card-surface p-0 overflow-hidden">
        <div className="table-header-bar px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{subjectLabels[selectedSubject]}</h2>
            <p className="text-base text-slate-700">
              Grado 9° A · {selectedTerm} · Escala: 0.0 (Mínimo) a 5.0 (Máximo)
            </p>
          </div>
          <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300">
            {displayedStudents.length} {displayedStudents.length === 1 ? "estudiante evaluado" : "estudiantes evaluados"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="custom-table w-full">
            <thead>
              <tr>
                <th className="text-left w-20">N°</th>
                <th className="text-left">ESTUDIANTE</th>
                <th className="text-center w-48">CALIFICACIÓN (0.0 — 5.0)</th>
                <th className="text-center w-48">DESEMPEÑO (DEC. 1290)</th>
                <th className="text-center w-36">PROMEDIO GENERAL</th>
                <th className="text-center w-28">FALLAS</th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.map((student, idx) => {
                const currentVal = gradesDraft[student.id];
                const numVal = Number(currentVal);
                const isInvalid =
                  currentVal !== "" &&
                  currentVal !== undefined &&
                  (isNaN(numVal) || numVal < 0 || numVal > 5);

                const studentGenAvg = getStudentGeneralAverage(student);

                return (
                  <tr
                    key={student.id}
                    className={`table-row-hover ${isInvalid ? "bg-red-50" : ""}`}
                  >
                    <td className="font-semibold text-slate-700 text-base">
                      {String(idx + 1).padStart(2, "0")}
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
                            {student.code} · {student.group}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className={`grade-input-box ${isInvalid ? "has-error" : ""}`}>
                          <input
                            disabled={!canEdit}
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            className="grade-input"
                            value={currentVal ?? ""}
                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                            placeholder="0.0"
                          />
                          <span className="grade-input-scale">/ 5.0</span>
                        </div>

                        {isInvalid && (
                          <span className="text-red-700" title="Nota fuera de rango [0.0 - 5.0]">
                            <Icon name="warning" size={20} />
                          </span>
                        )}
                      </div>
                      {isInvalid && (
                        <span className="block text-xs font-bold text-red-700 mt-1">
                          ¡Fuera de rango!
                        </span>
                      )}
                    </td>

                    <td className="text-center">
                      {!isInvalid && !isNaN(numVal) && currentVal !== "" ? (
                        getPerformanceBadge(numVal)
                      ) : (
                        <span className="text-slate-700 text-sm font-semibold">Sin registrar</span>
                      )}
                    </td>

                    <td className="text-center">
                      <strong className="text-base font-black text-slate-900">
                        {studentGenAvg}
                      </strong>
                    </td>

                    <td className="text-center">
                      <span
                        className={`font-bold text-base ${
                          student.absences >= 3 ? "text-red-700" : "text-slate-800"
                        }`}
                      >
                        {student.absences}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-footer-bar px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-700 text-base font-medium">
          <div className="flex items-center gap-2">
            <Icon name="shield" size={18} className="text-emerald-700" />
            <span>
              Validación en vivo activa · Bloqueo estricto de notas menores a 0.0 o superiores a 5.0
            </span>
          </div>
          {canEdit && (
            <button
              className={`action-btn primary text-base px-6 py-2.5 shadow-sm ${
                hasBlockingErrors ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleSaveGrades}
              disabled={hasBlockingErrors}
            >
              <Icon name="database" size={20} />
              <span>
                {hasBlockingErrors
                  ? "Guardado Bloqueado (Corregir Errores)"
                  : online
                    ? "Guardar Planilla en Servidor"
                    : "Guardar Planilla en IndexedDB"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
