package com.securehire.backend.util;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class Dotenv {

    public static Map<String, String> load() {
        Map<String, String> env = new HashMap<>();
        // El .env está en la raíz del proyecto.
        String path = System.getProperty("user.dir") + "/.env"; 
        
        try (BufferedReader br = new BufferedReader(new FileReader(path))) {
            String line;
            while ((line = br.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                String[] parts = line.split("=", 2);
                if (parts.length == 2) {
                    env.put(parts[0], parts[1]);
                }
            }
        } catch (IOException e) {
            // No es un error fatal si no existe, pero sí un aviso.
            System.out.println("ADVERTENCIA: No se pudo cargar el archivo .env en la ruta: " + new java.io.File(path).getAbsolutePath());
            System.out.println("Asegúrate de que el archivo .env esté en la raíz del proyecto.");
        }
        return env;
    }
} 