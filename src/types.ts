export type Role = "Administrativo" | "Docente" | "Estudiante" | "Acudiente";

export type View =
  | "resumen"
  | "asistencia"
  | "calificaciones"
  | "observaciones"
  | "estudiantes"
  | "cursos"
  | "actividades"
  | "boletines"
  | "cola";

export type AttendanceStatus = "Presente" | "Ausente" | "Excusa" | "";

export type Guardian = {
  name: string;
  phone: string;
  relationship: "Madre" | "Padre" | "Tutor Legal" | "Abuela/o";
  email: string;
};

export type Student = {
  id: number;
  code: string;
  document: string;
  name: string;
  initials: string;
  group: string;
  color: string;
  guardian: Guardian;
  habeasDataConsent: boolean;
  status: "Activo" | "Inactivo";
  grades: {
    matematicas: number;
    lengua: number;
    ciencias: number;
    sociales: number;
    ingles: number;
  };
  absences: number;
};

export type CourseGroup = {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  directorTeacher: string;
  classroom: string;
  shift: "Mañana" | "Tarde";
  capacity: number;
  academicYear: number;
};

export type Teacher = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  groupAssigned: string;
  initials: string;
  color: string;
};

export type TaskAttachmentType = "Guía PDF" | "Rúbrica" | "Bibliografía" | "Material de Apoyo";

export type TaskAttachment = {
  id: string;
  taskId: string;
  name: string;
  type: TaskAttachmentType;
  size: string;
  uploadedBy: string;
};

export type TaskSubmission = {
  id: string;
  taskId: string;
  studentId: number;
  studentName: string;
  submittedAt: string;
  fileName: string;
  comment: string;
  grade?: number;
  gradedAt?: string;
  gradedBy?: string;
  status: "submitted" | "graded" | "late";
};

export type ForumPost = {
  id: string;
  taskId: string;
  authorId: number | string;
  authorName: string;
  authorRole: Role;
  content: string;
  attachmentName?: string;
  postedAt: string;
};

export type Activity = {
  id: string;
  title: string;
  subject:
    | "Matemáticas"
    | "Lengua Castellana"
    | "Ciencias Naturales"
    | "Ciencias Sociales"
    | "Inglés";
  group: string;
  teacherName: string;
  dueDate: string;
  description: string;
  rubric: string;
  bibliography: string;
  maxScore: number;
  completedByStudentIds: number[];
  hasForumEnabled: boolean;
  attachments: TaskAttachment[];
};

export type StudyMaterial = {
  id: string;
  title: string;
  subject:
    | "Matemáticas"
    | "Lengua Castellana"
    | "Ciencias Naturales"
    | "Ciencias Sociales"
    | "Inglés";
  group: string;
  teacherName: string;
  type: "Guía PDF" | "Taller Práctico" | "Lectura" | "Guía de Laboratorio";
  fileSize: string;
  uploadDate: string;
  description: string;
};

export type AttendanceRecord = {
  id: string;
  studentId: number;
  studentName: string;
  group: string;
  date: string;
  status: Exclude<AttendanceStatus, "">;
  synced: boolean;
};

export type ObservationRecord = {
  id: string;
  studentId: number;
  studentName: string;
  date: string;
  type: "Pedagógica" | "Disciplinaria" | "Felicitación";
  title: string;
  detail: string;
  teacher: string;
  synced: boolean;
};

export type QueueRecord = {
  uuid: string;
  timestamp: string;
  entity: "asistencia" | "calificacion" | "observacion" | "estudiante" | "curso" | "actividad";
  action: "CREATE" | "UPDATE" | "DELETE";
  studentName: string;
  description: string;
  payload: Record<string, unknown>;
  status: "pending" | "synced";
  createdByRole?: Role;
};
