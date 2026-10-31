package com.example.ticket_booking_system.scheduler;

import java.time.LocalDateTime;
import java.time.ZoneId;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.ticket_booking_system.service.ShowService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ShowStatusScheduler {

    private final ShowService showService;

    @Scheduled(fixedRate = 5000)
    public void updateShowStatuses() {

        LocalDateTime now = LocalDateTime.now(
                ZoneId.of("Asia/Kolkata")
        );
        System.out.println("Scheduler running at: " + now);

        showService.updateShowStatuses(now);
    }
}