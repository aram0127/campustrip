package com.example.app.service;


import com.example.app.repository.UniversitiesRepository;
import org.springframework.stereotype.Service;

@Service
public class UniversitiesService {
    final UniversitiesRepository universitiesRepository;

    public UniversitiesService(UniversitiesRepository universitiesRepository) {
        this.universitiesRepository = universitiesRepository;
    }

    public String getUniversityNameByEmail(String email) {
        String domain = email.substring(email.indexOf("@") + 1);
        var university = universitiesRepository.findByDomain(domain);
        return university != null ? university.getName() : null;
    }
}
