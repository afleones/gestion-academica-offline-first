import { useState } from "react";
import { Role } from "../types";
import { Icon, IconName } from "../icons";

interface LoginProps {
  onLogin: (role: Role) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<Role>("Docente");
  const [email, setEmail] = useState("docente@institucionatlantico.edu.co");

  const roles: {
    id: Role;
    label: string;
    detail: string;
    icon: IconName;
    badge: string;
  }[] = [
    {
      id: "Administrativo",
      label: "Administrativo / Directivo",
      detail: "Acceso total, configuración y directores",
      icon: "shield",
      badge: "Control Total",
    },
    {
      id: "Docente",
      label: "Docente Titular",
      detail: "Registro de asistencia, notas y observaciones",
      icon: "team",
      badge: "Edición Activa",
    },
    {
      id: "Estudiante",
      label: "Estudiante",
      detail: "Consulta personal de notas y boletines",
      icon: "book",
      badge: "Solo Lectura",
    },
    {
      id: "Acudiente",
      label: "Acudiente / Familia",
      detail: "Seguimiento académico de su acudido",
      icon: "user",
      badge: "Solo Lectura",
    },
  ];

  const handleRoleSelect = (selectedId: Role) => {
    setRole(selectedId);
    if (selectedId === "Administrativo") {
      setEmail("rectoria@institucionatlantico.edu.co");
    } else if (selectedId === "Docente") {
      setEmail("docente@institucionatlantico.edu.co");
    } else if (selectedId === "Estudiante") {
      setEmail("ana.martinez@estudiante.edu.co");
    } else {
      setEmail("familia.rodriguez@correo.com");
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-lockup brand-lockup-light">
          <span className="brand-mark">
            <Icon name="academy" size={30} />
          </span>
          <span className="flex flex-col">
            <strong className="text-2xl font-black tracking-tight text-white">EduAtlántico</strong>
            <small className="text-base text-blue-100 font-medium mt-0.5">
              Gestión Académica Escolar Offline-First
            </small>
          </span>
        </div>

        <div className="brand-message">
          <span className="eyebrow">PLATAFORMA INSTITUCIONAL</span>
          <h1>
            La escuela continúa,
            <br />
            con o sin conexión.
          </h1>
          <p>
            Gestión académica confiable para instituciones educativas del Atlántico, diseñada para
            responder de inmediato en contextos de conectividad intermitente y cortes de energía.
          </p>

          <div className="feature-list">
            <span>
              <Icon name="check" size={20} /> Asistencia, calificaciones y boletines en un solo
              lugar
            </span>
            <span>
              <Icon name="check" size={20} /> Almacenamiento local seguro en IndexedDB (Latencia
              &lt; 200 ms)
            </span>
            <span>
              <Icon name="check" size={20} /> Sincronización automática por lotes al volver a Modo
              Online
            </span>
            <span>
              <Icon name="check" size={20} /> Protección de datos de menores (Ley 1581 de 2012)
            </span>
          </div>
        </div>

        <p className="brand-foot">
          © 2025 EduAtlántico · Gobernación del Atlántico · Secretaría de Educación
        </p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-brand brand-lockup mb-6">
            <span className="brand-mark">
              <Icon name="academy" size={28} />
            </span>
            <span className="flex flex-col">
              <strong className="text-2xl font-black text-slate-900">EduAtlántico</strong>
              <small className="text-base text-slate-700">Gestión Académica Escolar</small>
            </span>
          </div>

          <span className="eyebrow blue">ACCESO SEGURO INSTITUCIONAL</span>
          <h2>Iniciar Sesión Escolar</h2>
          <p className="muted">Selecciona tu perfil institucional del Departamento del Atlántico</p>

          <label className="form-label">SELECCIONA TU PERFIL DE ACCESO (RBAC)</label>
          <div className="role-grid">
            {roles.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`role-card ${role === item.id ? "selected" : ""}`}
                onClick={() => handleRoleSelect(item.id)}
              >
                <span className="role-icon">
                  <Icon name={item.icon} size={24} />
                </span>
                <span className="flex-1">
                  <div className="flex items-center justify-between">
                    <strong>{item.label}</strong>
                    <span className="role-badge-mini">{item.badge}</span>
                  </div>
                  <small>{item.detail}</small>
                </span>
                <i>{role === item.id && <Icon name="check" size={14} />}</i>
              </button>
            ))}
          </div>

          <label className="form-label" htmlFor="email">
            CORREO INSTITUCIONAL O USUARIO
          </label>
          <div className="input-wrap">
            <Icon name="user" size={20} />
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-base font-semibold"
            />
          </div>

          <div className="password-row mt-4">
            <label className="form-label" htmlFor="password">
              CONTRASEÑA
            </label>
            <button type="button" className="text-sm font-bold text-blue-700 hover:underline">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="input-wrap">
            <Icon name="lock" size={20} />
            <input
              id="password"
              type="password"
              defaultValue="academia2025"
              className="text-base font-semibold"
            />
          </div>

          <button className="primary-btn login-btn" onClick={() => onLogin(role)}>
            <span>Ingresar a EduAtlántico ({role})</span>
            <Icon name="arrow" size={20} />
          </button>

          <div className="security-badge" role="status">
            <span className="text-emerald-700">
              <Icon name="shield" size={22} />
            </span>
            <p>
              <strong>Sesión cifrada localmente · RBAC Activo</strong>
              <small>Protección de datos conforme a la Ley 1581 de 2012</small>
            </p>
            <i>ACTIVO</i>
          </div>

          <p className="support-link">
            <Icon name="help" size={18} /> ¿Necesitas ayuda con tu cuenta?{" "}
            <button type="button" className="font-bold underline">
              Contactar a soporte técnico
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
