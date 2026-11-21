import { useState, useRef, useEffect } from "react";
import { Role, View } from "../types";
import { Icon } from "../icons";

interface TopbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  online: boolean;
  onToggleOnline: () => void;
  pendingCount: number;
  currentView: View;
  onNavigate: (view: View) => void;
  onOpenQueue: () => void;
  onToggleMobileMenu?: () => void;
  onToggleSidebar?: () => void;
}

export function Topbar({
  currentRole,
  onRoleChange,
  online,
  onToggleOnline,
  pendingCount,
  currentView,
  onNavigate,
  onOpenQueue,
  onToggleMobileMenu,
  onToggleSidebar,
}: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roles: {
    id: Role;
    label: string;
    description: string;
    badge: string;
    avatar: string;
  }[] = [
    {
      id: "Administrativo",
      label: "Administrativo / Directivo",
      description: "Acceso total: gestión académica, configuración y usuarios",
      badge: "Control Total",
      avatar: "AD",
    },
    {
      id: "Docente",
      label: "Docente Titular",
      description: "Edición activa: asistencia, notas y observaciones pedagógicas",
      badge: "Edición Activa",
      avatar: "DO",
    },
    {
      id: "Estudiante",
      label: "Estudiante (Ana Martínez)",
      description: "Modo solo lectura: consulta de notas personales y boletín",
      badge: "Solo Lectura",
      avatar: "ES",
    },
    {
      id: "Acudiente",
      label: "Acudiente (Carmen González Rocha)",
      description: "Modo solo lectura: seguimiento exclusivo de su acudida (Ana Martínez)",
      badge: "Solo Lectura",
      avatar: "AC",
    },
  ];

  const currentRoleInfo = roles.find((r) => r.id === currentRole) || roles[1];

  const handleToggleMenu = onToggleSidebar || onToggleMobileMenu;

  return (
    <header className="topbar">
      <div className="flex items-center gap-2 sm:gap-3">
        {handleToggleMenu && (
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={handleToggleMenu}
            aria-label="Alternar menú lateral"
            title="Colapsar / Expandir barra lateral"
          >
            <Icon name="menu" size={24} />
          </button>
        )}
        <div
          className="brand-lockup cursor-pointer"
          onClick={() => onNavigate("resumen")}
          title="Ir al Resumen Principal"
        >
          <span className="brand-mark">
            <Icon name="academy" size={26} />
          </span>
          <span className="brand-text">
            <strong className="text-slate-900 text-lg sm:text-xl font-bold tracking-tight">EduAtlántico</strong>
            <small className="hidden md:block text-slate-700 text-sm font-medium">
              Gestión Académica Offline-First
            </small>
          </span>
        </div>
      </div>

      <div className="top-actions">
        {/* Connection status pill */}
        <div
          className={`connection-pill ${online ? "is-online" : "is-offline"}`}
          onClick={onToggleOnline}
          role="button"
          tabIndex={0}
          title="Haz clic para alternar entre Modo Online y Offline"
        >
          <Icon name={online ? "wifi" : "cloudOff"} size={22} />
          <div className="connection-pill-text">
            <strong>{online ? "Modo Online" : "Modo Offline"}</strong>
            <small>
              {online ? "Conectado al servidor central" : "Operando en IndexedDB local"}
            </small>
          </div>
          <button
            type="button"
            className={`toggle ${online ? "on" : ""}`}
            aria-label="Alternar modo de conexión"
          >
            <i />
          </button>
        </div>

        {/* Sync queue quick access (Admin only) */}
        {currentRole === "Administrativo" && (
          <button
            className="queue-counter-btn"
            onClick={onOpenQueue}
            title="Ver cola de transacciones IndexedDB a la derecha"
          >
            <span className="queue-icon-wrap">
              <Icon name="database" size={20} />
            </span>
            <div className="queue-text">
              <strong>Cola Local</strong>
              <small>IndexedDB</small>
            </div>
            <span className={`queue-badge ${pendingCount > 0 ? "has-pending" : ""}`}>
              {pendingCount}
            </span>
          </button>
        )}

        {/* RBAC Role Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className={`profile-selector-btn ${dropdownOpen ? "is-active" : ""}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <span className="profile-avatar">{currentRoleInfo.avatar}</span>
            <div className="profile-info text-left">
              <div className="flex items-center gap-1.5">
                <strong className="text-slate-900 text-base font-bold">{currentRole}</strong>
                <span className="role-chip">{currentRoleInfo.badge}</span>
              </div>
              <small className="text-slate-700 text-sm font-semibold">Cambiar rol (RBAC)</small>
            </div>
            <Icon
              name="chevron"
              size={18}
              className={`transition-transform duration-200 ${dropdownOpen ? "rotate-90" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="rbac-dropdown-menu">
              <div className="rbac-dropdown-header">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Control de Acceso (RBAC en Vivo)
                </span>
                <p className="text-xs text-slate-700 mt-0.5">
                  Selecciona un perfil para simular la experiencia en tiempo real:
                </p>
              </div>

              <div className="rbac-options-list">
                {roles.map((r) => {
                  const isSelected = r.id === currentRole;
                  return (
                    <button
                      key={r.id}
                      className={`rbac-option-item ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        onRoleChange(r.id);
                        setDropdownOpen(false);
                      }}
                    >
                      <span className="rbac-item-avatar">{r.avatar}</span>
                      <div className="rbac-item-content">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 text-base font-bold">{r.label}</strong>
                          {isSelected && (
                            <span className="selected-check">
                              <Icon name="check" size={16} /> Activo
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 text-sm mt-0.5">{r.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rbac-dropdown-footer">
                <Icon name="shield" size={16} />
                <span>Cumple con el modelo de seguridad por roles y Ley 1581 de 2012</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
