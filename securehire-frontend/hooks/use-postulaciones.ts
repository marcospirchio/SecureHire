import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

interface Postulacion {
  id: string;
  candidatoId: string;
  busquedaId: string;
  fase: string;
  estado: string;
  fechaPostulacion: string;
  candidato: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export function usePostulaciones() {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPostulaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener los IDs del localStorage
      const idsPostulacionesStr = localStorage.getItem('postulacionesSeleccionadas');
      if (!idsPostulacionesStr) {
        setPostulaciones([]);
        return;
      }

      const idsPostulaciones: string[] = JSON.parse(idsPostulacionesStr);

      // Cargar los datos completos de cada postulación
      const postulacionesCompletas = await Promise.all(
        idsPostulaciones.map(async (id) => {
          const response = await fetch(`http://localhost:8080/api/postulaciones/${id}`, {
            credentials: 'include'
          });
          if (!response.ok) throw new Error(`Error al cargar postulación ${id}`);
          return response.json();
        })
      );

      setPostulaciones(postulacionesCompletas);
    } catch (err) {
      console.error('Error al cargar postulaciones:', err);
      setError('No se pudieron cargar las postulaciones');
      toast({
        title: "Error",
        description: "No se pudieron cargar las postulaciones.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const actualizarPostulacion = async (id: string, datos: Partial<Postulacion>) => {
    try {
      const response = await fetch(`http://localhost:8080/api/postulaciones/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(datos)
      });

      if (!response.ok) throw new Error('Error al actualizar la postulación');

      // Recargar todas las postulaciones para mantener la consistencia
      await cargarPostulaciones();
    } catch (err) {
      console.error('Error al actualizar postulación:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar la postulación.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    cargarPostulaciones();
  }, []);

  return {
    postulaciones,
    loading,
    error,
    cargarPostulaciones,
    actualizarPostulacion
  };
} 