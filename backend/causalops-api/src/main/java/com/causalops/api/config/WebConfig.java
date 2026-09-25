package com.causalops.api.config;
import org.springframework.context.annotation.*; import org.springframework.web.servlet.config.annotation.*; import org.springframework.web.client.RestClient;
@Configuration public class WebConfig implements WebMvcConfigurer { @Bean RestClient restClient(){return RestClient.builder().build();} @Override public void addCorsMappings(CorsRegistry r){r.addMapping("/api/**").allowedOrigins("http://localhost:3000","http://localhost:5173").allowedMethods("GET","POST","OPTIONS");} }
