package com.sunbeam.CRM.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    //    Java Mail Service
    //    @Bean
    //    public RestClient restClient() {
    //        return RestClient.builder().build();
    //    }
    @Bean
    @Qualifier("emailRestClient")
    public RestClient emailRestClient() {
        return RestClient.builder()
                .baseUrl("http://localhost:5140")
                .build();
    }

    @Bean
    @Qualifier("aiRestClient")
    public RestClient aiRestClient() {
        return RestClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }

}