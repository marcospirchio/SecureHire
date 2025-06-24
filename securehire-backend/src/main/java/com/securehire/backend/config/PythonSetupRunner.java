package com.securehire.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.lang.ProcessBuilder;

@Component
public class PythonSetupRunner implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- Iniciando configuración del entorno de Python ---");

        // Verificar si pip3 está disponible
        try {
            ProcessBuilder pbCheck = new ProcessBuilder("pip3", "--version");
            Process pCheck = pbCheck.start();
            if (pCheck.waitFor() != 0) {
                throw new RuntimeException("'pip3' no parece estar instalado o no está en el PATH.");
            }
        } catch (Exception e) {
            System.err.println("ERROR: No se pudo ejecutar 'pip3'. Asegúrate de que Python 3 y pip3 estén instalados y en el PATH del sistema.");
            System.err.println("La funcionalidad de IA no operará correctamente.");
            return; // No continuar si pip3 no está
        }

        // Instalar dependencias
        String userDir = System.getProperty("user.dir");
        String requirementsPath = userDir + "/securehire-backend/src/main/java/com/securehire/backend/ia/requirements.txt";
        ProcessBuilder pb = new ProcessBuilder("pip3", "install", "-r", requirementsPath);
        
        System.out.println("Intentando instalar dependencias desde: " + requirementsPath);

        pb.redirectErrorStream(true);
        Process process = pb.start();

        // Leer la salida del proceso (tanto stdout como stderr)
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("pip3: " + line);
            }
        }

        int exitCode = process.waitFor();
        if (exitCode == 0) {
            System.out.println("--- Dependencias de Python instaladas correctamente ---");
        } else {
            System.err.println("--- ERROR: Falló la instalación de las dependencias de Python (código de salida: " + exitCode + ") ---");
            System.err.println("--- La funcionalidad de IA podría no funcionar. Revisa los logs de 'pip3' de arriba. ---");
        }
    }
} 