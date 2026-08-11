package com.sunbeam.CRM.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
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
    public RestClient emailRestClient(
            @Value("${email.service.base-url}") String baseUrl) {

        return RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Bean
    @Qualifier("aiRestClient")
    public RestClient aiRestClient(
            @Value("${ai.service.base-url}") String baseUrl) {

        return RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

}