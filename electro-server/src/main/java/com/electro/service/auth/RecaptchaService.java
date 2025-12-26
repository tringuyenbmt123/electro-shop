package com.electro.service.auth;

import com.electro.dto.authentication.RecaptchaResponse;
import com.electro.exception.VerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

@Service
public class RecaptchaService {

    @Value("${electro.app.recaptcha.secret}")
    private String recaptchaSecret;

    @Value("${electro.app.recaptcha.verifyUrl:https://www.google.com/recaptcha/api/siteverify}")
    private String verifyUrl;

    public void verifyToken(String token) {
        if (!StringUtils.hasText(token)) {
            throw new VerificationException("Missing reCAPTCHA token");
        }

        if (!StringUtils.hasText(recaptchaSecret)) {
            throw new VerificationException("reCAPTCHA secret not configured");
        }

        MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
        requestBody.add("secret", recaptchaSecret);
        requestBody.add("response", token);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        RestTemplate restTemplate = new RestTemplate();
        RecaptchaResponse response = restTemplate.postForObject(
                verifyUrl,
                new HttpEntity<>(requestBody, headers),
                RecaptchaResponse.class
        );

        if (response == null || !response.isSuccess()) {
            throw new VerificationException("Invalid reCAPTCHA");
        }
    }
}
