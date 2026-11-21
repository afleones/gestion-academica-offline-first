import { Role, View } from "../types";
import { Icon, IconName } from "../icons";

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  pendingCount: number;
  currentRole: Role;
  onOpenHelp: () => void;
  onLogout: () => void;
  onOpenQueue: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  currentView,
  onNavigate,
  pendingCount,
  currentRole,
  onOpenHelp,
  onLogout,
  onOpenQueue,
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const isStudent = currentRole === "Estudiante";
  const isAdmin = currentRole === "Administrativo";
  const isAcudiente = currentRole === "Acudiente";

  const navItems: { id: View; label: string; icon: IconName; badge?: number }[] = isStudent
    ? [
        { id: "resumen", label: "Resumen Personal", icon: "home" },
        { id: "actividades", label: "Mis Tareas y Guías", icon: "clipboard" },
        { id: "asistencia", label: "Mi Asistencia", icon: "calendar" },
        { id: "calificaciones", label: "Mis Calificaciones", icon: "grade" },
        { id: "cursos", label: "Mi Grupo (9° A)", icon: "folder" },
        { id: "observaciones", label: "Mi Observador", icon: "note" },
        { id: "estudiantes", label: "Mi Ficha de Matrícula", icon: "team" },
        { id: "boletines", label: "Mi Boletín Oficial", icon: "report" },
      ]
    : isAcudiente
      ? [
          { id: "resumen", label: "Resumen Familiar", icon: "home" },
          { id: "actividades", label: "Tareas de mi Acudido", icon: "clipboard" },
          { id: "asistencia", label: "Asistencia de mi Acudido", icon: "calendar" },
          { id: "calificaciones", label: "Calificaciones", icon: "grade" },
          { id: "observaciones", label: "Observaciones", icon: "note" },
          { id: "estudiantes", label: "Ficha de mi Acudido", icon: "team" },
          { id: "boletines", label: "Boletín Oficial", icon: "report" },
        ]
      : isAdmin
        ? [
            { id: "resumen", label: "Panel Ejecutivo", icon: "home" },
            { id: "asistencia", label: "Asistencia", icon: "calendar" },
            { id: "calificaciones", label: "Calificaciones", icon: "grade" },
            { id: "actividades", label: "Tareas y Materiales", icon: "clipboard" },
            { id: "cursos", label: "Cursos y Grupos", icon: "folder" },
            { id: "observaciones", label: "Observaciones", icon: "note" },
            { id: "estudiantes", label: "Estudiantes (CRUD)", icon: "team" },
            { id: "boletines", label: "Boletines", icon: "report" },
            {
              id: "cola",
              label: "Cola de Sincronización",
              icon: "queue",
              badge: pendingCount,
            },
          ]
        : /* Docente */
          [
            { id: "resumen", label: "Resumen", icon: "home" },
            { id: "asistencia", label: "Asistencia", icon: "calendar" },
            { id: "calificaciones", label: "Calificaciones", icon: "grade" },
            { id: "actividades", label: "Tareas y Materiales", icon: "clipboard" },
            { id: "cursos", label: "Cursos y Grupos", icon: "folder" },
            { id: "observaciones", label: "Observaciones", icon: "note" },
            { id: "boletines", label: "Boletines", icon: "report" },
          ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="mobile-sidebar-overlay lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Mobile header inside drawer */}
        <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-200 mb-2">
          <strong className="text-base font-bold text-slate-900">Menú EduAtlántico</strong>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900"
            aria-label="Cerrar menú"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-title">MENÚ PRINCIPAL</span>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                title={item.label}
                onClick={() => {
                  if (item.id === "cola") {
                    onOpenQueue();
                  } else {
                    onNavigate(item.id);
                  }
                  onCloseMobile?.();
                }}
              >
                <Icon name={item.icon} size={22} />
                <span className="sidebar-label">{item.label}</span>
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className="sidebar-counter">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <span className="sidebar-section-title">SISTEMA</span>
          <button
            className="sidebar-link"
            title="Centro de ayuda"
            onClick={() => {
              onOpenHelp();
              onCloseMobile?.();
            }}
          >
            <Icon name="help" size={22} />
            <span className="sidebar-label">Centro de ayuda</span>
          </button>

          <button
            className="sidebar-link logout-link"
            title="Cerrar sesión"
            onClick={() => {
              onLogout();
              onCloseMobile?.();
            }}
          >
            <Icon name="logout" size={22} />
            <span className="sidebar-label">Cerrar sesión</span>
          </button>

          <div className="sidebar-role-indicator">
            <div className="flex items-center gap-2">
              <span className="text-emerald-700">
                <Icon name="shield" size={18} />
              </span>
              <div className="flex flex-col">
                <strong className="text-slate-900 text-sm font-bold">
                  Rol: {currentRole}
                </strong>
                <small className="text-slate-700 text-xs font-semibold">
                  Almacenamiento Offline Seguro
                </small>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
