import { useState } from "react";
import {
  Activity,
  StudyMaterial,
  CourseGroup,
  Role,
  TaskSubmission,
  ForumPost,
  TaskAttachment,
  TaskAttachmentType,
} from "../types";
import { Icon } from "../icons";

// TODAY for mock purposes (determines if tasks are late)
const TODAY = "2025-05-28";

interface ActividadesViewProps {
  activities: Activity[];
  studyMaterials: StudyMaterial[];
  courseGroups: CourseGroup[];
  currentRole: Role;
  currentStudentId?: number;
  submissions: TaskSubmission[];
  forumPosts: ForumPost[];
  onToggleCompleteActivity: (actId: string, studentId: number) => void;
  onAddActivity: (act: Omit<Activity, "id" | "completedByStudentIds">) => void;
  onAddMaterial: (mat: Omit<StudyMaterial, "id">) => void;
  onAddSubmission: (sub: Omit<TaskSubmission, "id">) => void;
  onGradeSubmission: (submissionId: string, grade: number, gradedBy: string) => void;
  onAddForumPost: (post: Omit<ForumPost, "id">) => void;
}

function getTaskStatus(
  act: Activity,
  studentId: number,
  submissions: TaskSubmission[],
): "calificada" | "entregada" | "retrasada" | "pendiente" {
  const sub = submissions.find((s) => s.taskId === act.id && s.studentId === studentId);
  if (!sub) {
    return act.dueDate < TODAY ? "retrasada" : "pendiente";
  }
  if (sub.grade !== undefined) return "calificada";
  return "entregada";
}

function statusChip(status: string) {
  switch (status) {
    case "calificada":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
          Calificada
        </span>
      );
    case "entregada":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
          Entregada
        </span>
      );
    case "retrasada":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">
          Retrasada
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          Pendiente
        </span>
      );
  }
}

