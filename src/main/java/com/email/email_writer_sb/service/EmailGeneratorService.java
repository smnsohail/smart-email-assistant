package com.email.email_writer_sb.service;

import com.email.email_writer_sb.entity.EmailRequest;

import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class EmailGeneratorService {

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    //DI for WebClient to make HTTP requests
    private final WebClient webClient;


    public EmailGeneratorService(WebClient webClient) {
        this.webClient = webClient;
    }


    public String generateEmailReply(EmailRequest emailRequest) {
        //Build the prompt
        String prompt = buildPrompt(emailRequest);


        //Cast a request
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                }

        );

        // Send a request and get response

        String response = webClient.post()
                .uri(geminiApiUrl + "?key=" + geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)// Set the request body with the prompt
                .retrieve()
                .bodyToMono(String.class)
                .block()
        ;

        /*
        webClient.post(): Initiates an HTTP POST request.
            .uri(geminiApiUrl + geminiApiKey): Sets the request URI (endpoint URL)
            .header("Content-Type", "application/json"): Adds a header specifying the request body is JSON.
            .bodyValue(requestBody)// Set the request body with the prompt
            .retrieve(): Executes the request and prepares to handle the response.
            .bodyToMono(String.class): Converts the response body to a Mono<String>, representing an asynchronous result containing the response as a string.
            .block(): Blocks the current thread and waits for the Mono to complete, returning the response string synchronously.F
        */
        return extractEmailContentFromResponse(response);
    }

    private String extractEmailContentFromResponse(String response) {
        try {
            // Assuming the response is a JSON string containing the email content
            //may need to adjust this based on the actual response structure

            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates").get(0) //because response contains an array of candidates
                    .path("content") // this is an object containing the content
                    .path("parts").get(0) // It is array of parts, we take the first part
                    .path("text").asText(); // Replace with actual extraction logic if needed
        } catch (Exception e) {
            System.err.println("Error processing response: " + e.getMessage());
            e.printStackTrace();
            return "Error generating email reply";
        }
    }

    public String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email or reply for the following email content. Please don't generate a subject line, look at the prompt below and generate a reply based on the content provided.\n\n");

        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone");
        }

        prompt.append("Original email content: \n").append((emailRequest.getEmailContent()));
        return prompt.toString();
    }
}
