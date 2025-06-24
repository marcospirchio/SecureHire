import { useEffect, useState } from "react";

interface ImagenPerfilProps {
  postulacionId: string;
  nombre: string;
  apellido: string;
  size?: number; // tamaño en px
}

export function ImagenPerfil({ postulacionId, nombre, apellido, size = 64 }: ImagenPerfilProps) {
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/postulaciones/${postulacionId}/foto-perfil`, {
      credentials: "include"
    })
      .then(res => {
        if (res.status === 204 || res.status === 404) {
          setFotoPerfil(null);
          return "";
        }
        if (!res.ok) throw new Error("No se pudo obtener la imagen");
        return res.text();
      })
      .then(data => {
        if (data && !data.startsWith("data:image")) {
          setFotoPerfil(`data:image/jpeg;base64,${data}`);
        } else {
          setFotoPerfil(data);
        }
      })
      .catch(err => {
        if (err.message !== "No se pudo obtener la imagen") {
          console.error(err);
        }
        setFotoPerfil(null);
      });
  }, [postulacionId]);

  // Función para obtener iniciales en mayúsculas
  const getInitials = (nombre: string, apellido: string) => {
    const n = nombre?.trim().split(" ")[0] || "";
    const a = apellido?.trim().split(" ")[0] || "";
    return `${n.charAt(0)}${a.charAt(0)}`.toUpperCase();
  };

  return (
    <div style={{ width: size, height: size }}>
      {fotoPerfil ? (
        <img
          src={fotoPerfil}
          alt="Foto de perfil"
          style={{ width: size, height: size }}
          className="rounded-full object-cover border-2 border-gray-200"
        />
      ) : (
        <div
          style={{ width: size, height: size, fontSize: size * 0.45 }}
          className="rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 text-gray-500 font-bold select-none"
        >
          {getInitials(nombre, apellido)}
        </div>
      )}
    </div>
  );
} 