function attachmentIconName(type: string): "clipboard" | "book" | "fileText" {
  if (type === "Rúbrica") return "clipboard";
  if (type === "Bibliografía") return "book";
  return "fileText";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ActividadesView({
  activities,
  studyMaterials,
  courseGroups,
  currentRole,
  currentStudentId = 1,
  submissions,
  forumPosts,
  onToggleCompleteActivity,
  onAddActivity,
  onAddMaterial,
  onAddSubmission,
  onGradeSubmission,
  onAddForumPost,
}: ActividadesViewProps) {
  const [activeTab, setActiveTab] = useState<"actividades" | "material">("actividades");
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // New activity form state
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState<
    "Matemáticas" | "Lengua Castellana" | "Ciencias Naturales" | "Ciencias Sociales" | "Inglés"
  >("Matemáticas");
  const [newGroup, setNewGroup] = useState("Grado 9° A");
  const [newDueDate, setNewDueDate] = useState("2025-06-05");
  const [newDesc, setNewDesc] = useState("");
  const [newTeacher, setNewTeacher] = useState("Lic. Roberto Gómez Peñate");
  const [newRubric, setNewRubric] = useState("");
  const [newBiblio, setNewBiblio] = useState("");
  const [newForumEnabled, setNewForumEnabled] = useState(false);
  const [newAttachments, setNewAttachments] = useState<{ name: string; type: string }[]>([]);

  // New material form state
  const [matTitle, setMatTitle] = useState("");
  const [matSubject, setMatSubject] = useState<
    "Matemáticas" | "Lengua Castellana" | "Ciencias Naturales" | "Ciencias Sociales" | "Inglés"
  >("Matemáticas");
  const [matGroup, setMatGroup] = useState("Grado 9° A");
  const [matType, setMatType] = useState<
    "Guía PDF" | "Taller Práctico" | "Lectura" | "Guía de Laboratorio"
  >("Guía PDF");
  const [matDesc, setMatDesc] = useState("");

  // Submission form
  const [subComment, setSubComment] = useState("");
  const [subFileName, setSubFileName] = useState("");

  // Grading state: submissionId -> grade string
  const [gradingValues, setGradingValues] = useState<Record<string, string>>({});

  // Forum form
  const [forumContent, setForumContent] = useState("");
  const [forumAttachment, setForumAttachment] = useState("");

  const isStudent = currentRole === "Estudiante";
  const isAcudiente = currentRole === "Acudiente";
  const canCreate = currentRole === "Docente" || currentRole === "Administrativo";
  const isTeacherOrAdmin = currentRole === "Docente" || currentRole === "Administrativo";

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    if (isStudent && act.group !== "Grado 9° A") return false;
    if (isAcudiente && act.group !== "Grado 9° A") return false;
    if (selectedSubjectFilter !== "all" && act.subject !== selectedSubjectFilter) return false;
    return true;
  });

  // Filter materials
  const filteredMaterials = studyMaterials.filter((mat) => {
    if (isStudent && mat.group !== "Grado 9° A") return false;
    if (isAcudiente && mat.group !== "Grado 9° A") return false;
    if (selectedSubjectFilter !== "all" && mat.subject !== selectedSubjectFilter) return false;
    return true;
  });

  // Stats for student/acudiente
  const studentActivities = activities.filter((a) => a.group === "Grado 9° A");
  const completedCount = studentActivities.filter((a) =>
    a.completedByStudentIds.includes(currentStudentId),
  ).length;
  const pendingCount = studentActivities.length - completedCount;

  const selectedActivity = filteredActivities.find((a) => a.id === selectedActivityId) || null;

  const handleSimulateDownload = (title: string) => {
    setDownloadNotice(`Descarga simulada de "${title}" iniciada. Archivo disponible sin conexión.`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const handleCreateActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const taskId = `act-${Date.now()}`;
    const attachments: TaskAttachment[] = newAttachments
      .filter((a) => a.name.trim())
      .map((a, i) => ({
        id: `att-new-${i}-${Date.now()}`,
        taskId,
        name: a.name.trim(),
        type: a.type as TaskAttachmentType,
        size: "1.0 MB",
        uploadedBy: newTeacher,
      }));
    onAddActivity({
      title: newTitle.trim(),
      subject: newSubject,
      group: newGroup,
      teacherName: newTeacher,
      dueDate: newDueDate,
      description: newDesc.trim() || "Ver instrucciones adjuntas.",
      rubric: newRubric.trim(),
      bibliography: newBiblio.trim(),
      maxScore: 5.0,
      hasForumEnabled: newForumEnabled,
      attachments,
    });
    setNewTitle("");
    setNewDesc("");
    setNewRubric("");
    setNewBiblio("");
    setNewForumEnabled(false);
    setNewAttachments([]);
    setIsAddActivityOpen(false);
  };

  const handleCreateMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) return;
    onAddMaterial({
      title: matTitle.trim(),
      subject: matSubject,
      group: matGroup,
      teacherName: newTeacher,
      type: matType,
      fileSize: "2.5 MB",
      uploadDate: new Date().toISOString().split("T")[0],
      description: matDesc.trim() || "Material de apoyo complementario para estudio autónomo.",
    });
    setMatTitle("");
    setMatDesc("");
    setIsAddMaterialOpen(false);
  };

  const handleSubmitDelivery = (act: Activity) => {
    if (!subFileName.trim()) return;
    onAddSubmission({
      taskId: act.id,
      studentId: currentStudentId,
      studentName: "Ana Martínez González",
      submittedAt: new Date().toISOString(),
      fileName: subFileName.trim(),
      comment: subComment.trim(),
      status: act.dueDate < TODAY ? "late" : "submitted",
    });
    setSubFileName("");
    setSubComment("");
  };

  const handleSaveGrade = (sub: TaskSubmission) => {
    const gradeVal = parseFloat(gradingValues[sub.id] || "");
    if (isNaN(gradeVal) || gradeVal < 0 || gradeVal > 5) return;
    onGradeSubmission(sub.id, gradeVal, "Lic. Roberto Gómez Peñate");
  };

  const handlePostForum = (act: Activity) => {
    if (!forumContent.trim()) return;
    const authorId = isStudent ? currentStudentId : "teacher";
    const authorName =
      isStudent
        ? "Ana Martínez González"
        : currentRole === "Docente"
          ? act.teacherName
          : "Administrador";
    onAddForumPost({
      taskId: act.id,
      authorId,
      authorName,
      authorRole: currentRole,
      content: forumContent.trim(),
      attachmentName: forumAttachment.trim() || undefined,
      postedAt: new Date().toISOString(),
    });
    setForumContent("");
    setForumAttachment("");
  };

  // Render the right panel: task detail
  const renderTaskDetail = () => {
    if (!selectedActivity) return null;
    const act = selectedActivity;
    const taskForumPosts = forumPosts
      .filter((p) => p.taskId === act.id)
      .sort((a, b) => a.postedAt.localeCompare(b.postedAt));

    // Students in this group (for teacher grading view)
    const groupStudents = [
      { id: 1, name: "Ana Martínez González", initials: "AM", color: "#DBEAFE" },
      { id: 2, name: "Carlos Rodríguez Silvera", initials: "CR", color: "#DCFCE7" },
      { id: 3, name: "Sofía Gómez De la Hoz", initials: "SG", color: "#FCE7F3" },
      { id: 4, name: "David López Mercado", initials: "DL", color: "#FEF3C7" },
    ].filter((s) => act.group === "Grado 9° A");

    // For student view
    const mySubmission =
      isStudent || isAcudiente
        ? submissions.find((s) => s.taskId === act.id && s.studentId === currentStudentId)
        : null;

    return (
      <div className="flex flex-col h-full max-h-[calc(100vh-220px)] overflow-hidden">
        {/* Sticky header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex-1 min-w-0 mr-4">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200 mr-2">
              {act.subject}
            </span>
            <strong className="text-lg font-bold text-slate-900 block mt-1 leading-tight">
              {act.title}
            </strong>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Icon name="calendar" size={14} />
                Entrega: <strong>{act.dueDate}</strong>
              </span>
              <span className="text-slate-400">·</span>
              <span>{act.group}</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedActivityId(null)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 shrink-0"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Instrucciones */}
          <section>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
              Instrucciones
            </h3>
            <p className="text-base text-slate-800 leading-relaxed">{act.description}</p>
          </section>

          {/* Section 2: Rúbrica */}
          {act.rubric && (
            <section>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Icon name="clipboard" size={15} className="text-amber-700" />
                Rúbrica de Evaluación
              </h3>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-950 leading-relaxed">
                {act.rubric}
              </div>
            </section>
          )}

          {/* Section 3: Bibliografía */}
          {act.bibliography && (
            <section>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Icon name="book" size={15} className="text-blue-700" />
                Bibliografía y Referencias
              </h3>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-950 leading-relaxed">
                {act.bibliography}
              </div>
            </section>
          )}

          {/* Section 4: Attachments */}
          {act.attachments.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Icon name="fileText" size={15} className="text-slate-600" />
                Documentos Adjuntos ({act.attachments.length})
              </h3>
              <div className="space-y-2">
                {act.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="shrink-0 w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                        <Icon name={attachmentIconName(att.type)} size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{att.name}</p>
                        <p className="text-xs text-slate-500">
                          {att.type} · {att.size}
                        </p>
                      </div>
                    </div>
                    <button
                      className="action-btn secondary text-xs py-1.5 px-3 ml-2 shrink-0"
                      onClick={() => handleSimulateDownload(att.name)}
                    >
                      <Icon name="download" size={14} />
                      <span>Descargar</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 5: Forum */}
          {act.hasForumEnabled && (
            <section>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Icon name="note" size={15} className="text-slate-600" />
                Foro de Participación
              </h3>

              {isAcudiente ? (
                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-600 font-medium">
                  <Icon name="eye" size={16} className="inline mr-1 text-slate-500" />
                  Vista de solo lectura — Los acudientes pueden ver el foro pero no publicar.
                </div>
              ) : null}

              {/* Forum posts list */}
              {taskForumPosts.length === 0 ? (
                <p className="text-sm text-slate-500 italic mt-2">
                  Aún no hay publicaciones en este foro.
                </p>
              ) : (
                <div className="space-y-3 mt-2">
                  {taskForumPosts.map((post) => (
                    <div key={post.id} className="flex gap-3">
                      <span
                        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-slate-800"
                        style={{
                          background:
                            post.authorRole === "Docente"
                              ? "#DBEAFE"
                              : post.authorRole === "Estudiante"
                                ? "#DCFCE7"
                                : "#F3F4F6",
                        }}
                      >
                        {post.authorName.charAt(0)}
                      </span>
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <strong className="text-sm font-bold text-slate-900">
                            {post.authorName}
                          </strong>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                              post.authorRole === "Docente"
                                ? "bg-blue-100 text-blue-900 border-blue-300"
                                : "bg-emerald-100 text-emerald-900 border-emerald-300"
                            }`}
                          >
                            {post.authorRole}
                          </span>
                          <span className="text-xs text-slate-400 ml-auto">
                            {formatDate(post.postedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed">{post.content}</p>
                        {post.attachmentName && (
                          <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
                            <Icon name="fileText" size={12} />
                            {post.attachmentName}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Post form for Docente or Estudiante */}
              {(isStudent || isTeacherOrAdmin) && !isAcudiente && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <label className="filter-label">TU MENSAJE EN EL FORO</label>
                  <textarea
                    className="form-input h-20 py-2 font-normal mt-1 mb-2"
                    placeholder="Escribe tu pregunta o comentario aquí..."
                    value={forumContent}
                    onChange={(e) => setForumContent(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input mb-3"
                    placeholder="Nombre del archivo adjunto (opcional)"
                    value={forumAttachment}
                    onChange={(e) => setForumAttachment(e.target.value)}
                  />
                  <button
                    className="action-btn primary text-sm"
                    onClick={() => handlePostForum(act)}
                    disabled={!forumContent.trim()}
                  >
                    <Icon name="send" size={16} />
                    <span>Publicar en el Foro</span>
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Section 6: Entregas y Calificaciones */}
          <section>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Icon name="grade" size={15} className="text-slate-600" />
              Entregas y Calificaciones
            </h3>

            {/* STUDENT VIEW */}
            {isStudent && (
              <div>
                {!mySubmission ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        Sin entrega
                      </span>
                    </div>
                    {act.dueDate >= TODAY ? (
                      <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <label className="filter-label">NOMBRE DEL ARCHIVO / ENTREGA</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ej: Taller_Ecuaciones_Ana.pdf"
                          value={subFileName}
                          onChange={(e) => setSubFileName(e.target.value)}
                        />
                        <label className="filter-label">COMENTARIO PARA EL DOCENTE</label>
                        <textarea
                          className="form-input h-20 py-2 font-normal"
                          placeholder="Escribe un comentario o nota sobre tu entrega..."
                          value={subComment}
                          onChange={(e) => setSubComment(e.target.value)}
                        />
                        <button
                          className="action-btn primary text-sm"
                          onClick={() => handleSubmitDelivery(act)}
                          disabled={!subFileName.trim()}
                        >
                          <Icon name="download" size={16} />
                          <span>Adjuntar Entrega</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-900 font-semibold flex items-center gap-2">
                        <Icon name="alertCircle" size={18} className="text-red-600 shrink-0" />
                        Tiempo de entrega cerrado. La fecha límite ({act.dueDate}) ya pasó.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <Icon name="fileText" size={16} className="text-blue-600" />
                        {mySubmission.fileName}
                      </div>
                      {statusChip(mySubmission.grade !== undefined ? "calificada" : "entregada")}
                    </div>
                    {mySubmission.comment && (
                      <p className="text-sm text-slate-700 italic">"{mySubmission.comment}"</p>
                    )}
                    <p className="text-xs text-slate-500">
                      Enviado el {formatDate(mySubmission.submittedAt)}
                    </p>
                    {mySubmission.grade !== undefined ? (
                      <div className="flex items-center gap-4 mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <div className="text-center">
                          <span className="text-4xl font-black text-emerald-700">
                            {mySubmission.grade.toFixed(1)}
                          </span>
                          <span className="text-sm text-emerald-700 font-bold">/5.0</span>
                        </div>
                        <div className="text-sm text-emerald-900">
                          <p className="font-bold">¡Calificada!</p>
                          <p className="text-xs text-emerald-700">
                            Por {mySubmission.gradedBy} · {formatDate(mySubmission.gradedAt || "")}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900 font-semibold flex items-center gap-2">
                        <Icon name="clock" size={16} className="shrink-0" />
                        En revisión por el docente…
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ACUDIENTE VIEW: read-only */}
            {isAcudiente && (
              <div>
                {!mySubmission ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 font-medium">
                    Ana Martínez González aún no ha entregado esta tarea.
                    {act.dueDate < TODAY && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">
                        Retrasada
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <Icon name="fileText" size={15} className="text-blue-600" />
                        {mySubmission.fileName}
                      </span>
                      {statusChip(mySubmission.grade !== undefined ? "calificada" : "entregada")}
                    </div>
                    <p className="text-xs text-slate-500">
                      Entregado el {formatDate(mySubmission.submittedAt)}
                    </p>
                    {mySubmission.grade !== undefined && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <span className="text-3xl font-black text-emerald-700">
                          {mySubmission.grade.toFixed(1)}
                        </span>
                        <span className="text-sm font-bold text-emerald-900">
                          / 5.0 · Calificado por {mySubmission.gradedBy}
                        </span>
                      </div>
                    )}
                    {mySubmission.grade === undefined && (
                      <p className="text-sm text-amber-800 font-semibold">
                        Pendiente de calificación por el docente.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TEACHER / ADMIN VIEW */}
            {isTeacherOrAdmin && (
              <div>
                {groupStudents.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay estudiantes en este grupo.</p>
                ) : (
                  <div className="space-y-3">
                    {groupStudents.map((st) => {
                      const sub = submissions.find(
                        (s) => s.taskId === act.id && s.studentId === st.id,
                      );
                      const taskStatus = getTaskStatus(act, st.id, submissions);
                      return (
                        <div
                          key={st.id}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                        >
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-800 shrink-0"
                              style={{ background: st.color }}
                            >
                              {st.initials}
                            </span>
                            <strong className="text-sm font-bold text-slate-900 flex-1">
                              {st.name}
                            </strong>
                            {statusChip(taskStatus)}
                          </div>

                          {sub ? (
                            <div className="pl-10 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                                <Icon name="fileText" size={13} />
                                {sub.fileName} · {formatDate(sub.submittedAt)}
                              </div>
                              {sub.comment && (
                                <p className="text-xs text-slate-600 italic">"{sub.comment}"</p>
                              )}
                              {sub.grade !== undefined ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-black text-emerald-700">
                                    {sub.grade.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-emerald-700 font-semibold">
                                    /5.0 · {sub.gradedBy}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mt-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    className="form-input w-24 text-sm py-1.5"
                                    placeholder="0.0 – 5.0"
                                    value={gradingValues[sub.id] || ""}
                                    onChange={(e) =>
                                      setGradingValues((prev) => ({
                                        ...prev,
                                        [sub.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <button
                                    className="action-btn primary text-xs py-1.5 px-3"
                                    onClick={() => handleSaveGrade(sub)}
                                  >
                                    <Icon name="check" size={14} />
                                    <span>Calificar</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="pl-10 text-xs text-slate-500 italic">
                              Sin entrega registrada.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Summary stats */}
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-900 font-semibold flex gap-4 flex-wrap">
                  <span>
                    {submissions.filter((s) => s.taskId === act.id).length} entregaron
                  </span>
                  <span>
                    {submissions.filter((s) => s.taskId === act.id && s.grade !== undefined).length}{" "}
                    calificadas
                  </span>
                  <span>
                    {groupStudents.length -
                      submissions.filter((s) => s.taskId === act.id).length}{" "}
                    pendientes
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  };

  return (
    <div className="view-container">
      {/* Role banners */}
      {isStudent && (
        <div className="role-alert-banner mb-4">
          <Icon name="book" size={24} className="text-blue-700" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Panel de Tareas y Aprendizaje · Ana Martínez González (Grado 9° A)
            </strong>
            <p className="text-slate-700 text-base">
              Aquí puedes revisar tus actividades asignadas por materia, descargar guías de estudio
              y entregar tus trabajos.
            </p>
          </div>
        </div>
      )}

      {isAcudiente && (
        <div className="role-alert-banner mb-4">
          <Icon name="shield" size={24} className="text-blue-700" />
          <div>
            <strong className="text-slate-900 text-lg font-bold">
              Seguimiento Académico — Ana Martínez González
            </strong>
            <p className="text-slate-700 text-sm">
              Como acudiente puedes ver las tareas, estado de entregas y calificaciones de Ana en
              modo de solo lectura.
            </p>
          </div>
        </div>
      )}

      {/* Download notice */}
      {downloadNotice && (
        <div className="feedback-banner success mb-4" role="status">
          <Icon name="check" size={20} />
          <p className="text-base font-semibold flex-1">{downloadNotice}</p>
        </div>
      )}

      {/* Page header */}
      <div className="page-header">
        <div>
          <span className="breadcrumb">
            EduAtlántico <span>/</span> Actividades Pedagógicas
          </span>
          <h1 className="page-title">Tareas y Material de Estudio</h1>
          <p className="page-subtitle">
            Gestión de tareas por materia, guías didácticas curriculares y seguimiento de entregas.
          </p>
        </div>

        {canCreate && (
          <div className="flex items-center gap-3">
            <button className="action-btn secondary" onClick={() => setIsAddMaterialOpen(true)}>
              <Icon name="fileText" size={18} />
              <span>Subir Material de Estudio</span>
            </button>
            <button className="action-btn primary" onClick={() => setIsAddActivityOpen(true)}>
              <Icon name="plus" size={18} />
              <span>Asignar Nueva Tarea</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats grid for Estudiante and Acudiente */}
      {(isStudent || isAcudiente) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card-surface p-4 text-center">
            <span className="text-xs font-bold text-slate-700 uppercase block">
              TOTAL TAREAS ASIGNADAS
            </span>
            <strong className="text-3xl font-black text-slate-900 block mt-1">
              {studentActivities.length}
            </strong>
            <small className="text-xs font-semibold text-slate-700">Segundo Periodo 2025</small>
          </div>

          <div className="card-surface p-4 text-center bg-emerald-50 border-emerald-200">
            <span className="text-xs font-bold text-emerald-900 uppercase block">
              ACTIVIDADES COMPLETADAS
            </span>
            <strong className="text-3xl font-black text-emerald-800 block mt-1">
              {completedCount}
            </strong>
            <small className="text-xs font-semibold text-emerald-900">
              {studentActivities.length > 0
                ? `${Math.round((completedCount / studentActivities.length) * 100)}% de avance`
                : "Sin tareas"}
            </small>
          </div>

          <div className="card-surface p-4 text-center bg-amber-50 border-amber-200">
            <span className="text-xs font-bold text-amber-900 uppercase block">
              TAREAS PENDIENTES
            </span>
            <strong className="text-3xl font-black text-amber-800 block mt-1">
              {pendingCount}
            </strong>
            <small className="text-xs font-semibold text-amber-900">Por entregar</small>
          </div>
        </div>
      )}

      {/* Tab + subject filter bar */}
      <div className="card-surface mb-6 p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto">
            <button
              className={`px-5 py-2.5 rounded-lg text-base font-bold transition-all ${
                activeTab === "actividades"
                  ? "bg-white text-blue-900 shadow-sm border border-slate-200"
                  : "text-slate-700 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("actividades")}
            >
              <span className="flex items-center gap-2">
                <Icon name="clipboard" size={18} />
                <span>Tareas Asignadas ({filteredActivities.length})</span>
              </span>
            </button>

            <button
              className={`px-5 py-2.5 rounded-lg text-base font-bold transition-all ${
                activeTab === "material"
                  ? "bg-white text-blue-900 shadow-sm border border-slate-200"
                  : "text-slate-700 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("material")}
            >
              <span className="flex items-center gap-2">
                <Icon name="fileText" size={18} />
                <span>Material de Estudio ({filteredMaterials.length})</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">Materia:</label>
            <select
              className="form-select font-semibold text-sm h-10"
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            >
              <option value="all">Todas las materias</option>
              <option value="Matemáticas">Matemáticas</option>
              <option value="Lengua Castellana">Lengua Castellana</option>
              <option value="Ciencias Naturales">Ciencias Naturales</option>
              <option value="Ciencias Sociales">Ciencias Sociales</option>
              <option value="Inglés">Inglés</option>
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: ACTIVIDADES - Two column layout */}
      {activeTab === "actividades" && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: task list */}
          <div className="lg:w-2/5 space-y-3">
            {filteredActivities.length === 0 ? (
              <div className="card-surface text-center py-12">
                <span className="inline-grid place-items-center w-16 h-16 rounded-full bg-slate-100 text-slate-600 mx-auto mb-3">
                  <Icon name="clipboard" size={32} />
                </span>
                <h3 className="text-xl font-bold text-slate-900">No hay tareas con este filtro</h3>
                <p className="text-base text-slate-700 mt-1">
                  Todas las actividades están al día o no se encontraron tareas para la materia
                  seleccionada.
                </p>
              </div>
            ) : (
              filteredActivities.map((act) => {
                const isSelected = selectedActivityId === act.id;
                const taskSubmissionsCount = submissions.filter((s) => s.taskId === act.id).length;
                const gradedCount = submissions.filter(
                  (s) => s.taskId === act.id && s.grade !== undefined,
                ).length;
                const myStatus =
                  isStudent || isAcudiente
                    ? getTaskStatus(act, currentStudentId, submissions)
                    : null;

                return (
                  <button
                    key={act.id}
                    onClick={() => setSelectedActivityId(isSelected ? null : act.id)}
                    className={`card-surface w-full text-left cursor-pointer transition-all ${
                      isSelected ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-md"
                    }`}
                  >
                    {/* Subject badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                        {act.subject}
                      </span>
                      {myStatus && statusChip(myStatus)}
                      {isTeacherOrAdmin && (
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {taskSubmissionsCount} entregaron · {gradedCount} calificadas
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <strong className="text-base font-bold text-slate-900 block leading-snug mb-2">
                      {act.title}
                    </strong>

                    {/* Due date */}
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-2">
                      <Icon name="calendar" size={14} />
                      <span>
                        Entrega:{" "}
                        <strong className={act.dueDate < TODAY ? "text-red-700" : "text-slate-800"}>
                          {act.dueDate}
                        </strong>
                      </span>
                    </div>

                    {/* Group & teacher */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                        {act.group}
                      </span>
                      <span className="text-xs text-slate-500">{act.teacherName}</span>
                    </div>

                    {/* Forum & attachment indicators */}
                    {(act.hasForumEnabled || act.attachments.length > 0) && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                        {act.attachments.length > 0 && (
                          <span className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                            <Icon name="fileText" size={12} />
                            {act.attachments.length} adjuntos
                          </span>
                        )}
                        {act.hasForumEnabled && (
                          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                            <Icon name="note" size={12} />
                            Foro activo
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Right: task detail panel */}
          {selectedActivity ? (
            <div className="lg:w-3/5 card-surface p-0 overflow-hidden">
              {renderTaskDetail()}
            </div>
          ) : (
            <div className="lg:w-3/5 card-surface flex flex-col items-center justify-center py-20 text-center">
              <Icon name="clipboard" size={40} className="text-slate-400 mb-3" />
              <p className="text-slate-700 font-semibold">
                Selecciona una tarea para ver sus detalles
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Haz clic en cualquier tarea de la lista para ver instrucciones, foro y entregas.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MATERIAL DE ESTUDIO */}
      {activeTab === "material" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.length === 0 ? (
            <div className="card-surface col-span-2 text-center py-12">
              <span className="inline-grid place-items-center w-16 h-16 rounded-full bg-slate-100 text-slate-600 mx-auto mb-3">
                <Icon name="fileText" size={32} />
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                No hay guías ni materiales disponibles
              </h3>
            </div>
          ) : (
            filteredMaterials.map((mat) => (
              <div key={mat.id} className="card-surface flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                      {mat.subject} · {mat.type}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-600">
                      {mat.fileSize}
                    </span>
                  </div>

                  <strong className="text-lg font-bold text-slate-900 block leading-tight">
                    {mat.title}
                  </strong>
                  <p className="text-sm text-slate-700 mt-2 font-normal leading-relaxed">
                    {mat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Subido por: {mat.teacherName}
                  </span>
                  <button
                    className="action-btn secondary text-sm py-1.5 px-3"
                    onClick={() => handleSimulateDownload(mat.title)}
                  >
                    <Icon name="download" size={16} />
                    <span>Descargar Guía</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Asignar Nueva Tarea */}
      {isAddActivityOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setIsAddActivityOpen(false)}
        >
          <div className="help-modal-card" role="dialog" aria-modal="true">
            <header className="help-modal-header">
              <div className="flex items-center gap-3">
                <span className="help-modal-icon">
                  <Icon name="clipboard" size={24} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Asignar Nueva Tarea / Actividad
                  </h2>
                  <p className="text-sm text-slate-700">Creación pedagógica para el grupo escolar</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddActivityOpen(false)}
                className="p-1.5 text-slate-700 hover:text-slate-900"
              >
                <Icon name="close" size={22} />
              </button>
            </header>

            <form onSubmit={handleCreateActivitySubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* 1. Título */}
              <div>
                <label className="filter-label">TÍTULO DE LA ACTIVIDAD O TALLER</label>
                <input
                  type="text"
                  className="form-input font-bold"
                  placeholder="Ej: Taller Práctico de Ecuaciones Cuadráticas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              {/* 2 & 3. Asignatura + Grupo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="filter-label">ASIGNATURA</label>
                  <select
                    className="form-select font-bold"
                    value={newSubject}
                    onChange={(e) =>
                      setNewSubject(
                        e.target.value as
                          | "Matemáticas"
                          | "Lengua Castellana"
                          | "Ciencias Naturales"
                          | "Ciencias Sociales"
                          | "Inglés",
                      )
                    }
                  >
                    <option value="Matemáticas">Matemáticas</option>
                    <option value="Lengua Castellana">Lengua Castellana</option>
                    <option value="Ciencias Naturales">Ciencias Naturales</option>
                    <option value="Ciencias Sociales">Ciencias Sociales</option>
                    <option value="Inglés">Inglés</option>
                  </select>
                </div>

                <div>
                  <label className="filter-label">GRUPO DESTINATARIO</label>
                  <select
                    className="form-select font-bold"
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                  >
                    {courseGroups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4 & 5. Fecha + Docente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="filter-label">FECHA LÍMITE DE ENTREGA</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="filter-label">DOCENTE RESPONSABLE</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                  />
                </div>
              </div>

              {/* 6. Instrucciones */}
              <div>
                <label className="filter-label">INSTRUCCIONES Y DESCRIPCIÓN</label>
                <textarea
                  className="form-input h-24 py-2 font-normal"
                  placeholder="Detalla los puntos a resolver, instrucciones paso a paso..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              {/* 7. Rúbrica */}
              <div>
                <label className="filter-label">RÚBRICA DE EVALUACIÓN</label>
                <textarea
                  className="form-input h-20 py-2 font-normal"
                  placeholder="Ej: Procedimiento (40%), Resultado (30%), Presentación (20%), Orden (10%)..."
                  value={newRubric}
                  onChange={(e) => setNewRubric(e.target.value)}
                />
              </div>

              {/* 8. Bibliografía */}
              <div>
                <label className="filter-label">BIBLIOGRAFÍA / REFERENCIAS</label>
                <textarea
                  className="form-input h-16 py-2 font-normal"
                  placeholder="Ej: Álgebra de Baldor Cap. 8; Guía MEN..."
                  value={newBiblio}
                  onChange={(e) => setNewBiblio(e.target.value)}
                />
              </div>

              {/* 9. Foro */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="forum-toggle"
                  className="w-5 h-5 accent-blue-600"
                  checked={newForumEnabled}
                  onChange={(e) => setNewForumEnabled(e.target.checked)}
                />
                <label htmlFor="forum-toggle" className="text-sm font-bold text-slate-800 cursor-pointer">
                  Habilitar Foro de Participación para esta tarea
                </label>
              </div>

              {/* 10. Attachments */}
              <div>
                <label className="filter-label">DOCUMENTOS ADJUNTOS (SIMULADO)</label>
                <div className="space-y-2 mt-1">
                  {newAttachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="form-input flex-1 text-sm"
                        placeholder="Nombre del archivo"
                        value={att.name}
                        onChange={(e) => {
                          const updated = [...newAttachments];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setNewAttachments(updated);
                        }}
                      />
                      <select
                        className="form-select text-sm w-44"
                        value={att.type}
                        onChange={(e) => {
                          const updated = [...newAttachments];
                          updated[idx] = { ...updated[idx], type: e.target.value };
                          setNewAttachments(updated);
                        }}
                      >
                        <option value="Guía PDF">Guía PDF</option>
                        <option value="Rúbrica">Rúbrica</option>
                        <option value="Bibliografía">Bibliografía</option>
                        <option value="Material de Apoyo">Material de Apoyo</option>
                      </select>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 p-1"
                        onClick={() => setNewAttachments(newAttachments.filter((_, i) => i !== idx))}
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  ))}
                  {newAttachments.length < 3 && (
                    <button
                      type="button"
                      className="action-btn secondary text-xs py-1.5 px-3"
                      onClick={() =>
                        setNewAttachments([...newAttachments, { name: "", type: "Guía PDF" }])
                      }
                    >
                      <Icon name="plus" size={14} />
                      <span>Agregar Documento</span>
                    </button>
                  )}
                </div>
              </div>

              <footer className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setIsAddActivityOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="action-btn primary">
                  <Icon name="check" size={18} />
                  <span>Publicar Tarea para el Grupo</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Subir Material de Estudio */}
      {isAddMaterialOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setIsAddMaterialOpen(false)}
        >
          <div className="help-modal-card" role="dialog" aria-modal="true">
            <header className="help-modal-header">
              <div className="flex items-center gap-3">
                <span className="help-modal-icon">
                  <Icon name="fileText" size={24} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Subir Material Didáctico</h2>
                  <p className="text-sm text-slate-700">
                    Recurso disponible sin conexión para estudiantes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMaterialOpen(false)}
                className="p-1.5 text-slate-700 hover:text-slate-900"
              >
                <Icon name="close" size={22} />
              </button>
            </header>

            <form onSubmit={handleCreateMaterialSubmit} className="p-6 space-y-4">
              <div>
                <label className="filter-label">TÍTULO DEL MATERIAL / GUÍA</label>
                <input
                  type="text"
                  className="form-input font-bold"
                  placeholder="Ej: Guía de Aprendizaje N° 4: Trigonometría"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="filter-label">MATERIA</label>
                  <select
                    className="form-select font-bold"
                    value={matSubject}
                    onChange={(e) =>
                      setMatSubject(
                        e.target.value as
                          | "Matemáticas"
                          | "Lengua Castellana"
                          | "Ciencias Naturales"
                          | "Ciencias Sociales"
                          | "Inglés",
                      )
                    }
                  >
                    <option value="Matemáticas">Matemáticas</option>
                    <option value="Lengua Castellana">Lengua Castellana</option>
                    <option value="Ciencias Naturales">Ciencias Naturales</option>
                    <option value="Ciencias Sociales">Ciencias Sociales</option>
                    <option value="Inglés">Inglés</option>
                  </select>
                </div>

                <div>
                  <label className="filter-label">GRUPO</label>
                  <select
                    className="form-select font-bold"
                    value={matGroup}
                    onChange={(e) => setMatGroup(e.target.value)}
                  >
                    {courseGroups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="filter-label">TIPO DE RECURSO</label>
                  <select
                    className="form-select font-bold"
                    value={matType}
                    onChange={(e) =>
                      setMatType(
                        e.target.value as
                          | "Guía PDF"
                          | "Taller Práctico"
                          | "Lectura"
                          | "Guía de Laboratorio",
                      )
                    }
                  >
                    <option value="Guía PDF">Guía PDF</option>
                    <option value="Taller Práctico">Taller Práctico</option>
                    <option value="Lectura">Lectura</option>
                    <option value="Guía de Laboratorio">Guía de Laboratorio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="filter-label">DESCRIPCIÓN DEL RECURSO</label>
                <textarea
                  className="form-input h-24 py-2 font-normal"
                  placeholder="Explica qué encontrará el estudiante en este documento..."
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                />
              </div>

              <footer className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setIsAddMaterialOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="action-btn primary">
                  <Icon name="check" size={18} />
                  <span>Publicar Material</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
