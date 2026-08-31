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

        // If the URL was a full URI with credentials (e.g. mysql://user:pass@host:port/db)
        if ((rawUrl != null && rawUrl.startsWith("mysql://")) || (dbUrl != null && dbUrl.startsWith("mysql://"))) {
            try {
                String uriStr = (dbUrl != null && !dbUrl.isEmpty()) ? dbUrl : rawUrl;
                URI uri = new URI(uriStr);
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
        String url = (dbUrl != null && !dbUrl.isEmpty()) ? dbUrl : rawUrl;

        if (url == null || url.trim().isEmpty()) {
            return String.format("jdbc:mysql://%s:%s/%s?sslMode=REQUIRED&createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true",
                    dbHost, dbPort, dbName);
        }

        url = url.trim();

        // If it starts with mysql://, convert to jdbc:mysql://
        if (url.startsWith("mysql://")) {
            url = "jdbc:" + url;
        }

        // If it does not start with jdbc: at all
        if (!url.startsWith("jdbc:")) {
            url = "jdbc:mysql://" + url;
        }

        // Ensure proper SSL parameter for cloud DBs if not present
        if (!url.contains("sslMode=") && !url.contains("useSSL=")) {
            String delimiter = url.contains("?") ? "&" : "?";
            url = url + delimiter + "sslMode=REQUIRED&allowPublicKeyRetrieval=true";
        }

        return url;
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
