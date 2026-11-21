import { useState } from "react";
import { CourseGroup, Student, Teacher, Role } from "../types";
import { Icon } from "../icons";

interface CursosGruposViewProps {
  courseGroups: CourseGroup[];
  students: Student[];
  teachers: Teacher[];
  currentRole: Role;
  onAddGroup: (group: Omit<CourseGroup, "id">) => void;
  onEnrollStudent: (studentId: number, targetGroupName: string) => void;
}

export function CursosGruposView({
  courseGroups,
  students,
  teachers,
  currentRole,
  onAddGroup,
  onEnrollStudent,
}: CursosGruposViewProps) {
  const [selectedGroupModal, setSelectedGroupModal] = useState<CourseGroup | null>(null);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // New group form
  const [newGradeLevel, setNewGradeLevel] = useState("10°");
  const [newSection, setNewSection] = useState("B");
  const [newDirector, setNewDirector] = useState(teachers[0]?.name || "");
  const [newClassroom, setNewClassroom] = useState("Aula 202 · Sede Luruaco");
  const [newShift, setNewShift] = useState<"Mañana" | "Tarde">("Mañana");
  const [newCapacity, setNewCapacity] = useState(35);

  // Enroll form
  const [enrollStudentId, setEnrollStudentId] = useState<number>(students[0]?.id || 1);
  const [enrollTargetGroup, setEnrollTargetGroup] = useState<string>(courseGroups[0]?.name || "");

  const canManage = currentRole === "Administrativo";

  // If role is student, only show their own course group
  const displayedGroups =
    currentRole === "Estudiante"
      ? courseGroups.filter((g) => g.name === "Grado 9° A") // Ana's group
      : currentRole === "Acudiente"
        ? courseGroups.filter((g) => g.name === "Grado 9° A")
        : courseGroups;

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const groupName = `Grado ${newGradeLevel} ${newSection}`;
    onAddGroup({
      name: groupName,
      gradeLevel: newGradeLevel,
      section: newSection,
      directorTeacher: newDirector,
      classroom: newClassroom,
      shift: newShift,
      capacity: Number(newCapacity),
      academicYear: 2025,
    });
    setIsAddGroupOpen(false);
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnrollStudent(Number(enrollStudentId), enrollTargetGroup);
    setIsEnrollModalOpen(false);
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <span className="breadcrumb">
            EduAtlántico <span>/</span> Gestión Institucional
          </span>
          <h1 className="page-title">Cursos y Grupos Escolares</h1>
          <p className="page-subtitle">
            Administración de grupos académicos (9° A, 10° A, 10° C), aulas y matrícula de
            estudiantes.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <button className="action-btn secondary" onClick={() => setIsEnrollModalOpen(true)}>
              <Icon name="team" size={18} />
              <span>Matricular Estudiante</span>
            </button>
            <button className="action-btn primary" onClick={() => setIsAddGroupOpen(true)}>
              <Icon name="plus" size={18} />
              <span>Crear Nuevo Grupo</span>
            </button>
          </div>
        )}
      </div>

      {currentRole === "Docente" && (
        <div className="role-alert-banner mb-6">
          <Icon name="lock" size={22} className="text-slate-700 shrink-0" />
          <div>
            <strong className="text-slate-900 font-bold">Vista de Consulta — Rol Docente</strong>
            <p className="text-slate-700 text-sm">Solo el Administrador puede crear grupos, matricular o desasignar estudiantes. Tienes acceso de solo lectura.</p>
          </div>
        </div>
      )}

      {/* Grid of Course Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedGroups.map((group) => {
          const enrolledStudents = students.filter((s) => s.group === group.name);
          const occupancyRate = Math.round((enrolledStudents.length / group.capacity) * 100);

          return (
            <div key={group.id} className="card-surface flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-lg bg-blue-100 text-blue-900 font-extrabold flex items-center justify-center text-base">
                      {group.gradeLevel}
                    </span>
                    <div>
                      <strong className="text-xl font-bold text-slate-900 block leading-tight">
                        {group.name}
                      </strong>
                      <span className="text-xs font-semibold text-slate-700">
                        Jornada: {group.shift} · Año 2025
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    Sección {group.section}
                  </span>
                </div>

                <div className="space-y-2.5 text-sm text-slate-800">
                  <div className="flex items-center gap-2">
                    <Icon name="user" size={16} className="text-blue-700" />
                    <span>
                      Director: <strong>{group.directorTeacher}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="home" size={16} className="text-slate-600" />
                    <span>{group.classroom}</span>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Estudiantes Matriculados</span>
                    <span className="text-slate-900">
                      {enrolledStudents.length} / {group.capacity} cupos ({occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between">
                <button
                  className="text-sm font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5"
                  onClick={() => setSelectedGroupModal(group)}
                >
                  <Icon name="team" size={16} />
                  <span>Ver lista de estudiantes ({enrolledStudents.length})</span>
                </button>

                {canManage && (
                  <button
                    className="action-btn secondary text-xs py-1.5 px-3"
                    onClick={() => {
                      setEnrollTargetGroup(group.name);
                      setIsEnrollModalOpen(true);
                    }}
                  >
                    + Matricular
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Ver Estudiantes del Grupo */}
      {selectedGroupModal && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setSelectedGroupModal(null)}
        >
          <div className="help-modal-card" role="dialog" aria-modal="true">
            <header className="help-modal-header">
              <div className="flex items-center gap-3">
                <span className="help-modal-icon">
                  <Icon name="folder" size={24} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Estudiantes Matriculados en {selectedGroupModal.name}
                  </h2>
                  <p className="text-sm text-slate-700">
                    Director: {selectedGroupModal.directorTeacher} · {selectedGroupModal.classroom}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGroupModal(null)}
                className="p-1.5 text-slate-700 hover:text-slate-900"
              >
                <Icon name="close" size={22} />
              </button>
            </header>

            <div className="p-6">
              {students.filter((s) => s.group === selectedGroupModal.name).length === 0 ? (
                <div className="text-center py-8 text-slate-700">
                  <p className="font-semibold text-base">
                    No hay estudiantes matriculados en este grupo todavía.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="custom-table w-full">
                    <thead>
                      <tr>
                        <th className="text-left w-20">CÓDIGO</th>
                        <th className="text-left">ESTUDIANTE</th>
                        <th className="text-left">ACUDIENTE</th>
                        <th className="text-center w-28">ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter((s) => s.group === selectedGroupModal.name)
                        .map((st) => (
                          <tr key={st.id} className="table-row-hover">
                            <td className="font-mono text-xs font-bold text-slate-800">
                              {st.code}
                            </td>
                            <td>
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center text-slate-800"
                                  style={{ background: st.color }}
                                >
                                  {st.initials}
                                </span>
                                <div>
                                  <strong className="text-base font-bold text-slate-900 block">
                                    {st.name}
                                  </strong>
                                  <small className="text-slate-700">{st.document}</small>
                                </div>
                              </div>
                            </td>
                            <td className="text-sm text-slate-800 font-medium">
                              {st.guardian.name} ({st.guardian.relationship})
                            </td>
                            <td className="text-center">
                              <span className="status-badge present">Matriculado</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <footer className="help-modal-footer">
              <button className="action-btn secondary" onClick={() => setSelectedGroupModal(null)}>
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Modal: Crear Nuevo Grupo */}
      {isAddGroupOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setIsAddGroupOpen(false)}
        >
          <div className="help-modal-card" role="dialog" aria-modal="true">
            <header className="help-modal-header">
              <div className="flex items-center gap-3">
                <span className="help-modal-icon">
                  <Icon name="plus" size={24} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Crear Nuevo Grupo / Curso</h2>
                  <p className="text-sm text-slate-700">Apertura de sección académica para 2025</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddGroupOpen(false)}
                className="p-1.5 text-slate-700 hover:text-slate-900"
              >
                <Icon name="close" size={22} />
              </button>
            </header>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="filter-label">GRADO / NIVEL</label>
                  <select
                    className="form-select font-bold"
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                  >
                    <option value="9°">Grado 9°</option>
                    <option value="10°">Grado 10°</option>
                    <option value="11°">Grado 11°</option>
                  </select>
                </div>

                <div>
                  <label className="filter-label">SECCIÓN / LETRA</label>
                  <input
                    type="text"
                    className="form-input font-bold"
                    placeholder="Ej: A, B, C, D"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value.toUpperCase())}
                    maxLength={2}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="filter-label">DIRECTOR DE GRUPO</label>
                <select
                  className="form-select font-bold"
                  value={newDirector}
                  onChange={(e) => setNewDirector(e.target.value)}
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="filter-label">AULA ASIGNADA Y SEDE</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newClassroom}
                    onChange={(e) => setNewClassroom(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="filter-label">JORNADA</label>
                  <select
                    className="form-select"
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value as "Mañana" | "Tarde")}
                  >
                    <option value="Mañana">Jornada Mañana</option>
                    <option value="Tarde">Jornada Tarde</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="filter-label">CAPACIDAD MÁXIMA DE ESTUDIANTES</label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  className="form-input"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  required
                />
              </div>

              <footer className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setIsAddGroupOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="action-btn primary">
                  <Icon name="check" size={18} />
                  <span>Guardar Nuevo Grupo</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Matricular Estudiante en Grupo */}
      {isEnrollModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setIsEnrollModalOpen(false)}
        >
          <div className="help-modal-card" role="dialog" aria-modal="true">
            <header className="help-modal-header">
              <div className="flex items-center gap-3">
                <span className="help-modal-icon">
                  <Icon name="team" size={24} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Matricular Estudiante en un Curso
                  </h2>
                  <p className="text-sm text-slate-700">
                    Asignación de grupo escolar para el año lectivo 2025
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1.5 text-slate-700 hover:text-slate-900"
              >
                <Icon name="close" size={22} />
              </button>
            </header>

            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4">
              <div>
                <label className="filter-label">SELECCIONA EL ESTUDIANTE</label>
                <select
                  className="form-select font-bold"
                  value={enrollStudentId}
                  onChange={(e) => setEnrollStudentId(Number(e.target.value))}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} · Actual: {s.group})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="filter-label">CURSO / GRUPO DESTINO</label>
                <select
                  className="form-select font-bold text-blue-900"
                  value={enrollTargetGroup}
                  onChange={(e) => setEnrollTargetGroup(e.target.value)}
                >
                  {courseGroups.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name} · {g.classroom} ({g.directorTeacher})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-950 font-medium">
                Al confirmar la matrícula, la información académica, asistencias y boletín del
                estudiante se asociarán inmediatamente al nuevo grupo.
              </div>

              <footer className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setIsEnrollModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="action-btn primary">
                  <Icon name="check" size={18} />
                  <span>Confirmar Matrícula</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
