import type { OfertaTrabajo } from "@/types/ofertas"

export const ofertasEjemplo: OfertaTrabajo[] = [
  {
    id: "1",
    titulo: "Desarrollador Frontend",
    descripcion: "Buscamos desarrollador frontend con experiencia en React y TypeScript",
    fechaCreacion: new Date(2025, 3, 15),
    formulario: {
      id: "form1",
      nombre: "Formulario Desarrollador Frontend",
      campos: [
        {
          id: "campo1",
          tipo: "texto",
          etiqueta: "Años de experiencia en React",
          esExcluyente: true,
        },
        {
          id: "campo2",
          tipo: "checkbox",
          etiqueta: "Conocimiento de TypeScript",
          esExcluyente: true,
        },
        {
          id: "campo3",
          tipo: "dropdown",
          etiqueta: "Nivel de inglés",
          esExcluyente: false,
          opciones: ["Básico", "Intermedio", "Avanzado", "Nativo"],
        },
      ],
    },
    candidatos: [
      {
        id: 1,
        nombre: "María Pérez",
        edad: 28,
        sexo: "Femenino",
        reputacion: 4,
        tiempoRespuesta: "24 horas",
        respuestas: {
          campo1: "3 años",
          campo2: true,
          campo3: "Avanzado",
        },
        cumpleRequisitosExcluyentes: true,
        puesto: "Desarrollador Frontend",
        estado: "Entrevista confirmada",
        email: "maria.perez@ejemplo.com",
        telefono: "+34 612 345 678",
        entrevistas: [
          {
            fecha: new Date(2025, 4, 15, 10, 0),
            estado: "Entrevista confirmada",
            notas: "Candidata muy interesada en el puesto. Tiene experiencia relevante en React y TypeScript.",
          },
        ],
        comentarios: [
          {
            reclutador: "Carlos Rodríguez",
            fecha: new Date(2025, 4, 10),
            texto: "Excelente comunicación. Portfolio impresionante con proyectos relevantes en React.",
          },
        ],
        anotacionesPersonales: [
          {
            id: 1,
            fecha: new Date(2025, 4, 11),
            texto: "Candidata muy prometedora. Preguntar sobre su experiencia con Next.js en la próxima entrevista.",
          },
        ],
      },
      {
        id: 2,
        nombre: "Javier González",
        edad: 32,
        sexo: "Masculino",
        reputacion: 3,
        tiempoRespuesta: "48 horas",
        respuestas: {
          campo1: "1 año",
          campo2: false,
          campo3: "Intermedio",
        },
        cumpleRequisitosExcluyentes: false,
        puesto: "Desarrollador Frontend",
        estado: "Pendiente de confirmación",
        email: "javier.gonzalez@ejemplo.com",
        telefono: "+34 623 456 789",
        entrevistas: [
          {
            fecha: new Date(2025, 4, 12, 15, 30),
            estado: "Pendiente de confirmación",
            notas: "Tiene experiencia con React y Next.js. Pendiente de confirmar disponibilidad.",
          },
        ],
        comentarios: [
          {
            reclutador: "Ana Martínez",
            fecha: new Date(2025, 4, 8),
            texto: "Buenas habilidades técnicas pero algo indeciso sobre el cambio de empresa.",
          },
        ],
        anotacionesPersonales: [
          {
            id: 1,
            fecha: new Date(2025, 4, 9),
            texto: "Verificar referencias de trabajos anteriores. Parece dudar sobre el cambio de empresa.",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    titulo: "Diseñador UX/UI",
    descripcion: "Buscamos diseñador UX/UI con experiencia en Figma y diseño de interfaces móviles",
    fechaCreacion: new Date(2025, 3, 20),
    formulario: {
      id: "form2",
      nombre: "Formulario Diseñador UX/UI",
      campos: [
        {
          id: "campo1",
          tipo: "texto",
          etiqueta: "Años de experiencia en diseño UX/UI",
          esExcluyente: true,
        },
        {
          id: "campo2",
          tipo: "checkbox",
          etiqueta: "Experiencia con Figma",
          esExcluyente: true,
        },
        {
          id: "campo3",
          tipo: "checkbox",
          etiqueta: "Experiencia en diseño de interfaces móviles",
          esExcluyente: false,
        },
      ],
    },
    candidatos: [
      {
        id: 3,
        nombre: "Elena Martín",
        edad: 26,
        sexo: "Femenino",
        reputacion: 5,
        tiempoRespuesta: "12 horas",
        respuestas: {
          campo1: "4 años",
          campo2: true,
          campo3: true,
        },
        cumpleRequisitosExcluyentes: true,
        puesto: "Diseñador UX/UI",
        estado: "Pendiente de confirmación",
        email: "elena.martin@ejemplo.com",
        telefono: "+34 656 789 012",
        entrevistas: [
          {
            fecha: new Date(2025, 4, 20, 9, 30),
            estado: "Pendiente de confirmación",
            notas: "Candidata con experiencia en diseño de aplicaciones móviles.",
          },
        ],
        comentarios: [
          {
            reclutador: "David Ruiz",
            fecha: new Date(2025, 4, 15),
            texto: "Portafolio muy completo. Buena actitud durante la llamada inicial.",
          },
        ],
        anotacionesPersonales: [
          {
            id: 1,
            fecha: new Date(2025, 4, 16),
            texto: "Tiene buena experiencia en diseño móvil. Preguntar por su portafolio específico de aplicaciones.",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    titulo: "Product Manager",
    descripcion: "Buscamos Product Manager con experiencia en desarrollo de productos digitales",
    fechaCreacion: new Date(2025, 4, 5),
    formulario: null,
    candidatos: [],
  },
]
