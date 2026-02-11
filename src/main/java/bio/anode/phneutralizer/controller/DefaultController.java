package bio.anode.phneutralizer.controller;

import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import java.security.cert.X509Certificate;

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
        return "redirect:/neutralizer/";
    }

    @GetMapping("/whoami")
    public String whoami(HttpServletRequest request) throws Exception {
        X509Certificate[] certs =
            (X509Certificate[]) request.getAttribute("javax.servlet.request.X509Certificate");

        return certs[0].getSubjectDN().getName();
    }
}
