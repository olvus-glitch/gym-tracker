'use client';

import { useState, useMemo } from 'react';
import CalendarioDia from './CalendarioDia';
import EjercicioCard from './EjercicioCard';
import EjercicioForm from './EjercicioForm';
import CompartirModal from './CompartirModal';
import PlantillaSelector from './PlantillaSelector';
import PlantillaEditor from './PlantillaEditor';
import ResumenWidget from './ResumenWidget';
import CardioForm from './cardio/CardioForm';
import CardioList from './cardio/CardioList';
import { useSesiones, useCompartidas, usePlantillas } from '../lib/store';
import { fechaAString, obtenerDiasSemana } from '../lib/fechas';
import type { Ejercicio, GrupoMuscular, Plantilla } from '../lib/types';
import { useCardio } from '@/lib/hooks/useCardio';

export default function EntrenamientosPage() {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [mostrarForm, setMostrarForm] = useState(false);
  const [ejercicioEditando, setEjercicioEditando] = useState<Ejercicio | null>(null);
  const [confirmEliminar, setConfirmEliminar] = useState<string | null>(null);
  const [mostrarCompartir, setMostrarCompartir] = useState(false);
  const [mostrarPlantillas, setMostrarPlantillas] = useState(false);
  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [mostrarCardioForm, setMostrarCardioForm] = useState(false);

  const [confirmLimpiar, setConfirmLimpiar] = useState(false);

  const {
    cargado,
    sesiones,
    obtenerSesionPorFecha,
    agregarEjercicio,
    editarEjercicio,
    eliminarEjercicio,
    aplicarPlantillaASemana,
    limpiarSemana,
    toggleCompletada,
  } = useSesiones();

  const { plantillas, agregarPlantilla, eliminarPlantilla } = usePlantillas();

  const { crearEnlace } = useCompartidas();
  const { cardio, agregarCardio, eliminarCardio } = useCardio();

  const sesion = useMemo(
    () => obtenerSesionPorFecha(fechaActual),
    [fechaActual, obtenerSesionPorFecha]
  );

  const ejerciciosAgrupados = useMemo(() => {
    if (!sesion) return {};
    const agrupados: Partial<Record<GrupoMuscular, Ejercicio[]>> = {};
    for (const ej of sesion.ejercicios) {
      if (!agrupados[ej.grupoMuscular]) {
        agrupados[ej.grupoMuscular] = [];
      }
      agrupados[ej.grupoMuscular]!.push(ej);
    }
    return agrupados;
  }, [sesion]);

  // Records personales para marcar PRs
  const recordsPersonales = useMemo(() => {
    const prs: Record<string, { peso: number; unidad: string }> = {};
    for (const s of sesiones) {
      for (const e of s.ejercicios) {
        if (!e.peso) continue;
        const pesoKg = e.unidad === 'lbs' ? e.peso * 0.4536 : e.peso;
        const existing = prs[e.nombre];
        const existingKg = existing ? (existing.unidad === 'lbs' ? existing.peso * 0.4536 : existing.peso) : 0;
        if (!existing || pesoKg > existingKg) {
          prs[e.nombre] = { peso: e.peso, unidad: e.unidad };
        }
      }
    }
    return prs;
  }, [sesiones]);

  const esRecordPersonal = (ej: Ejercicio): boolean => {
    if (!ej.peso) return false;
    const pr = recordsPersonales[ej.nombre];
    if (!pr) return false;
    return ej.peso === pr.peso && ej.unidad === pr.unidad;
  };

  // Dias de la semana actual marcados como completados
  const diasEntrenados = useMemo(() => {
    const dias = obtenerDiasSemana(fechaActual);
    const fechasSemana = new Set(dias.map(fechaAString));
    const entrenados = new Set<string>();
    for (const s of sesiones) {
      if (fechasSemana.has(s.fecha) && s.completada) {
        entrenados.add(s.fecha);
      }
    }
    return entrenados;
  }, [sesiones, fechaActual]);

  const handleGuardar = (data: Omit<Ejercicio, 'id'> & { id?: string }) => {
    if (data.id) {
      editarEjercicio(fechaActual, data as Ejercicio);
    } else {
      agregarEjercicio(fechaActual, data);
    }
    setMostrarForm(false);
    setEjercicioEditando(null);
  };

  const handleEditar = (ej: Ejercicio) => {
    setEjercicioEditando(ej);
    setMostrarForm(true);
  };

  const handleEliminar = (id: string) => {
    if (confirmEliminar === id) {
      eliminarEjercicio(fechaActual, id);
      setConfirmEliminar(null);
    } else {
      setConfirmEliminar(id);
      setTimeout(() => setConfirmEliminar(null), 3000);
    }
  };

  const handleToggleRealizado = (ejercicio: Ejercicio) => {
    editarEjercicio(fechaActual, {
      ...ejercicio,
      realizado: !ejercicio.realizado,
    });
  };

  const handleCompartir = () => {
    setMostrarCompartir(true);
  };

  const handleAplicarPlantilla = (plantilla: Plantilla) => {
    aplicarPlantillaASemana(plantilla, fechaActual);
    setMostrarPlantillas(false);
  };

  const handleGuardarPlantilla = (data: Omit<Plantilla, 'id'> & { id?: string }) => {
    agregarPlantilla(data);
    setMostrarEditor(false);
    setMostrarPlantillas(true);
  };

  const cardioDelDia = useMemo(() => {
    const date = fechaAString(fechaActual);
    return cardio.filter((c) => c.date === date);
  }, [cardio, fechaActual]);

  if (!cargado) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResumenWidget />
      <CalendarioDia
        fecha={fechaActual}
        onCambiarFecha={setFechaActual}
        diasEntrenados={diasEntrenados}
        completada={sesion?.completada ?? false}
        onToggleCompletada={() => toggleCompletada(fechaActual)}
      />

      {/* Lista de ejercicios agrupados */}
      {sesion && sesion.ejercicios.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(ejerciciosAgrupados).map(([grupo, ejercicios]) => (
            <div key={grupo}>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 px-1">
                {grupo}
              </h3>
              <div className="space-y-2">
                {ejercicios!.map((ej) => (
                  <div key={ej.id} className="relative">
                    <EjercicioCard
                      ejercicio={ej}
                      esPR={esRecordPersonal(ej)}
                      onEditar={handleEditar}
                      onEliminar={handleEliminar}
                      onToggleRealizado={handleToggleRealizado}
                    />
                    {confirmEliminar === ej.id && (
                      <div className="absolute inset-0 bg-danger/95 rounded-lg flex items-center justify-center gap-3 text-white text-sm font-medium">
                        <span>¿Eliminar?</span>
                        <button
                          onClick={() => handleEliminar(ej.id)}
                          className="bg-card-bg text-danger px-3 py-1 rounded-md text-xs font-bold"
                        >
                          Sí, eliminar
                        </button>
                        <button
                          onClick={() => setConfirmEliminar(null)}
                          className="bg-white/20 px-3 py-1 rounded-md text-xs"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !mostrarForm && (
          <div className="text-center py-12 text-text-muted">
            <p className="text-4xl mb-3">🏋️</p>
            <p className="text-sm">No hay ejercicios para este día</p>
            <p className="text-xs mt-1">Agrega uno para empezar</p>
          </div>
        )
      )}

      {/* Formulario */}
      {mostrarForm ? (
        <EjercicioForm
          ejercicio={ejercicioEditando}
          onGuardar={handleGuardar}
          onCancelar={() => {
            setMostrarForm(false);
            setEjercicioEditando(null);
          }}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEjercicioEditando(null);
                setMostrarForm(true);
              }}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> Agregar ejercicio
            </button>
            {sesion && sesion.ejercicios.length > 0 && (
              <button
                onClick={handleCompartir}
                className="py-3 px-4 rounded-xl bg-card-bg border border-border text-sm font-medium text-text-muted hover:bg-hover-bg transition-colors"
                title="Compartir rutina del día"
              >
                🔗
              </button>
            )}
          </div>
          <button
            onClick={() => setMostrarCardioForm((prev) => !prev)}
            className="w-full py-2.5 rounded-xl border border-cyan-500/40 text-sm font-medium text-cyan-600 hover:bg-cyan-500/10 transition-colors"
          >
            {mostrarCardioForm ? 'Cerrar cardio' : 'Agregar cardio'}
          </button>

          {mostrarCardioForm && (
            <CardioForm
              date={fechaAString(fechaActual)}
              onCancelar={() => setMostrarCardioForm(false)}
              onGuardar={async (payload) => {
                await agregarCardio(payload);
                setMostrarCardioForm(false);
              }}
            />
          )}

          <div className="space-y-2">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Cardio del dia</p>
            <CardioList sessions={cardioDelDia} onDelete={eliminarCardio} />
          </div>

          <button
            onClick={() => setMostrarPlantillas(true)}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-sm font-medium text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
          >
            Aplicar plantilla a la semana
          </button>
          {sesion && sesion.ejercicios.length > 0 && (
            <button
              onClick={() => {
                if (confirmLimpiar) {
                  limpiarSemana(fechaActual);
                  setConfirmLimpiar(false);
                } else {
                  setConfirmLimpiar(true);
                  setTimeout(() => setConfirmLimpiar(false), 3000);
                }
              }}
              className={`w-full py-2 rounded-xl text-xs font-medium transition-colors ${
                confirmLimpiar
                  ? 'bg-danger text-white'
                  : 'border border-danger/30 text-danger hover:bg-danger/5'
              }`}
            >
              {confirmLimpiar ? 'Confirmar: borrar ejercicios de la semana' : 'Limpiar semana'}
            </button>
          )}
        </div>
      )}

      {/* Modal compartir */}
      {mostrarCompartir && sesion && (
        <CompartirModal
          ejercicios={sesion.ejercicios}
          onCerrar={() => setMostrarCompartir(false)}
          crearEnlace={crearEnlace}
        />
      )}

      {/* Modal selector de plantilla */}
      {mostrarPlantillas && (
        <PlantillaSelector
          plantillas={plantillas}
          onAplicar={handleAplicarPlantilla}
          onEliminar={eliminarPlantilla}
          onCerrar={() => setMostrarPlantillas(false)}
          onIrEditor={() => {
            setMostrarPlantillas(false);
            setMostrarEditor(true);
          }}
        />
      )}

      {/* Modal editor de plantilla */}
      {mostrarEditor && (
        <PlantillaEditor
          onGuardar={handleGuardarPlantilla}
          onCerrar={() => {
            setMostrarEditor(false);
            setMostrarPlantillas(true);
          }}
        />
      )}
    </div>
  );
}
