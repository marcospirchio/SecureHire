type Estado = "Entrevista confirmada" | "Pendiente de confirmación" | "No se presentó"

export function EtiquetaEstado({ estado }: { estado: Estado }) {
  const colorClase = {
    "Entrevista confirmada":
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    "Pendiente de confirmación":
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    "No se presentó": "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  }

  return <span className={`px-3 py-1 text-sm font-medium rounded-full border ${colorClase[estado]}`}>{estado}</span>
}
