import { useState, useMemo } from "react";
import { Student, Role } from "../types";
import { Icon } from "../icons";

interface BoletinesViewProps {
  students: Student[];
  currentRole: Role;
}

export function BoletinesView({ students, currentRole }: BoletinesViewProps) {
  // If role is Estudiante or Acudiente, lock strictly to Ana Martínez (id: 1)
  const isRoleLocked = currentRole === "Estudiante" || currentRole === "Acudiente";
  const defaultStudentId = 1;

  const [selectedStudentId, setSelectedStudentId] = useState<number>(defaultStudentId);
  const [selectedTerm, setSelectedTerm] = useState("Segundo Periodo");

  const availableStudents = useMemo(() => {
    if (isRoleLocked) {
      return students.filter((s) => s.id === 1);
    }
    return students;
  }, [students, isRoleLocked]);

  const student = useMemo(() => {
    return (
      availableStudents.find((s) => s.id === selectedStudentId) ||
      availableStudents[0] || {
        id: 1,
        code: "EST-09024",
        document: "T.I. 1.104.825.614",
        name: "Ana Martínez González",
        initials: "AM",
        group: "Grado 9° A",
        color: "#DBEAFE",
        guardian: {
          name: "Carmen González Rocha",
          phone: "301 456 7890",
          relationship: "Madre",
          email: "carmen.gonzalez@correo.com",
        },
        habeasDataConsent: true,
        status: "Activo" as const,
        grades: {
          matematicas: 4.5,
          lengua: 4.2,
          ciencias: 3.9,
          sociales: 4.4,
          ingles: 4.1,
        },
        absences: 1,
      }
    );
  }, [students, selectedStudentId]);

  // Compute average and performance
  const gradesArray = [
    {
      subject: "Matemáticas (Álgebra y Razonamiento)",
      hours: "5 hrs/sem",
      grade: student.grades.matematicas,
      teacherObs:
        student.grades.matematicas >= 4.0
          ? "Excelente dominio de conceptos algebraicos y participación activa en talleres prácticos."
          : "Requiere afianzar el despeje de ecuaciones lineales mediante las guías de refuerzo.",
    },
    {
      subject: "Lengua Castellana y Literatura",
      hours: "4 hrs/sem",
      grade: student.grades.lengua,
      teacherObs:
        "Demuestra fluidez en producción textual y análisis crítico de obras narrativas latinoamericanas.",
    },
    {
      subject: "Ciencias Naturales y Biología",
      hours: "4 hrs/sem",
      grade: student.grades.ciencias,
      teacherObs:
        "Muestra gran interés por los ecosistemas del Caribe y la conservación del bosque seco tropical.",
    },
    {
      subject: "Ciencias Sociales e Historia",
      hours: "3 hrs/sem",
      grade: student.grades.sociales,
      teacherObs:
        "Aporta activamente en debates sobre la geografía e historia de los municipios del Atlántico.",
    },
    {
      subject: "Inglés y Bilingüismo",
      hours: "3 hrs/sem",
      grade: student.grades.ingles,
      teacherObs:
        "Buen nivel de comprensión oral y vocabulario en situaciones comunicativas cotidianas.",
    },
  ];

  const totalGrades = gradesArray.reduce((acc, curr) => acc + curr.grade, 0);
  const average = (totalGrades / gradesArray.length).toFixed(2);
  const numAverage = Number(average);

  const getPerformanceLabel = (val: number) => {
    if (val < 3.0) return { label: "Bajo", class: "low" };
    if (val <= 3.9) return { label: "Básico", class: "basic" };
    if (val <= 4.5) return { label: "Alto", class: "high" };
    return { label: "Superior", class: "superior" };
  };

  const generalPerf = getPerformanceLabel(numAverage);

  const handlePrint = () => {
    window.print();
  };

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
              Consulta oficial de tu boletín académico de calificaciones y asistencia. Puedes
              descargarlo o imprimirlo en cualquier momento.
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
              Boletín escolar oficial de tu acudida (Ana Martínez González). Documento oficial disponible localmente
              incluso sin conexión a internet.
            </p>
          </div>
        </div>
      )}

      {/* Page Header (Hidden on Print) */}
      <div className="page-header print:hidden">
        <div>
          <span className="breadcrumb">
            EduAtlántico <span>/</span> Certificación Académica
          </span>
          <h1 className="page-title">Generador de Boletines Académicos</h1>
          <p className="page-subtitle">
            Informe oficial de calificaciones, fallas y observaciones listo para impresión y
            consulta de familias.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="action-btn primary" onClick={handlePrint}>
            <Icon name="print" size={20} />
            <span>Imprimir Boletín / Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Selector Toolbar (Hidden on Print) */}
      <div className="card-surface mb-6 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="filter-label">ESTUDIANTE A CONSULTAR</label>
            <select
              className="form-select font-bold"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              disabled={isRoleLocked}
            >
              {availableStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code} · {s.group})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="filter-label">PERIODO ACADÉMICO</label>
            <select
              className="form-select font-bold"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
            >
              <option value="Primer Periodo">Primer Periodo (25%)</option>
              <option value="Segundo Periodo">Segundo Periodo (25% - Actual)</option>
              <option value="Tercer Periodo">Tercer Periodo (25%)</option>
              <option value="Cuarto Periodo">Cuarto Periodo (25%)</option>
            </select>
          </div>

          <div className="flex items-center justify-between bg-blue-50 p-3.5 rounded-xl border border-blue-200">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase block">
                Promedio Acumulado
              </span>
              <strong className="text-2xl font-black text-blue-950">{average} / 5.0</strong>
            </div>
            <span className={`performance-chip ${generalPerf.class} text-base px-3 py-1`}>
              Desempeño {generalPerf.label}
            </span>
          </div>
        </div>
      </div>

      {/* THE PRINTABLE BULLETIN SHEET */}
      <div className="printable-report-sheet">
        {/* Header Institution */}
        <div className="report-header-section">
          <div className="flex items-center gap-4">
            <span className="report-logo-box">
              <Icon name="academy" size={36} />
            </span>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                INSTITUCIÓN EDUCATIVA DEPARTAMENTAL NUEVO HORIZONTE
              </h2>
              <p className="text-base text-slate-700 font-semibold">
                Secretaría de Educación Departamental del Atlántico · Código DANE: 108001002341
              </p>
              <p className="text-sm text-slate-700">
                Resolución Oficial N° 0452 de la Gobernación del Atlántico · Sabanalarga / Luruaco
              </p>
            </div>
          </div>
          <div className="text-right border-l-2 border-slate-300 pl-4">
            <span className="text-xs font-black uppercase tracking-widest text-slate-700 block">
              INFORME OFICIAL
            </span>
            <strong className="text-xl font-black text-slate-900 block mt-0.5">
              BOLETÍN ACADÉMICO
            </strong>
            <span className="text-sm font-bold text-slate-800">AÑO LECTIVO 2025</span>
          </div>
        </div>

        {/* Student metadata box */}
        <div className="student-report-box mt-6">
          <div>
            <span className="report-meta-label">ESTUDIANTE</span>
            <strong className="report-meta-value text-slate-900 text-lg">{student.name}</strong>
            <small className="text-slate-700 text-sm font-semibold block mt-0.5">
              Documento: {student.document} · Código: {student.code}
            </small>
          </div>

          <div>
            <span className="report-meta-label">GRADO Y GRUPO</span>
            <strong className="report-meta-value text-slate-900 text-lg">{student.group}</strong>
            <small className="text-slate-700 text-sm font-semibold block mt-0.5">
              Jornada: Mañana · Sede Principal
            </small>
          </div>

          <div>
            <span className="report-meta-label">PERIODO EVALUADO</span>
            <strong className="report-meta-value text-slate-900 text-lg">{selectedTerm}</strong>
            <small className="text-slate-700 text-sm font-semibold block mt-0.5">
              Acudiente: {student.guardian.name} ({student.guardian.relationship})
            </small>
          </div>
        </div>

        {/* Summary KPIs Row */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-center">
            <span className="text-xs font-bold text-slate-700 uppercase block">
              Promedio General
            </span>
            <strong className="text-2xl font-black text-slate-900 block mt-1">{average}</strong>
            <small className="text-xs font-semibold text-slate-700">Escala de 0.0 a 5.0</small>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-center">
            <span className="text-xs font-bold text-slate-700 uppercase block">
              Escala Nacional (Dec 1290)
            </span>
            <strong className="text-2xl font-black text-emerald-800 block mt-1">
              {generalPerf.label}
            </strong>
            <small className="text-xs font-semibold text-slate-700">Desempeño Aprobatorio</small>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-center">
            <span className="text-xs font-bold text-slate-700 uppercase block">
              Inasistencias Periodo
            </span>
            <strong
              className={`text-2xl font-black block mt-1 ${
                student.absences > 2 ? "text-amber-800" : "text-slate-900"
              }`}
            >
              {student.absences} fallas
            </strong>
            <small className="text-xs font-semibold text-slate-700">
              {student.absences > 2 ? "Atención requerida" : "Asistencia regular"}
            </small>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-center">
            <span className="text-xs font-bold text-slate-700 uppercase block">
              Puesto en el Grupo
            </span>
            <strong className="text-2xl font-black text-blue-900 block mt-1">
              {student.id === 3 ? "1°" : student.id === 1 ? "2°" : "5°"} de 32
            </strong>
            <small className="text-xs font-semibold text-slate-700">Rendimiento general</small>
          </div>
        </div>

        {/* Grades Table in Bulletin */}
        <div className="mt-6 border border-slate-300 rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="py-3 px-4 text-left text-sm font-bold text-slate-900 uppercase">
                  Área / Asignatura
                </th>
                <th className="py-3 px-3 text-center text-sm font-bold text-slate-900 uppercase w-24">
                  I.H.
                </th>
                <th className="py-3 px-3 text-center text-sm font-bold text-slate-900 uppercase w-24">
                  Nota
                </th>
                <th className="py-3 px-3 text-center text-sm font-bold text-slate-900 uppercase w-32">
                  Desempeño
                </th>
                <th className="py-3 px-4 text-left text-sm font-bold text-slate-900 uppercase">
                  Observaciones y Logros Pedagógicos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {gradesArray.map((row, idx) => {
                const perf = getPerformanceLabel(row.grade);
                return (
                  <tr key={idx} className="text-base text-slate-900">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.subject}</td>
                    <td className="py-3.5 px-3 text-center text-slate-700 font-medium">
                      {row.hours}
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-lg text-slate-900">
                      {row.grade.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`performance-chip ${perf.class}`}>{perf.label}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 text-sm font-normal leading-relaxed">
                      {row.teacherObs}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* General Direction Observation */}
        <div className="mt-6 p-4 rounded-xl border-l-4 border-blue-700 bg-blue-50 text-slate-900">
          <strong className="text-base font-bold text-blue-950 block mb-1">
            OBSERVACIONES GENERALES DEL DIRECTOR DE GRUPO:
          </strong>
          <p className="text-base text-slate-800 font-normal leading-relaxed">
            El estudiante demuestra un desempeño{" "}
            <span className="font-bold">{generalPerf.label.toLowerCase()}</span> en el cumplimiento
            de sus compromisos formativos. Se felicita el acompañamiento brindado por su acudiente{" "}
            <span className="font-bold">{student.guardian.name}</span> y se recomienda continuar con
            los hábitos de estudio autónomo en casa.
          </p>
        </div>

        {/* Formal Signatures */}
        <div className="grid grid-cols-2 gap-16 mt-16 pt-8 border-t border-slate-300">
          <div className="text-center">
            <div className="w-56 h-0.5 bg-slate-900 mx-auto mb-2"></div>
            <strong className="text-base font-bold text-slate-900 block">
              Lic. Roberto Gómez Peñate
            </strong>
            <span className="text-sm font-semibold text-slate-700 block">
              Director de Grupo · Grado 9° A
            </span>
          </div>

          <div className="text-center">
            <div className="w-56 h-0.5 bg-slate-900 mx-auto mb-2"></div>
            <strong className="text-base font-bold text-slate-900 block">
              {student.guardian.name}
            </strong>
            <span className="text-sm font-semibold text-slate-700 block">
              Firma del Acudiente ({student.guardian.relationship})
            </span>
          </div>
        </div>

        {/* Footer print info */}
        <div className="mt-12 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 font-medium">
          <span>
            Generado digitalmente por EduAtlántico · Certificado Offline-First · Ley 1581 de 2012
          </span>
          <span>Fecha de expedición: 22 de Mayo de 2025 · Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
}
