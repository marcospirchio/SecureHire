"use client"

import { useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import type { OfertaTrabajo, CampoFormulario, Formulario } from "@/types/ofertas"
import type { Candidato } from "@/types/candidato"

export function useOfertas(ofertasIniciales: OfertaTrabajo[]) {
  const [ofertas, setOfertas] = useState<OfertaTrabajo[]>(ofertasIniciales)
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<OfertaTrabajo | null>(null)
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<Candidato | null>(null)
  const [mostrarSoloExcluyentes, setMostrarSoloExcluyentes] = useState(false)
  const [ordenarPor, setOrdenarPor] = useState<string | null>(null)
  const [mostrarDialogoNuevaOferta, setMostrarDialogoNuevaOferta] = useState(false)
  const [mostrarDialogoFormulario, setMostrarDialogoFormulario] = useState(false)
  const [busquedaOfertas, setBusquedaOfertas] = useState("")
  const [busquedaCandidatos, setBusquedaCandidatos] = useState("")

  // Paginación para ofertas
  const [paginaOfertas, setPaginaOfertas] = useState(1)
  const [ofertasPorPagina, setOfertasPorPagina] = useState(5)

  // Paginación para candidatos
  const [paginaCandidatos, setPaginaCandidatos] = useState(1)
  const [candidatosPorPagina, setCandidatosPorPagina] = useState(5)

  const { toast } = useToast()

  const crearNuevaOferta = (titulo: string, descripcion: string) => {
    if (!titulo.trim()) return

    const nuevaOfertaObj: OfertaTrabajo = {
      id: Date.now().toString(),
      titulo,
      descripcion,
      fechaCreacion: new Date(),
      formulario: null,
      candidatos: [],
    }

    setOfertas([...ofertas, nuevaOfertaObj])
    setMostrarDialogoNuevaOferta(false)
  }

  const guardarFormulario = (nombre: string, campos: CampoFormulario[]) => {
    if (!nombre.trim() || !ofertaSeleccionada) return

    const formularioFinal: Formulario = {
      id: Date.now().toString(),
      nombre,
      campos,
    }

    const ofertasActualizadas = ofertas.map((oferta) =>
      oferta.id === ofertaSeleccionada.id ? { ...oferta, formulario: formularioFinal } : oferta,
    )

    setOfertas(ofertasActualizadas)
    setOfertaSeleccionada({ ...ofertaSeleccionada, formulario: formularioFinal })
    setMostrarDialogoFormulario(false)
  }

  const ofertasFiltradas = useMemo(() => {
    if (!busquedaOfertas) return ofertas
    return ofertas.filter(
      (oferta) =>
        oferta.titulo.toLowerCase().includes(busquedaOfertas.toLowerCase()) ||
        oferta.descripcion.toLowerCase().includes(busquedaOfertas.toLowerCase()),
    )
  }, [ofertas, busquedaOfertas])

  const totalPaginasOfertas = useMemo(() => {
    return Math.max(1, Math.ceil(ofertasFiltradas.length / ofertasPorPagina))
  }, [ofertasFiltradas, ofertasPorPagina])

  const ofertasPaginadas = useMemo(() => {
    const startIndex = (paginaOfertas - 1) * ofertasPorPagina
    return ofertasFiltradas.slice(startIndex, startIndex + ofertasPorPagina)
  }, [ofertasFiltradas, paginaOfertas, ofertasPorPagina])

  const ordenarCandidatos = (candidatos: Candidato[], criterio: string) => {
    const candidatosFiltrados = [...candidatos]

    switch (criterio) {
      case "reputacion-asc":
        candidatosFiltrados.sort((a, b) => a.reputacion - b.reputacion)
        break
      case "reputacion-desc":
        candidatosFiltrados.sort((a, b) => b.reputacion - a.reputacion)
        break
      case "edad-asc":
        candidatosFiltrados.sort((a, b) => a.edad - b.edad)
        break
      case "edad-desc":
        candidatosFiltrados.sort((a, b) => b.edad - a.edad)
        break
      case "tiempo-respuesta":
        candidatosFiltrados.sort((a, b) => {
          const tiempoA = Number.parseInt(a.tiempoRespuesta.split(" ")[0])
          const tiempoB = Number.parseInt(b.tiempoRespuesta.split(" ")[0])
          return tiempoA - tiempoB
        })
        break
    }

    return candidatosFiltrados
  }

  const candidatosFiltrados = useMemo(() => {
    if (!ofertaSeleccionada) return []

    let candidatos = ofertaSeleccionada.candidatos

    if (mostrarSoloExcluyentes) {
      candidatos = candidatos.filter((c) => c.cumpleRequisitosExcluyentes)
    }

    if (busquedaCandidatos) {
      candidatos = candidatos.filter((c) =>
        (c.nombre + " " + (c.apellido || "")).toLowerCase().includes(busquedaCandidatos.toLowerCase()),
      )
    }

    if (ordenarPor) {
      candidatos = ordenarCandidatos(candidatos, ordenarPor)
    }

    return candidatos
  }, [ofertaSeleccionada, mostrarSoloExcluyentes, busquedaCandidatos, ordenarPor])

  const totalPaginasCandidatos = useMemo(() => {
    return Math.max(1, Math.ceil(candidatosFiltrados.length / candidatosPorPagina))
  }, [candidatosFiltrados, candidatosPorPagina])

  const candidatosPaginados = useMemo(() => {
    const startIndex = (paginaCandidatos - 1) * candidatosPorPagina
    return candidatosFiltrados.slice(startIndex, startIndex + candidatosPorPagina)
  }, [candidatosFiltrados, paginaCandidatos, candidatosPorPagina])

  const rechazarCandidato = (idCandidato: number) => {
    if (!ofertaSeleccionada) return

    const ofertasActualizadas = ofertas.map((oferta) =>
      oferta.id === ofertaSeleccionada.id
        ? {
            ...oferta,
            candidatos: oferta.candidatos.filter((candidato) => candidato.id !== idCandidato),
          }
        : oferta,
    )

    setOfertas(ofertasActualizadas)

    const ofertaActualizada = ofertasActualizadas.find((oferta) => oferta.id === ofertaSeleccionada.id)

    if (ofertaActualizada) {
      setOfertaSeleccionada(ofertaActualizada)
    }

    setCandidatoSeleccionado(null)

    toast({
      title: "Candidato rechazado",
      description: "El candidato ha sido eliminado de la lista.",
      variant: "destructive",
    })
  }

  const actualizarEstadoCandidato = (idCandidato: number, nuevoEstado: string, mensaje: string, notas?: string) => {
    if (!ofertaSeleccionada) return

    const ofertasActualizadas = ofertas.map((oferta) => {
      if (oferta.id === ofertaSeleccionada.id) {
        return {
          ...oferta,
          candidatos: oferta.candidatos.map((candidato) => {
            if (candidato.id === idCandidato) {
              const candidatoActualizado = {
                ...candidato,
                estado: nuevoEstado as any,
              }

              if (notas) {
                candidatoActualizado.entrevistas = [
                  ...candidato.entrevistas,
                  {
                    fecha: new Date(),
                    estado: nuevoEstado as any,
                    notas,
                  },
                ]
              }

              return candidatoActualizado
            }
            return candidato
          }),
        }
      }
      return oferta
    })

    setOfertas(ofertasActualizadas)

    const ofertaActualizada = ofertasActualizadas.find((oferta) => oferta.id === ofertaSeleccionada.id)
    if (ofertaActualizada) {
      setOfertaSeleccionada(ofertaActualizada)
      const candidatoActualizado = ofertaActualizada.candidatos.find((candidato) => candidato.id === idCandidato)
      if (candidatoActualizado) {
        setCandidatoSeleccionado(candidatoActualizado)
      }
    }

    toast({
      title: mensaje,
      description: candidatoSeleccionado
        ? `${mensaje} para ${candidatoSeleccionado.nombre}`
        : "Estado del candidato actualizado",
      variant: nuevoEstado === "No se presentó" ? "destructive" : "default",
    })
  }

  const confirmarEntrevista = () => {
    if (!candidatoSeleccionado) return
    actualizarEstadoCandidato(candidatoSeleccionado.id, "Entrevista confirmada", "Entrevista confirmada")
  }

  const marcarNoAsistio = () => {
    if (!candidatoSeleccionado) return
    actualizarEstadoCandidato(candidatoSeleccionado.id, "No se presentó", "Candidato no asistió")
  }

  const cancelarEntrevista = () => {
    if (!candidatoSeleccionado) return
    actualizarEstadoCandidato(
      candidatoSeleccionado.id,
      "Pendiente de confirmación",
      "Entrevista cancelada",
      "Entrevista anterior cancelada. Pendiente de reprogramación.",
    )
  }

  const contactarCandidato = () => {
    if (!candidatoSeleccionado) return

    toast({
      title: "Contactando candidato",
      description: `Se ha enviado un mensaje a ${candidatoSeleccionado.nombre}.`,
      variant: "default",
    })
  }

  // Cuando cambia el número de elementos por página, resetear a la primera página
  const cambiarOfertasPorPagina = (cantidad: number) => {
    setOfertasPorPagina(cantidad)
    setPaginaOfertas(1)
  }

  const cambiarCandidatosPorPagina = (cantidad: number) => {
    setCandidatosPorPagina(cantidad)
    setPaginaCandidatos(1)
  }

  // Cuando se selecciona una oferta, resetear la paginación de candidatos
  const seleccionarOferta = (oferta: OfertaTrabajo) => {
    setOfertaSeleccionada(oferta)
    setCandidatoSeleccionado(null)
    setPaginaCandidatos(1)
  }

  return {
    ofertas,
    ofertaSeleccionada,
    setOfertaSeleccionada: seleccionarOferta,
    candidatoSeleccionado,
    setCandidatoSeleccionado,
    mostrarSoloExcluyentes,
    setMostrarSoloExcluyentes,
    ordenarPor,
    setOrdenarPor,
    mostrarDialogoNuevaOferta,
    setMostrarDialogoNuevaOferta,
    mostrarDialogoFormulario,
    setMostrarDialogoFormulario,
    busquedaOfertas,
    setBusquedaOfertas,
    busquedaCandidatos,
    setBusquedaCandidatos,
    crearNuevaOferta,
    guardarFormulario,
    ofertasFiltradas,
    ofertasPaginadas,
    candidatosFiltrados,
    candidatosPaginados,
    rechazarCandidato,
    confirmarEntrevista,
    marcarNoAsistio,
    cancelarEntrevista,
    contactarCandidato,
    // Paginación de ofertas
    paginaOfertas,
    setPaginaOfertas,
    ofertasPorPagina,
    setOfertasPorPagina: cambiarOfertasPorPagina,
    totalPaginasOfertas,
    // Paginación de candidatos
    paginaCandidatos,
    setPaginaCandidatos,
    candidatosPorPagina,
    setCandidatosPorPagina: cambiarCandidatosPorPagina,
    totalPaginasCandidatos,
  }
}
