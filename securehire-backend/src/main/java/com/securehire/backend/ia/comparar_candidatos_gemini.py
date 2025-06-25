import sys
import json
import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def generar_prompt(busqueda, candidatos):
    prompt = f"""
Sos un asistente de selección de personal. A continuación te doy la descripción de un puesto de trabajo y una lista de candidatos. Tu tarea es:

⚠️ Muy importante: NO supongas ni infieras nada que no esté explícitamente dicho en el resumen del CV o en las respuestas. Si algo no está mencionado de forma directa, asumí que NO existe.

Evaluá cada candidato de forma estricta, objetiva y literal.

Asigná un puntaje de 0 a 100 por candidato con el siguiente desglose:
- puntajeRequisitosClave (hasta 40 puntos): tecnologías, herramientas o conocimientos clave requeridos
- puntajeExperienciaLaboral (hasta 30 puntos): experiencia laboral comprobable
- puntajeFormacionAcademica (hasta 15 puntos): estudios universitarios, terciarios, etc.
- puntajeIdiomasYSoftSkills (hasta 10 puntos): idiomas, comunicación, trabajo en equipo
- puntajeOtros (hasta 5 puntos): certificaciones, cursos, logros u otro valor agregado

📌 Si un candidato no tiene experiencia laboral pero tiene estudios académicos importantes, puede compensar parcialmente el puntaje general. No penalices con 0 total si hay formación.

También devolvé:
- motivosPositivos: lista de cosas que sí cumple
- motivosNegativos: lista de cosas que no cumple
- aniosExperiencia: número entero (si no se menciona directamente, devolvé 0)

Descripción del puesto:
Título: {busqueda.get('titulo')}
Descripción: {busqueda.get('descripcion')}

Campos excluyentes:
{json.dumps(busqueda.get('camposAdicionales', []), indent=2)}

Candidatos:
"""

    for i, c in enumerate(candidatos):
        prompt += f"""
Candidato {i + 1}:
Nombre: {c.get('nombre')}
Resumen CV: {c.get('resumenCv')}
Respuestas:
{json.dumps(c.get('respuestas', []), indent=2)}
        """

    prompt += """
Devolvé los resultados como una lista JSON con este formato:

[
  {
    "index": 0,
    "nombre": "Nombre del candidato",
    "puntajeRequisitosClave": 35,
    "puntajeExperienciaLaboral": 15,
    "puntajeFormacionAcademica": 13,
    "puntajeIdiomasYSoftSkills": 6,
    "puntajeOtros": 3,
    "puntajeGeneral": 72,
    "motivosPositivos": ["✅ Conoce normativa IGJ", "✅ Inglés avanzado"],
    "motivosNegativos": ["❌ No tiene experiencia en AFIP"],
    "aniosExperiencia": 2
  }
]
"""
    return prompt

def main():
    try:
        print("🔍 Iniciando script de comparación de candidatos...", file=sys.stderr)
        
        raw_input = sys.stdin.read()
        print(f"📥 Datos recibidos: {len(raw_input)} caracteres", file=sys.stderr)
        
        datos = json.loads(raw_input)
        print(f"📋 Búsqueda: {datos['busqueda'].get('titulo', 'Sin título')}", file=sys.stderr)
        print(f"👥 Candidatos a comparar: {len(datos['candidatos'])}", file=sys.stderr)

        busqueda = datos["busqueda"]
        candidatos = datos["candidatos"]

        prompt = generar_prompt(busqueda, candidatos)
        print(f"📝 Prompt generado: {len(prompt)} caracteres", file=sys.stderr)

        print("🤖 Llamando a Gemini API...", file=sys.stderr)
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        print(f"✅ Respuesta de Gemini recibida: {len(text)} caracteres", file=sys.stderr)

        inicio = text.find('[')
        fin = text.rfind(']')
        
        if inicio == -1 or fin == -1:
            print(f"❌ No se encontró JSON válido en la respuesta: {text[:200]}...", file=sys.stderr)
            sys.exit(1)
            
        json_text = text[inicio:fin+1]
        print(f"🔍 JSON extraído: {len(json_text)} caracteres", file=sys.stderr)
        
        resultados = json.loads(json_text)
        print(f"✅ JSON parseado correctamente. {len(resultados)} resultados", file=sys.stderr)

        parrafos = []
        for r in resultados:
            nombre = r["nombre"]
            score = r.get("puntajeGeneral", 0)

            resumen = f"{nombre} tiene un {score}/100 de adecuación al puesto. "

            motivos = []
            for m in r.get("motivosPositivos", []):
                motivos.append(m.replace("✅", "cumple"))
            for m in r.get("motivosNegativos", []):
                motivos.append(m.replace("❌", "no cumple"))

            if motivos:
                resumen += ", ".join(motivos)

            parrafos.append(resumen)

        output = {
            "resultados": resultados,
            "resumenTexto": "\n".join(parrafos)
        }

        print("📤 Enviando resultado final...", file=sys.stderr)
        print(json.dumps(output, ensure_ascii=False))

    except Exception as e:
        print(f"❌ Error en el script IA: {str(e)}", file=sys.stderr)
        import traceback
        print(f"📋 Traceback completo: {traceback.format_exc()}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
