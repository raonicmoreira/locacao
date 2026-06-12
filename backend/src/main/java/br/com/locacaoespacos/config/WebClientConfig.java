package br.com.locacaoespacos.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${app.ms-controle-acesso-url}")
    private String msControleAcessoUrl;

    @Bean
    public WebClient controleAcessoWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(msControleAcessoUrl)
                .build();
    }
}
