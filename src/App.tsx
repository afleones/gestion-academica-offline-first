// EduAtlántico - Offline-First Academic Management
import { useState, useEffect, useMemo } from "react";
import {
  Role,
  View,
  Student,
  AttendanceRecord,
  ObservationRecord,
  QueueRecord,
  AttendanceStatus,
  CourseGroup,
  Teacher,
  Activity,
  StudyMaterial,
  TaskSubmission,
  ForumPost,
} from "./types";
import {
  initialStudents,
  initialAttendance,
  initialObservations,
  initialCourseGroups,
  initialTeachers,
  initialActivities,
  initialStudyMaterials,
  initialTaskSubmissions,
  initialForumPosts,
} from "./mockData";
import { getLocalRecords, storeLocalRecord, clearLocalRecords } from "./db";
import { Topbar } from "./components/Topbar";
import { Sidebar } from "./components/Sidebar";
import { HelpModal } from "./components/HelpModal";
import { QueueDrawer } from "./components/QueueDrawer";
import { Login } from "./components/Login";

// Views
import { ResumenView } from "./views/ResumenView";
import { AsistenciaView } from "./views/AsistenciaView";
import { CalificacionesView } from "./views/CalificacionesView";
import { ObservacionesView } from "./views/ObservacionesView";
import { EstudiantesView } from "./views/EstudiantesView";
import { CursosGruposView } from "./views/CursosGruposView";
import { ActividadesView } from "./views/ActividadesView";
import { BoletinesView } from "./views/BoletinesView";
import { ColaSyncView } from "./views/ColaSyncView";
import { Icon } from "./icons";

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [currentView, setCurrentView] = useState<View>("resumen");
  const [online, setOnline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [queueDrawerOpen, setQueueDrawerOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [syncSuccessBanner, setSyncSuccessBanner] = useState<boolean>(false);

  // Shared state in real time for MVP simulation
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>(initialCourseGroups);
  const [teachers] = useState<Teacher[]>(initialTeachers);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(initialStudyMaterials);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>(initialTaskSubmissions);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(initialForumPosts);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(initialAttendance);
  const [observations, setObservations] = useState<ObservationRecord[]>(initialObservations);
  const [queue, setQueue] = useState<QueueRecord[]>([]);
  const [history, setHistory] = useState<QueueRecord[]>([]);

  // Toggle sidebar: mobile opens/closes drawer, desktop collapses/expands width
  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  // Active student for student view (Ana Martínez EST-09024)
  const currentStudentId = 1;

  // Load IndexedDB on startup & clear legacy test records without session attribution
  useEffect(() => {
    getLocalRecords()
      .then((records) => {
        const legacy = records.filter((r) => !r.createdByRole);
        if (legacy.length > 0) {
          clearLocalRecords().catch(console.error);
          setQueue(records.filter((r) => Boolean(r.createdByRole)));
        } else {
          setQueue(records);
        }
      })
      .catch((err) => {
        console.error("Error al cargar registros desde IndexedDB:", err);
      });
  }, []);

  // Filter queue and history to ONLY show changes registered by the current user session
  const userQueue = useMemo(
    () => queue.filter((r) => r.createdByRole === role),
    [queue, role],
  );
  const userHistory = useMemo(
    () => history.filter((r) => r.createdByRole === role),
    [history, role],
  );

  // Trigger batch sync adhering to 3.4s KPI simulation
  const triggerBatchSync = () => {
    if (userQueue.length === 0) return;
    setIsSyncing(true);
    setSyncSuccessBanner(false);

    setTimeout(async () => {
      const syncedItems: QueueRecord[] = userQueue.map((item) => ({
        ...item,
        status: "synced" as const,
      }));

      setHistory((prev) => [...syncedItems, ...prev]);

      const syncedUuids = new Set(syncedItems.map((item) => item.uuid));
      setQueue((prev) => prev.filter((item) => !syncedUuids.has(item.uuid)));

      await clearLocalRecords().catch(console.error);
      setIsSyncing(false);
      setSyncSuccessBanner(true);
    }, 1800);
  };

  // Automatic sync trigger when turning Online
  useEffect(() => {
    if (online && userQueue.length > 0 && !isSyncing) {
      triggerBatchSync();
    }
  }, [online, userQueue.length]);

  // Toggle online mode: switching to online automatically starts sync without extra buttons
  const handleToggleOnline = () => {
    setOnline((prev) => {
      const nextOnline = !prev;
      if (nextOnline) {
        setTimeout(() => {
          if (userQueue.length > 0) {
            triggerBatchSync();
          }
        }, 150);
      }
      return nextOnline;
    });
  };

  const handleForceSync = () => {
    if (!online) {
      handleToggleOnline();
    } else {
      triggerBatchSync();
    }
  };

  // Student CRUD: CREATE
  const handleCreateStudent = async (newStData: Omit<Student, "id">) => {
    const nextId = Math.max(0, ...students.map((s) => s.id)) + 1;
    const createdStudent: Student = { ...newStData, id: nextId };
    setStudents((prev) => [createdStudent, ...prev]);

    const queueRecord: QueueRecord = {
      uuid: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      entity: "estudiante",
      action: "CREATE",
      studentName: createdStudent.name,
      description: `Matrícula de nuevo estudiante en ${createdStudent.group}`,
      payload: createdStudent as unknown as Record<string, unknown>,
      status: online ? "synced" : "pending",
      createdByRole: role || "Administrativo",
    };
    if (!online) {
      await storeLocalRecord(queueRecord).catch(console.error);
      setQueue((prev) => [...prev, queueRecord]);
    } else {
      setHistory((prev) => [queueRecord, ...prev]);
    }
  };

  // Student CRUD: UPDATE
  const handleUpdateStudent = async (updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

    const queueRecord: QueueRecord = {
      uuid: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      entity: "estudiante",
      action: "UPDATE",
      studentName: updated.name,
      description: `Actualización de matrícula / datos en ${updated.group}`,
      payload: updated as unknown as Record<string, unknown>,
      status: online ? "synced" : "pending",
      createdByRole: role || "Administrativo",
    };
    if (!online) {
      await storeLocalRecord(queueRecord).catch(console.error);
      setQueue((prev) => [...prev, queueRecord]);
    } else {
      setHistory((prev) => [queueRecord, ...prev]);
    }
  };

  // Student CRUD: DELETE
  const handleDeleteStudent = async (studentId: number) => {
    const target = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));

    const queueRecord: QueueRecord = {
      uuid: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      entity: "estudiante",
      action: "DELETE",
      studentName: target ? target.name : `Estudiante #${studentId}`,
      description: `Retiro de estudiante del sistema`,
      payload: { studentId },
      status: online ? "synced" : "pending",
      createdByRole: role || "Administrativo",
    };
    if (!online) {
      await storeLocalRecord(queueRecord).catch(console.error);
      setQueue((prev) => [...prev, queueRecord]);
    } else {
      setHistory((prev) => [queueRecord, ...prev]);
    }
  };

  // Student Enrollment into Course/Group
  const handleEnrollStudent = async (studentId: number, targetGroupName: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    const updated = { ...student, group: targetGroupName };
    await handleUpdateStudent(updated);
  };

  // CourseGroup: ADD GROUP
  const handleAddGroup = async (groupData: Omit<CourseGroup, "id">) => {
    const newGroup: CourseGroup = {
      ...groupData,
      id: `grp-${Date.now()}`,
    };
    setCourseGroups((prev) => [...prev, newGroup]);

    const queueRecord: QueueRecord = {
      uuid: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      entity: "curso",
      action: "CREATE",
      studentName: newGroup.name,
      description: `Apertura de nuevo grupo ${newGroup.name}`,
      payload: newGroup as unknown as Record<string, unknown>,
      status: online ? "synced" : "pending",
      createdByRole: role || "Administrativo",
    };
    if (!online) {
      await storeLocalRecord(queueRecord).catch(console.error);
      setQueue((prev) => [...prev, queueRecord]);
    } else {
      setHistory((prev) => [queueRecord, ...prev]);
    }
  };

  // Activities: TOGGLE COMPLETION
  const handleToggleCompleteActivity = async (activityId: string, studentId: number) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id !== activityId) return act;
        const isCompleted = act.completedByStudentIds.includes(studentId);
        const newCompleted = isCompleted
          ? act.completedByStudentIds.filter((id) => id !== studentId)
          : [...act.completedByStudentIds, studentId];
        return { ...act, completedByStudentIds: newCompleted };
      }),
    );

    const queueRecord: QueueRecord = {
      uuid: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      entity: "actividad",
      action: "UPDATE",
      studentName: `Ana Martínez (EST-09024)`,
      description: `Entrega de actividad académica (${activityId})`,
      payload: { activityId, studentId },
      status: online ? "synced" : "pending",
      createdByRole: role || "Estudiante",
    };
    if (!online) {
      await storeLocalRecord(queueRecord).catch(console.error);
      setQueue((prev) => [...prev, queueRecord]);
    } else {
      setHistory((prev) => [queueRecord, ...prev]);
    }
  };

  // Activities: ADD ACTIVITY
  const handleAddActivity = async (actData: Omit<Activity, "id" | "completedByStudentIds">) => {
    const newActivity: Activity = {
      ...actData,
      id: `act-${Date.now()}`,
      completedByStudentIds: [],
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Study Materials: ADD MATERIAL
  const handleAddMaterial = async (matData: Omit<StudyMaterial, "id">) => {
    const newMaterial: StudyMaterial = {
      ...matData,
      id: `mat-${Date.now()}`,
    };
    setStudyMaterials((prev) => [newMaterial, ...prev]);
  };

  // Task Submissions: ADD SUBMISSION (Estudiante)
  const handleAddSubmission = (subData: Omit<TaskSubmission, "id">) => {
    const newSub: TaskSubmission = {
      ...subData,
      id: `sub-${Date.now()}`,
    };
    setSubmissions((prev) => [newSub, ...prev]);
  };

  // Task Submissions: GRADE (Docente)
  const handleGradeSubmission = (submissionId: string, grade: number, gradedBy: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              grade,
              gradedAt: new Date().toISOString(),
              gradedBy,
              status: "graded" as const,
            }
          : s,
      ),
    );
  };

  // Task Forum: ADD POST (Docente / Estudiante)
  const handleAddForumPost = (postData: Omit<ForumPost, "id">) => {
    const newPost: ForumPost = {
      ...postData,
      id: `fp-${Date.now()}`,
    };
    setForumPosts((prev) => [...prev, newPost]);
  };

  // Attendance Save: 1 atomic batch save for the group attendance
  const handleSaveAttendance = async (
    records: {
      studentId: number;
      studentName: string;
      group: string;
      date: string;
      status: Exclude<AttendanceStatus, "">;
    }[],
  ) => {
    const updatedAttendance = [...attendanceList];

    for (const rec of records) {
      const recordUuid = crypto.randomUUID();
      const existingIdx = updatedAttendance.findIndex(
        (a) => a.studentId === rec.studentId && a.date === rec.date,
      );

      const attItem: AttendanceRecord = {
        id: recordUuid,
        studentId: rec.studentId,
        studentName: rec.studentName,
        group: rec.group,
        date: rec.date,
        status: rec.status,
        synced: online,
      };

      if (existingIdx >= 0) {
        updatedAttendance[existingIdx] = attItem;
      } else {
        updatedAttendance.push(attItem);
      }
    }

    setAttendanceList(updatedAttendance);

    // Single atomic transaction package for the session
    const batchUuid = crypto.randomUUID();
    const groupName = records[0]?.group || "Grupo Académico";
    const sessionDate = records[0]?.date || new Date().toISOString().split("T")[0];
    const presentCount = records.filter((r) => r.status === "Presente").length;

    const queueRecord: QueueRecord = {
      uuid: batchUuid,
      timestamp: new Date().toISOString(),
      entity: "asistencia",
      action: "UPDATE",
      studentName: `Asistencia ${groupName} (${records.length} estudiantes)`,
      description: `Jornada ${sessionDate} · ${presentCount} presentes de ${records.length}`,
      payload: {
        date: sessionDate,
        group: groupName,
        total: records.length,
        records: records.map((r) => ({
          studentId: r.studentId,
          studentName: r.studentName,
          status: r.status,
        })),
      },
      status: online ? "synced" : "pending",
      createdByRole: role || "Docente",
    };

    if (!online) {
      await storeLocalRecord(queueRecord).catch(console.error);
      setQueue((prev) => [...prev, queueRecord]);
    } else {
      setHistory((prev) => [queueRecord, ...prev]);
    }
  };

  // Grades Update: 1 atomic transaction for the period grades
  const handleUpdateGrades = async (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
    const transactionUuid = crypto.randomUUID();

    const queueRecord: QueueRecord = {
      uuid: transactionUuid,
      timestamp: new Date().toISOString(),
      entity: "calificacion",
      action: "UPDATE",
      studentName: "Planilla de Calificaciones",
      description: `Actualización de notas del periodo (${updatedStudents.length} estudiantes)`,
      payload: {
        totalStudents: updatedStudents.length,
        timestamp: new Date().toISOString(),
      },
      status: online ? "synced" : "pending",
      createdByRole: role || "Docente",
    };

    if (!online) {
      await storeLocalRecord(queueRecord).catch(console.error);
      setQueue((prev) => [...prev, queueRecord]);
    } else {
      setHistory((prev) => [queueRecord, ...prev]);
    }
  };

  // Observations Add
  const handleAddObservation = async (obsData: Omit<ObservationRecord, "id" | "synced">) => {
    const obsUuid = crypto.randomUUID();
    const newObs: ObservationRecord = {
      ...obsData,
      id: obsUuid,
      synced: online,
    };

    setObservations((prev) => [newObs, ...prev]);

    const queueRecord: QueueRecord = {
      uuid: obsUuid,
      timestamp: new Date().toISOString(),
      entity: "observacion",
      action: "CREATE",
      studentName: obsData.studentName,
      description: `Observación ${obsData.type}: ${obsData.title}`,
      payload: {
        studentId: obsData.studentId,
        date: obsData.date,
        type: obsData.type,
        title: obsData.title,
        detail: obsData.detail,
        teacher: obsData.teacher,
      },
      status: online ? "synced" : "pending",
      createdByRole: role || "Docente",
    };

    if (!online) {
      await storeLocalRecord(queueRecord).catch(console.error);
      setQueue((prev) => [...prev, queueRecord]);
    } else {
      setHistory((prev) => [queueRecord, ...prev]);
    }
  };

  // If user is not logged in, show Login page
  if (!role) {
    return <Login onLogin={(selectedRole) => setRole(selectedRole)} />;
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Top Header */}
      <Topbar
        currentRole={role}
        onRoleChange={(newRole) => setRole(newRole)}
        online={online}
        onToggleOnline={handleToggleOnline}
        pendingCount={userQueue.length}
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        onOpenQueue={() => setQueueDrawerOpen(true)}
        onToggleSidebar={handleToggleSidebar}
        onToggleMobileMenu={handleToggleSidebar}
      />

      {/* Left Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        pendingCount={userQueue.length}
        currentRole={role}
        onOpenHelp={() => setHelpOpen(true)}
        onLogout={() => {
          setRole(null);
          setCurrentView("resumen");
        }}
        onOpenQueue={() => setQueueDrawerOpen(true)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Dashboard Workspace */}
      <main className="dashboard-content">
        {/* Sync Success Banner */}
        {syncSuccessBanner && (
          <div className="feedback-banner success mb-6">
            <span className="p-1 rounded-full bg-emerald-600 text-white">
              <Icon name="check" size={20} />
            </span>
            <div className="flex-1">
              <strong className="text-base font-bold text-emerald-950 block">
                ¡Sincronización automática por lote completada con éxito!
              </strong>
              <p className="text-sm font-semibold text-emerald-900 mt-0.5">
                Integridad de datos: <strong>100%</strong> · Latencia local: <strong>185 ms</strong>{" "}
                (Meta &lt; 300 ms) · Tiempo de lote: <strong>3,4 s</strong> (Meta ≤ 10,0 s)
              </p>
            </div>
            <button
              onClick={() => setSyncSuccessBanner(false)}
              className="text-emerald-800 hover:text-emerald-950 p-1"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        )}

        {/* Dynamic View Rendering */}
        {currentView === "resumen" && (
          <ResumenView
            students={students}
            attendanceList={attendanceList}
            queue={userQueue}
            history={userHistory}
            online={online}
            currentRole={role}
            onNavigate={(v) => setCurrentView(v)}
          />
        )}

        {currentView === "asistencia" && (
          <AsistenciaView
            students={students}
            attendanceList={attendanceList}
            onSaveAttendance={handleSaveAttendance}
            currentRole={role}
            online={online}
          />
        )}

        {currentView === "calificaciones" && (
          <CalificacionesView
            students={students}
            onUpdateGrades={handleUpdateGrades}
            currentRole={role}
            online={online}
          />
        )}

        {currentView === "actividades" && (
          <ActividadesView
            activities={activities}
            studyMaterials={studyMaterials}
            courseGroups={courseGroups}
            currentRole={role}
            currentStudentId={currentStudentId}
            submissions={submissions}
            forumPosts={forumPosts}
            onToggleCompleteActivity={handleToggleCompleteActivity}
            onAddActivity={handleAddActivity}
            onAddMaterial={handleAddMaterial}
            onAddSubmission={handleAddSubmission}
            onGradeSubmission={handleGradeSubmission}
            onAddForumPost={handleAddForumPost}
          />
        )}

        {currentView === "cursos" && (
          <CursosGruposView
            courseGroups={courseGroups}
            students={students}
            teachers={teachers}
            currentRole={role}
            onAddGroup={handleAddGroup}
            onEnrollStudent={handleEnrollStudent}
          />
        )}

        {currentView === "observaciones" && (
          <ObservacionesView
            students={students}
            observations={observations}
            onAddObservation={handleAddObservation}
            currentRole={role}
            online={online}
          />
        )}

        {currentView === "estudiantes" && (
          <EstudiantesView
            students={students}
            courseGroups={courseGroups}
            currentRole={role}
            currentStudentId={currentStudentId}
            onSelectStudentForBulletin={() => setCurrentView("boletines")}
            onCreateStudent={handleCreateStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}

        {currentView === "boletines" && <BoletinesView students={students} currentRole={role} />}

        {currentView === "cola" && (
          <ColaSyncView
            queue={userQueue}
            history={userHistory}
            online={online}
            onToggleOnline={handleToggleOnline}
            onForceSync={handleForceSync}
            isSyncing={isSyncing}
            onClearHistory={() => setHistory([])}
            currentRole={role}
          />
        )}
      </main>

      {/* Global Quick Help Modal */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Technical Queue Drawer (Slides in on the right) */}
      <QueueDrawer
        isOpen={queueDrawerOpen}
        onClose={() => setQueueDrawerOpen(false)}
        queue={userQueue}
        history={userHistory}
        online={online}
        onToggleOnline={handleToggleOnline}
        onForceSync={handleForceSync}
        isSyncing={isSyncing}
        onClearHistory={() => setHistory([])}
        currentRole={role}
      />
    </div>
  );
}
