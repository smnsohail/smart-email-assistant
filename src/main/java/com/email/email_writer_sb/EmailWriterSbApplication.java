package com.email.email_writer_sb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.reactive.function.client.WebClient;

@SpringBootApplication
public class EmailWriterSbApplication {

	public static void main(String[] args) {
		SpringApplication.run(EmailWriterSbApplication.class, args);
//		System.out.println("Email Writer Spring Boot Application started successfully!");
	}

	@Bean
	public WebClient webClient() {
		return WebClient.builder().build();
	}


}
