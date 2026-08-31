package com.sunbeam.CRM.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:}")
    private String rawUrl;

    @Value("${DB_URL:}")
    private String dbUrl;

    @Value("${DB_HOST:localhost}")
    private String dbHost;

    @Value("${DB_PORT:3306}")
    private String dbPort;

    @Value("${DB_NAME:defaultdb}")
    private String dbName;

    @Value("${spring.datasource.username:}")
    private String username;

    @Value("${DB_USER:}")
    private String dbUser;

    @Value("${DB_USERNAME:}")
    private String dbUsername;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${DB_PASSWORD:}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String finalUrl = resolveJdbcUrl();
        String finalUser = resolveUsername();
        String finalPass = resolvePassword();

        // If the URL was a full URI with credentials (e.g. mysql://avnadmin:pass@host:port/db)
        String rawOrDbUrl = (dbUrl != null && !dbUrl.trim().isEmpty()) ? dbUrl.trim() : rawUrl;
        if (rawOrDbUrl != null && (rawOrDbUrl.startsWith("mysql://") || rawOrDbUrl.startsWith("jdbc:mysql://"))) {
            try {
                String cleanUri = rawOrDbUrl.startsWith("jdbc:") ? rawOrDbUrl.substring(5) : rawOrDbUrl;
                URI uri = new URI(cleanUri);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    if (finalUser == null || finalUser.isEmpty() || finalUser.equals("root")) finalUser = parts[0];
                    if (finalPass == null || finalPass.isEmpty()) finalPass = parts[1];
                }
            } catch (Exception ignored) {}
        }

        logger.info("Connecting to Database at URL: {} with user: {}", finalUrl, finalUser);

        HikariDataSource ds = new HikariDataSource();
        ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
        ds.setJdbcUrl(finalUrl);
        ds.setUsername(finalUser);
        ds.setPassword(finalPass);
        ds.setConnectionTimeout(30000);
        ds.setMaximumPoolSize(10);
        ds.setMinimumIdle(1);
        return ds;
    }

    private String resolveJdbcUrl() {
        if (dbUrl != null && !dbUrl.trim().isEmpty()) {
            String url = dbUrl.trim();
            if (url.startsWith("mysql://")) {
                url = "jdbc:" + url;
            } else if (!url.startsWith("jdbc:")) {
                url = "jdbc:mysql://" + url;
            }
            // Fix Aiven parameter ssl-mode to sslMode
            url = url.replace("ssl-mode=", "sslMode=");
            
            if (!url.contains("allowPublicKeyRetrieval=")) {
                String delimiter = url.contains("?") ? "&" : "?";
                url = url + delimiter + "allowPublicKeyRetrieval=true";
            }
            if (!url.contains("sslMode=") && !url.contains("useSSL=")) {
                String delimiter = url.contains("?") ? "&" : "?";
                url = url + delimiter + "sslMode=REQUIRED";
            }
            return url;
        }

        if (dbHost != null && !dbHost.trim().isEmpty() && !dbHost.equals("localhost")) {
            boolean isCloud = dbHost.contains("aivencloud.com") || dbHost.contains("tidbcloud.com") || dbHost.contains("clever-cloud.com");
            String sslParam = isCloud 
                    ? "sslMode=REQUIRED&enabledTLSProtocols=TLSv1.2,TLSv1.3&allowPublicKeyRetrieval=true" 
                    : "sslMode=PREFERRED&allowPublicKeyRetrieval=true";
            return String.format("jdbc:mysql://%s:%s/%s?%s", dbHost.trim(), dbPort.trim(), dbName.trim(), sslParam);
        }

        if (rawUrl != null && !rawUrl.trim().isEmpty()) {
            String url = rawUrl.trim().replace("ssl-mode=", "sslMode=");
            return url;
        }

        return String.format("jdbc:mysql://%s:%s/%s?sslMode=PREFERRED&allowPublicKeyRetrieval=true", dbHost, dbPort, dbName);
    }

    private String resolveUsername() {
        if (dbUser != null && !dbUser.isEmpty()) return dbUser;
        if (dbUsername != null && !dbUsername.isEmpty()) return dbUsername;
        if (username != null && !username.isEmpty()) return username;
        return "root";
    }

    private String resolvePassword() {
        if (dbPassword != null && !dbPassword.isEmpty()) return dbPassword;
        if (password != null && !password.isEmpty()) return password;
        return "";
    }
}
