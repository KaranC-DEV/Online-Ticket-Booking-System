package com.example.ticket_booking_system.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SeatGenerationRequestDTO {

    @NotNull
    @Min(0)
    private Integer regularSeats;

    @NotNull
    @Min(0)
    private Integer premiumSeats;
}