import { useEffect, useState } from "react";

export function ImagenPerfil({ postulacionId }: { postulacionId: string }) {
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/postulaciones/${postulacionId}/foto-perfil`, {
      credentials: "include"
    })
      .then(res => {
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
        setFotoPerfil(null);
        console.error(err);
      });
  }, [postulacionId]);

  return (
    <div>
      {fotoPerfil ? (
        <img src={fotoPerfil} alt="Foto de perfil" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 text-gray-500 text-xl">
          Sin imagen
        </div>
      )}
    </div>
  );
} 