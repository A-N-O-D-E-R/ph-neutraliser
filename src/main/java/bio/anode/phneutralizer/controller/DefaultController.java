package bio.anode.phneutralizer.controller;

import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
public class DefaultController {
    
    @GetMapping(value = { "/neutralizer", "/neutralizer/**" })
    public String getHomePage(HttpServletRequest request) {
        log.info("-------------- redirect request = {} to /index.html", request.getRequestURI());
        return "/index.html";
    }

    @GetMapping(value = { "/", "" })
    public String redirectToHomePage(HttpServletRequest request) {
        log.info("-------------- redirect request = {} to /index.html", request.getRequestURI());
        return "redirect:/cecom/";
    }
}
