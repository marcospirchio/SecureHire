import sys
import json

def extraer_tags(texto):
    tags = []
    keywords = ["React", "Next.js", "JavaScript", "SSR", "accesibilidad", "idiomas", "Scrum", "Docker", "Git"]
    for palabra in keywords:
        if palabra.lower() in texto.lower():
            tags.append(palabra)
    return tags

def calcular_scoring(candidato, campos_excluyentes, tags_busqueda):
    score = 0
    explicacion = []

    for r in candidato.get("respuestas", []):
        campo = r.get("campo", "").lower()
        valor = r.get("respuesta", "").lower()
        for excluyente in campos_excluyentes:
            if excluyente["nombre"].lower() == campo:
                if valor in [v.lower() for v in excluyente.get("valoresExcluyentes", [])]:
                    score += 30
                    explicacion.append(f"✔️ Cumple con campo excluyente: {campo}")
                else:
                    explicacion.append(f"❌ No cumple campo excluyente: {campo}")

    resumen = candidato.get("resumenCv", "").lower()
    for tag in tags_busqueda:
        if tag.lower() in resumen:
            score += 10
            explicacion.append(f"✅ Menciona '{tag}' en el CV")

    return score, explicacion

def main():
    try:
        print("📥 Iniciando lectura de stdin...", file=sys.stderr)
        raw_input = sys.stdin.read()
        print(f"📦 JSON recibido:\n{raw_input}", file=sys.stderr)

        datos = json.loads(raw_input)
        print("✅ JSON parseado correctamente", file=sys.stderr)

        busqueda = datos["busqueda"]
        candidatos = datos["candidatos"]

        campos_excluyentes = busqueda.get("camposAdicionales", [])
        descripcion_puesto = busqueda.get("descripcion", "")
        tags_busqueda = extraer_tags(descripcion_puesto)

        resultados = []
        for idx, candidato in enumerate(candidatos):
            score, explicacion = calcular_scoring(candidato, campos_excluyentes, tags_busqueda)
            resultados.append({
                "index": idx,
                "nombre": candidato.get("nombre", f"Candidato {idx + 1}"),
                "score": score,
                "explicacion": explicacion,
            })

        resultados.sort(key=lambda x: x["score"], reverse=True)

        # ✅ Agregado: resumen corto por candidato (útil para mostrar texto plano)
        parrafos = []
        for r in resultados:
            nombre = r["nombre"]
            score = r["score"]
            resumen = f"{nombre} tiene un {score}% de adecuación al puesto. "

            explicacion_corta = []
            for e in r["explicacion"]:
                e_lower = e.lower()
                if "cumple con campo excluyente" in e_lower:
                    explicacion_corta.append("cumple requisitos excluyentes")
                elif "no cumple campo excluyente" in e_lower:
                    explicacion_corta.append("no cumple requisitos excluyentes")
                elif "menciona" in e_lower:
                    explicacion_corta.append(e.replace("✅ ", "").replace("Menciona", "menciona"))

            if explicacion_corta:
                resumen += ", ".join(set(explicacion_corta)) + "."
            else:
                resumen += "No se detectaron coincidencias relevantes."

            parrafos.append(resumen)

        output = {
            "resultados": resultados,
            "resumenTexto": "\n".join(parrafos)
        }

        print(json.dumps(output, ensure_ascii=False))
        print("✅ Fin del script sin errores", file=sys.stderr)

    except Exception as e:
        print(f"❌ Error en el script: {str(e)}", file=sys.stderr)

if __name__ == "__main__":
    main()
