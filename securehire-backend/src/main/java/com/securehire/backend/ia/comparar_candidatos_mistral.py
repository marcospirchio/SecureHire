import sys
import json
import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def generar_prompt(busqueda, candidatos):
    prompt = f"""
Sos un asistente de selección de personal. A continuación te doy la descripción de un puesto de trabajo y una lista de candidatos. Tu tarea es:

1. Leer la descripción del puesto y deducir los requisitos clave, conocimientos específicos, herramientas, idiomas o habilidades que realmente importan para el rol.
2. Para cada candidato, evaluar si su CV (resumen) y sus respuestas cumplen esos requisitos.
3. Indicar qué requisitos cumple o no, y asignar un puntaje de 0 a 100 basado en esa adecuación.
4. Explicar brevemente por qué.

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

    prompt += "\nDevolvé los resultados como una lista JSON con este formato:\n\n"
    prompt += json.dumps([
        {
            "index": 0,
            "nombre": "Nombre del candidato",
            "score": 80,
            "explicacion": [
                "✅ Cumple con conocimientos contables",
                "❌ No menciona normativa IGJ",
                "✅ Conoce AFIP"
            ]
        }
    ], indent=2)

    return prompt


def main():
    try:
        raw_input = sys.stdin.read()
        datos = json.loads(raw_input)

        busqueda = datos["busqueda"]
        candidatos = datos["candidatos"]

        prompt = generar_prompt(busqueda, candidatos)

        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)

        # Gemini a veces devuelve texto con formato, no siempre JSON puro
        text = response.text.strip()

        # Buscamos el JSON dentro del texto (por si devuelve algo más)
        inicio = text.find('[')
        fin = text.rfind(']')
        json_text = text[inicio:fin+1]

        resultados = json.loads(json_text)

        parrafos = []
        for r in resultados:
            nombre = r["nombre"]
            score = r["score"]
            resumen = f"{nombre} tiene un {score}% de adecuación al puesto. "
            resumen += ", ".join(e.replace("✅", "cumple").replace("❌", "no cumple") for e in r["explicacion"])
            parrafos.append(resumen)

        output = {
            "resultados": resultados,
            "resumenTexto": "\n".join(parrafos)
        }

        print(json.dumps(output, ensure_ascii=False))

    except Exception as e:
        print(f"❌ Error en el script IA: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
