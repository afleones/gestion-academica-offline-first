import { useState, useMemo } from "react";
import { Student, CourseGroup, Role } from "../types";
import { Icon } from "../icons";

interface EstudiantesViewProps {
  students: Student[];
  courseGroups: CourseGroup[];
  currentRole: Role;
  currentStudentId?: number;
  onSelectStudentForBulletin?: (student: Student) => void;
  onCreateStudent: (newStudent: Omit<Student, "id">) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (studentId: number) => void;
}

export function EstudiantesView({
  students,
  courseGroups,
  currentRole,
  currentStudentId = 1, // Default Ana Martínez
  onSelectStudentForBulletin,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
}: EstudiantesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Form states for Create/Edit
  const [formName, setFormName] = useState("");
  const [formDoc, setFormDoc] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formGroup, setFormGroup] = useState(courseGroups[0]?.name || "Grado 9° A");
  const [formGuardianName, setFormGuardianName] = useState("");
  const [formGuardianRel, setFormGuardianRel] = useState<
    "Madre" | "Padre" | "Tutor Legal" | "Abuela/o"
  >("Madre");
  const [formGuardianPhone, setFormGuardianPhone] = useState("");
  const [formGuardianEmail, setFormGuardianEmail] = useState("");
  const [formConsent, setFormConsent] = useState(true);
  const [formStatus, setFormStatus] = useState<"Activo" | "Inactivo">("Activo");

  const isStudent = currentRole === "Estudiante";
  const isAcudiente = currentRole === "Acudiente";
  const isStudentOrGuardian = isStudent || isAcudiente;
  const canManage = currentRole === "Administrativo";

  // Strict privacy: if currentRole is Estudiante or Acudiente, ONLY show their own record (Ana Martínez)
  const myStudentRecord = students.find((s) => s.id === currentStudentId) || students[0];

  // Filter students based on search and group filter for Admin/Docente
  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return students.filter((s) => {
      if (selectedGroupFilter !== "all" && s.group !== selectedGroupFilter) return false;
      if (!term) return true;
      return (
        s.name.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term) ||
        s.document.toLowerCase().includes(term) ||
        s.guardian.name.toLowerCase().includes(term)
      );
    });
  }, [students, searchTerm, selectedGroupFilter]);

  const openCreateModal = () => {
    const nextCode = `EST-100${String(students.length + 1).padStart(2, "0")}`;
    setFormName("");
    setFormDoc("");
    setFormCode(nextCode);
    setFormGroup(courseGroups[0]?.name || "Grado 9° A");
    setFormGuardianName("");
    setFormGuardianRel("Madre");
    setFormGuardianPhone("");
    setFormGuardianEmail("");
    setFormConsent(true);
    setFormStatus("Activo");
    setIsCreateModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormDoc(student.document);
    setFormCode(student.code);
    setFormGroup(student.group);
    setFormGuardianName(student.guardian.name);
    setFormGuardianRel(student.guardian.relationship);
    setFormGuardianPhone(student.guardian.phone);
    setFormGuardianEmail(student.guardian.email);
    setFormConsent(student.habeasDataConsent);
    setFormStatus(student.status);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDoc.trim()) return;

    const initials = formName
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    const colors = ["#DBEAFE", "#DCFCE7", "#FEF3C7", "#EDE9FE", "#CFFAFE", "#FCE7F3"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onCreateStudent({
      code: formCode || `EST-${Math.floor(10000 + Math.random() * 90000)}`,
      document: formDoc,
      name: formName.trim(),
      initials,
      group: formGroup,
      color: randomColor,
      guardian: {
        name: formGuardianName.trim() || "Acudiente Principal",
        phone: formGuardianPhone.trim() || "300 000 0000",
        relationship: formGuardianRel,
        email: formGuardianEmail.trim() || "contacto@correo.com",
      },
      habeasDataConsent: formConsent,
      status: formStatus,
      grades: {
        matematicas: 4.0,
        lengua: 4.0,
        ciencias: 4.0,
        sociales: 4.0,
        ingles: 4.0,
      },
      absences: 0,
    });

    setIsCreateModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !formName.trim()) return;

    const initials = formName
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    onUpdateStudent({
      ...editingStudent,
      name: formName.trim(),
      document: formDoc,
      code: formCode,
      group: formGroup,
      initials,
      guardian: {
        ...editingStudent.guardian,
        name: formGuardianName.trim(),
        phone: formGuardianPhone.trim(),
        relationship: formGuardianRel,
        email: formGuardianEmail.trim(),
      },
      habeasDataConsent: formConsent,
      status: formStatus,
    });

    setEditingStudent(null);
  };

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    onDeleteStudent(studentToDelete.id);
    setStudentToDelete(null);
  };

  return (
    <div className="view-container">
      {/* Privacy Notice for Student */}
      {isStudent && (
        <div className="role-alert-banner">
          <Icon name="shield" size={24} className="text-emerald-700" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Privacidad Activa (Ley 1581 de 2012) · Ficha Privada del Estudiante
            </strong>
            <p className="text-slate-700 text-base">
              Estás en tu vista personal protegida. Por reserva legal de datos de menores, solo
              puedes consultar tu propia ficha académica y matrícula, no la de otros estudiantes.
            </p>
          </div>
        </div>
      )}

      {isAcudiente && (
        <div className="role-alert-banner acudiente">
          <Icon name="user" size={24} className="text-amber-800" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Privacidad Activa (Ley 1581 de 2012) · Ficha de su Acudida (Ana Martínez González)
            </strong>
            <p className="text-slate-700 text-base">
              Como acudiente legal (Carmen González Rocha), tienes acceso exclusivo a la información
              institucional y matrícula de tu acudida. Los datos de otros estudiantes permanecen protegidos.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <span className="breadcrumb">
            EduAtlántico <span>/</span> Registro y Control
          </span>
          <h1 className="page-title">
            {isStudent
              ? "Mi Ficha de Matrícula"
              : isAcudiente
                ? "Ficha Institucional de mi Acudida"
                : "Directorio Institucional de Estudiantes"}
          </h1>
          <p className="page-subtitle">
            {isStudent || isAcudiente
              ? "Información personal, acudiente y matrícula escolar en el Atlántico."
              : "Gestión integral de matrículas (CRUD), grupos (9° A, 10° A, 10° C) y Habeas Data."}
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <button className="action-btn primary" onClick={openCreateModal}>
              <Icon name="plus" size={18} />
              <span>Nuevo Estudiante</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW FOR STUDENT OR GUARDIAN: SHOWS ONLY HER DATA */}
      {isStudentOrGuardian ? (
        <div className="card-surface p-6">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-5 mb-6">
            <span
              className="table-avatar w-16 h-16 text-2xl font-black"
              style={{ background: myStudentRecord.color }}
            >
              {myStudentRecord.initials}
            </span>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{myStudentRecord.name}</h2>
              <p className="text-base font-semibold text-slate-700">
                Código SIMAT: <strong>{myStudentRecord.code}</strong> · {myStudentRecord.document}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase block">GRUPO ACTUAL</span>
              <strong className="text-xl font-bold text-slate-900 mt-1 block">
                {myStudentRecord.group}
              </strong>
              <small className="text-slate-700 text-xs">Jornada Mañana · Sabanalarga</small>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase block">
                ESTADO DE MATRÍCULA
              </span>
              <strong className="text-xl font-bold text-emerald-800 mt-1 block">
                {myStudentRecord.status}
              </strong>
              <small className="text-slate-700 text-xs">Año lectivo 2025 activo</small>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-900 uppercase block">
                CONSENTIMIENTO LEY 1581
              </span>
              <strong className="text-xl font-bold text-emerald-900 mt-1 block flex items-center gap-1.5">
                <Icon name="check" size={18} /> Habeas Data Vigente
              </strong>
              <small className="text-emerald-800 text-xs">Autorizado por el acudiente</small>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-5 bg-white mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Icon name="user" size={20} className="text-blue-700" />
              Datos de tu Acudiente / Contacto de Emergencia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Nombre del Acudiente</span>
                <strong className="text-base font-bold text-slate-900">
                  {myStudentRecord.guardian.name}
                </strong>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block">Parentesco</span>
                <strong className="text-base font-bold text-slate-900">
                  {myStudentRecord.guardian.relationship}
                </strong>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block">Teléfono Registrado</span>
                <strong className="text-base font-bold text-slate-900">
                  {myStudentRecord.guardian.phone}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            {onSelectStudentForBulletin && (
              <button
                className="action-btn primary text-sm"
                onClick={() => onSelectStudentForBulletin(myStudentRecord)}
              >
                <Icon name="report" size={18} />
                <span>Consultar Mi Boletín Oficial</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* VIEW FOR ADMIN / TEACHER: FULL DIRECTORY & CRUD */
        <>
          {/* Search and Filters Bar */}
          <div className="card-surface mb-6 p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-700">
                  <Icon name="search" size={20} />
                </span>
                <input
                  type="text"
                  className="form-input pl-10 text-base"
                  placeholder="Buscar estudiante por nombre, código SIMAT o acudiente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  className="form-select font-semibold text-sm h-11"
                  value={selectedGroupFilter}
                  onChange={(e) => setSelectedGroupFilter(e.target.value)}
                >
                  <option value="all">Todos los grupos</option>
                  {courseGroups.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>

                <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
                  {filteredStudents.length} de {students.length}
                </span>
              </div>
            </div>
          </div>

          {/* Directory Table */}
          <div className="card-surface p-0 overflow-hidden">
            <div className="table-header-bar px-6 py-4 flex items-center justify-between border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Padrón de Estudiantes Matriculados
                </h2>
                <p className="text-base text-slate-700">
                  Gestión académica · {courseGroups.length} grupos activos
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md">
                <Icon name="shield" size={16} /> Ley 1581 Verificada
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="custom-table w-full">
                <thead>
                  <tr>
                    <th className="text-left w-24">CÓDIGO</th>
                    <th className="text-left">ESTUDIANTE Y DOCUMENTO</th>
                    <th className="text-left">CURSO / GRUPO</th>
                    <th className="text-left">ACUDIENTE</th>
                    <th className="text-center w-36">ESTADO</th>
                    <th className="text-right w-48">ACCIONES (CRUD)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-700">
                        No se encontraron estudiantes con los filtros indicados.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr key={st.id} className="table-row-hover">
                        <td className="font-mono text-sm font-bold text-slate-900">
                          <span className="bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
                            {st.code}
                          </span>
                        </td>

                        <td>
                          <div className="flex items-center gap-3">
                            <span className="table-avatar" style={{ background: st.color }}>
                              {st.initials}
                            </span>
                            <div>
                              <strong className="text-slate-900 text-base font-bold block">
                                {st.name}
                              </strong>
                              <span className="text-sm font-medium text-slate-700">
                                {st.document}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="font-bold text-slate-900 text-base">
                          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 font-bold border border-blue-200">
                            {st.group}
                          </span>
                        </td>

                        <td>
                          <div>
                            <strong className="text-slate-900 text-base font-bold block">
                              {st.guardian.name}
                            </strong>
                            <span className="text-sm font-medium text-slate-700">
                              {st.guardian.relationship} · {st.guardian.phone}
                            </span>
                          </div>
                        </td>

                        <td className="text-center">
                          <span
                            className={`status-badge ${
                              st.status === "Activo" ? "present" : "absent"
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>

                        <td className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              className="p-2 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-slate-100"
                              onClick={() => setSelectedStudentDetail(st)}
                              title="Ver ficha completa"
                            >
                              <Icon name="search" size={18} />
                            </button>

                            {canManage && (
                              <>
                                <button
                                  className="p-2 rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-slate-100"
                                  onClick={() => openEditModal(st)}
                                  title="Editar y matricular en grupo"
                                >
                                  <Icon name="edit" size={18} />
                                </button>

                                <button
                                  className="p-2 rounded-lg text-slate-700 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setStudentToDelete(st)}
                                  title="Eliminar o retirar estudiante"
                                >
                                  <Icon name="trash" size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer-bar px-6 py-4 border-t border-slate-200 flex items-center justify-between text-slate-700 text-base font-medium">
              <span>Total estudiantes registrados: {students.length}</span>
              <span className="text-emerald-800 font-semibold">
                ✓ Cumplimiento Ley 1581 de 2012 (Habeas Data de Menores)
              </span>
            </div>
          </div>
        </>
      )}

      {/* MODAL: CREAR ESTUDIANTE */}
      {isCreateModalOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setIsCreateModalOpen(false)}
        >
          <div className="help-modal-card" role="dialog" aria-modal="true">
            <header className="help-modal-header">
              <div className="flex items-center gap-3">
                <span className="help-modal-icon">
                  <Icon name="plus" size={24} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Registrar y Matricular Estudiante
                  </h2>
                  <p className="text-sm text-slate-700">Formulario institucional de ingreso 2025</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-700 hover:text-slate-900"
              >
                <Icon name="close" size={22} />
              </button>
            </header>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="filter-label">NOMBRE COMPLETO DEL ESTUDIANTE *</label>
                  <input
                    type="text"
                    className="form-input font-bold"
                    placeholder="Ej: Daniel Antonio Mercado Polo"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="filter-label">DOCUMENTO DE IDENTIDAD (T.I.) *</label>
                  <input
                    type="text"
                    className="form-input font-bold"
                    placeholder="Ej: T.I. 1.106.772.441"
                    value={formDoc}
                    onChange={(e) => setFormDoc(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="filter-label">CÓDIGO SIMAT</label>
                  <input
                    type="text"
                    className="form-input font-mono font-bold"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                  />
                </div>

                <div>
                  <label className="filter-label">CURSO / GRUPO DE MATRÍCULA *</label>
                  <select
                    className="form-select font-bold"
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                  >
                    {courseGroups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name} ({g.classroom})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-base font-bold text-slate-900 mb-3">
                  Datos del Acudiente Principal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="filter-label">NOMBRE DEL ACUDIENTE</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: Clara Polo Gómez"
                      value={formGuardianName}
                      onChange={(e) => setFormGuardianName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="filter-label">PARENTESCO</label>
                    <select
                      className="form-select"
                      value={formGuardianRel}
                      onChange={(e) =>
                        setFormGuardianRel(
                          e.target.value as "Madre" | "Padre" | "Tutor Legal" | "Abuela/o",
                        )
                      }
                    >
                      <option value="Madre">Madre</option>
                      <option value="Padre">Padre</option>
                      <option value="Tutor Legal">Tutor Legal</option>
                      <option value="Abuela/o">Abuela / Abuelo</option>
                    </select>
                  </div>

                  <div>
                    <label className="filter-label">TELÉFONO DE CONTACTO</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: 301 555 1234"
                      value={formGuardianPhone}
                      onChange={(e) => setFormGuardianPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="consentCreate"
                  className="w-5 h-5 accent-blue-600 rounded"
                  checked={formConsent}
                  onChange={(e) => setFormConsent(e.target.checked)}
                />
                <label
                  htmlFor="consentCreate"
                  className="text-sm font-semibold text-slate-800 cursor-pointer"
                >
                  Consentimiento informado firmado digitalmente para tratamiento de datos personales
                  de menores de edad (Ley 1581 de 2012).
                </label>
              </div>

              <footer className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="action-btn primary">
                  <Icon name="check" size={18} />
                  <span>Guardar y Matricular</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR / MATRICULAR ESTUDIANTE */}
      {editingStudent && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setEditingStudent(null)}
        >
          <div className="help-modal-card" role="dialog" aria-modal="true">
            <header className="help-modal-header">
              <div className="flex items-center gap-3">
                <span className="help-modal-icon">
                  <Icon name="edit" size={24} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Editar y Reasignar Matrícula</h2>
                  <p className="text-sm text-slate-700">
                    {editingStudent.name} ({editingStudent.code})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-700 hover:text-slate-900"
              >
                <Icon name="close" size={22} />
              </button>
            </header>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="filter-label">NOMBRE DEL ESTUDIANTE</label>
                  <input
                    type="text"
                    className="form-input font-bold"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="filter-label">CURSO / GRUPO DE MATRÍCULA</label>
                  <select
                    className="form-select font-bold text-blue-900"
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                  >
                    {courseGroups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name} ({g.classroom})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="filter-label">DOCUMENTO</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formDoc}
                    onChange={(e) => setFormDoc(e.target.value)}
                  />
                </div>

                <div>
                  <label className="filter-label">ESTADO</label>
                  <select
                    className="form-select font-bold"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Activo" | "Inactivo")}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo / Retirado</option>
                  </select>
                </div>

                <div>
                  <label className="filter-label">TELÉFONO ACUDIENTE</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formGuardianPhone}
                    onChange={(e) => setFormGuardianPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="filter-label">NOMBRE DEL ACUDIENTE ASOCIADO</label>
                <input
                  type="text"
                  className="form-input"
                  value={formGuardianName}
                  onChange={(e) => setFormGuardianName(e.target.value)}
                />
              </div>

              <footer className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setEditingStudent(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="action-btn primary">
                  <Icon name="check" size={18} />
                  <span>Actualizar Matrícula</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN */}
      {studentToDelete && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setStudentToDelete(null)}
        >
          <div className="help-modal-card max-w-md" role="dialog" aria-modal="true">
            <div className="p-6 text-center">
              <span className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
                <Icon name="warning" size={28} />
              </span>
              <h3 className="text-xl font-bold text-slate-900">¿Retirar / Eliminar Estudiante?</h3>
              <p className="text-base text-slate-700 mt-2">
                ¿Estás seguro de retirar a <strong>{studentToDelete.name}</strong> (
                {studentToDelete.code}) del grado {studentToDelete.group}?
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button className="action-btn secondary" onClick={() => setStudentToDelete(null)}>
                  Cancelar
                </button>
                <button
                  className="action-btn bg-red-600 hover:bg-red-700 text-white font-bold"
                  onClick={handleConfirmDelete}
                >
                  <Icon name="trash" size={16} />
                  <span>Confirmar Retiro</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VER FICHA COMPLETA */}
      {selectedStudentDetail && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setSelectedStudentDetail(null)}
        >
          <div className="help-modal-card" role="dialog" aria-modal="true">
            <header className="help-modal-header">
              <div className="flex items-center gap-3">
                <span
                  className="table-avatar w-12 h-12 text-lg font-black"
                  style={{ background: selectedStudentDetail.color }}
                >
                  {selectedStudentDetail.initials}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedStudentDetail.name}
                  </h2>
                  <p className="text-base text-slate-700">
                    Ficha Institucional · Código SIMAT: {selectedStudentDetail.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-2 text-slate-700 hover:text-slate-900"
              >
                <Icon name="close" size={24} />
              </button>
            </header>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase block">
                    DOCUMENTO
                  </span>
                  <strong className="text-base font-bold text-slate-900 mt-1 block">
                    {selectedStudentDetail.document}
                  </strong>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase block">
                    CURSO / GRUPO
                  </span>
                  <strong className="text-base font-bold text-slate-900 mt-1 block">
                    {selectedStudentDetail.group}
                  </strong>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-900 uppercase block">
                    HABEAS DATA
                  </span>
                  <strong className="text-base font-bold text-emerald-900 mt-1 block flex items-center gap-1.5">
                    <Icon name="check" size={16} /> Ley 1581 Activo
                  </strong>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Icon name="user" size={20} className="text-blue-700" />
                  Información del Acudiente y Contacto Familiar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-700 block">Acudiente</span>
                    <strong className="text-base font-bold text-slate-900">
                      {selectedStudentDetail.guardian.name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700 block">Parentesco</span>
                    <strong className="text-base font-bold text-slate-900">
                      {selectedStudentDetail.guardian.relationship}
                    </strong>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700 block">Teléfono</span>
                    <strong className="text-base font-bold text-slate-900">
                      {selectedStudentDetail.guardian.phone}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <footer className="help-modal-footer">
              <button
                className="action-btn secondary"
                onClick={() => setSelectedStudentDetail(null)}
              >
                Cerrar Ficha
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
