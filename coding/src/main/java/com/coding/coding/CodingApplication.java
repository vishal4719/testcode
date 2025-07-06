package com.coding.coding;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CodingApplication {

	public static void main(String[] args) {
		SpringApplication.run(CodingApplication.class, args);
	}

}
