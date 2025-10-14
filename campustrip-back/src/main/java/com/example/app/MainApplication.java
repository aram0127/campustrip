package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.app.controller.UserController;

@SpringBootApplication
@RestController
public class MainApplication {

	public static void main(String[] args) {
		SpringApplication.run(MainApplication.class, args);
	}

	//간단한 string 반환
	@GetMapping("/hello")
	public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
		return String.format("Hello %s!", name);
	}

	//json 반환
	@GetMapping("/cal")
	public Data cal(@RequestParam(value = "first", defaultValue = "1") int first, @RequestParam(value = "second", defaultValue = "1") int second){
		return new Data("aa", first + second);
	}

	static class Data {
		private String message;
		private int value;

		// 생성자
		public Data(String message, int value) {
			this.message = message;
			this.value = value;
		}

		// Getter (JSON 변환에 필요)
		public String getMessage() {
			return message;
		}

		public int getValue() {
			return value;
		}
	}
}
