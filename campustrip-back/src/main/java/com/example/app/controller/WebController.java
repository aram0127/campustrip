package com.example.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    // API 요청(/api/**)이나 정적 파일(확장자가 있는 파일)이 아닌 모든 요청을 index.html로 포워딩
    @GetMapping(value =  "/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }
}