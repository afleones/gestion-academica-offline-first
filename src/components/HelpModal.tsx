import { Icon } from "../icons";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="help-modal-card" role="dialog" aria-modal="true" aria-labelledby="help-title">
        <header className="help-modal-header">
          <div className="flex items-center gap-3">
            <span className="help-modal-icon">
              <Icon name="help" size={26} />
            </span>
            <div>
              <h2 id="help-title" className="text-2xl font-bold text-slate-900 leading-tight">
                Centro de Ayuda y Guía Offline-First
              </h2>
              <p className="text-base text-slate-700">
                Plataforma Institucional EduAtlántico · Departamento del Atlántico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900"
            aria-label="Cerrar modal"
          >
            <Icon name="close" size={24} />
          </button>
        </header>

        <div className="help-modal-body">
          <div className="help-section">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Icon name="cloudOff" size={22} className="text-amber-700" />
              ¿Cómo funciona la tecnología Offline-First en las escuelas?
            </h3>
            <p className="text-base text-slate-700 leading-relaxed mt-2">
              EduAtlántico está diseñado específicamente para los municipios y veredas del Atlántico
              donde la energía eléctrica o la conexión a internet pueden interrumpirse. Utiliza el
              motor local <strong className="text-slate-900 font-bold">IndexedDB</strong> en el
              navegador del docente o directivo, permitiendo registrar asistencias, notas y
              observaciones de manera inmediata con tiempos de respuesta inferiores a 200 ms.
            </p>
          </div>

          <div className="help-grid mt-4">
            <div className="help-card">
              <span className="help-card-badge">ETAPA 1</span>
              <h4 className="text-lg font-bold text-slate-900 mt-2">Sin pérdida de datos</h4>
              <p className="text-base text-slate-700 mt-1">
                Cada registro genera un paquete con identificador único{" "}
                <strong className="text-slate-900">UUID v4</strong> y marca de tiempo ISO. Nunca
                perderás notas ni asistencias ante un corte de energía.
              </p>
            </div>

            <div className="help-card">
              <span className="help-card-badge">ETAPA 2</span>
              <h4 className="text-lg font-bold text-slate-900 mt-2">Validación previa estricta</h4>
              <p className="text-base text-slate-700 mt-1">
                El sistema valida que las calificaciones estén entre{" "}
                <strong className="text-slate-900">0.0 y 5.0</strong> y bloquea asistencias
                duplicadas en la misma fecha antes de almacenar, garantizando 100% de integridad.
              </p>
            </div>

            <div className="help-card">
              <span className="help-card-badge">ETAPA 3</span>
              <h4 className="text-lg font-bold text-slate-900 mt-2">Sincronización automática</h4>
              <p className="text-base text-slate-700 mt-1">
                Al restablecerse la conectividad (Modo Online), la cola de IndexedDB se envía en
                lotes en menos de 4 segundos sin congelar la pantalla del usuario.
              </p>
            </div>

            <div className="help-card">
              <span className="help-card-badge">ETAPA 4</span>
              <h4 className="text-lg font-bold text-slate-900 mt-2">
                Protección de Datos (Ley 1581)
              </h4>
              <p className="text-base text-slate-700 mt-1">
                La información de menores y familias cuenta con consentimiento informado digital y
                control de acceso basado en roles (RBAC) para Docentes, Directivos, Estudiantes y
                Acudientes.
              </p>
            </div>
          </div>

          <div className="help-faq mt-5">
            <h4 className="text-lg font-bold text-slate-900">Preguntas Frecuentes</h4>
            <div className="faq-item mt-2">
              <strong className="text-base font-bold text-slate-900">
                ¿Puedo imprimir un boletín estando sin internet?
              </strong>
              <p className="text-base text-slate-700 mt-0.5">
                Sí. Toda la información académica está precalculada en la memoria local. La vista de
                boletín se genera localmente y está lista para impresión directa o exportación a
                PDF.
              </p>
            </div>
            <div className="faq-item mt-3">
              <strong className="text-base font-bold text-slate-900">
                ¿Qué hago si veo registros pendientes en la cola?
              </strong>
              <p className="text-base text-slate-700 mt-0.5">
                No te preocupes: están seguros en tu navegador. Cuando tengas internet, activa el
                botón de &quot;Modo Online&quot; o presiona &quot;Forzar sincronización&quot; en la
                vista de Cola.
              </p>
            </div>
          </div>
        </div>

        <footer className="help-modal-footer">
          <button className="primary-btn px-6 py-2.5 text-base" onClick={onClose}>
            Entendido, volver a la aplicación
          </button>
        </footer>
      </div>
    </div>
  );
}
