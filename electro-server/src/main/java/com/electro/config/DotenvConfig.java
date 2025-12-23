package com.electro.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Load environment variables from .env file
 * This runs before Spring loads application.properties
 */
public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        try {
            // Try multiple locations for .env file
            Dotenv dotenv = null;
            
            // Try current directory first (when running java -jar from electro-server/)
            try {
                dotenv = Dotenv.configure()
                        .directory(".")
                        .ignoreIfMissing()
                        .load();
                if (dotenv.entries().size() > 0) {
                    System.out.println("✅ Found .env in current directory");
                }
            } catch (Exception e) {
                // Try parent directory (when running from root)
                try {
                    dotenv = Dotenv.configure()
                            .directory("./electro-server")
                            .ignoreIfMissing()
                            .load();
                    if (dotenv.entries().size() > 0) {
                        System.out.println("✅ Found .env in electro-server directory");
                    }
                } catch (Exception e2) {
                    // Last resort: try to load from system environment
                    System.err.println("⚠️  .env file not found, using system environment variables");
                    return;
                }
            }

            // Convert to Map
            Map<String, Object> envMap = new HashMap<>();
            dotenv.entries().forEach(entry -> {
                envMap.put(entry.getKey(), entry.getValue());
            });

            // Add to Spring Environment
            ConfigurableEnvironment environment = applicationContext.getEnvironment();
            environment.getPropertySources().addFirst(new MapPropertySource("dotenv", envMap));

            System.out.println("✅ Loaded " + envMap.size() + " environment variables from .env file");
        } catch (Exception e) {
            System.err.println("⚠️  Error loading .env file: " + e.getMessage());
            System.err.println("⚠️  Make sure to set environment variables manually");
        }
    }
}
