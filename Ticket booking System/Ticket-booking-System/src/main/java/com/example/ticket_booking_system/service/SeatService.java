package com.example.ticket_booking_system.service;

import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ticket_booking_system.dto.SeatGenerationRequestDTO;
import com.example.ticket_booking_system.dto.SeatRequestDTO;
import com.example.ticket_booking_system.dto.SeatResponseDTO;
import com.example.ticket_booking_system.entity.Screen;
import com.example.ticket_booking_system.entity.Seat;
import com.example.ticket_booking_system.enums.SeatType;
import com.example.ticket_booking_system.exception.ResourceNotFoundException;
import com.example.ticket_booking_system.repository.ScreenRepository;
import com.example.ticket_booking_system.repository.SeatRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class SeatService {

    private final ModelMapper modelMapper;
    private final SeatRepository seatRepository;
    private final ScreenRepository screenRepository;

    // Existing: Add individual seat
    public SeatResponseDTO addSeat(Long screenId, SeatRequestDTO seatRequestDTO) {

        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Screen not found with ID: " + screenId));

        boolean exists = seatRepository.existsByScreenIdAndSeatNumber(
                screenId, seatRequestDTO.getSeatNumber());

        if (exists) {
            throw new IllegalArgumentException(
                    "Seat number already exists in this screen");
        }

        Seat seat = modelMapper.map(seatRequestDTO, Seat.class);
        seat.setScreen(screen);

        Seat savedSeat = seatRepository.save(seat);

        SeatResponseDTO response = modelMapper.map(
                savedSeat, SeatResponseDTO.class);

        response.setScreenId(screen.getId());
        response.setScreenName(screen.getScreenName());

        return response;
    }

    // Existing: Get all seats for a screen
    public List<SeatResponseDTO> getSeatsByScreenId(Long screenId) {

        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Screen not found with ID: " + screenId));

        List<Seat> seats = seatRepository.findByScreenId(screenId);

        List<SeatResponseDTO> responseList = new ArrayList<>();

        for (Seat seat : seats) {
            SeatResponseDTO response = modelMapper.map(
                    seat, SeatResponseDTO.class);

            response.setScreenId(screen.getId());
            response.setScreenName(screen.getScreenName());

            responseList.add(response);
        }

        return responseList;
    }

    // New: Generate seats automatically
    @Transactional
    public List<SeatResponseDTO> generateSeats(
            Long screenId,
            SeatGenerationRequestDTO requestDTO) {

        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Screen not found with ID: " + screenId));

        int regularCount = requestDTO.getRegularSeats();
        int premiumCount = requestDTO.getPremiumSeats();

        if (regularCount < 0 || premiumCount < 0 ||
                regularCount + premiumCount == 0) {
            throw new IllegalArgumentException(
                    "Enter valid seat counts");
        }

        if (!seatRepository.findByScreenId(screenId).isEmpty()) {
            throw new IllegalArgumentException(
                    "Seats already exist for this screen");
        }

        int totalSeats = regularCount + premiumCount;
        int seatsPerRow = 10;

        List<Seat> seats = new ArrayList<>();

        for (int i = 0; i < totalSeats; i++) {

            int rowNumber = i / seatsPerRow;
            int seatNumber = (i % seatsPerRow) + 1;

            if (rowNumber >= 26) {
                throw new IllegalArgumentException(
                        "Maximum supported capacity is 260 seats");
            }

            char rowName = (char) ('A' + rowNumber);

            Seat seat = new Seat();

            seat.setSeatNumber(rowName + String.valueOf(seatNumber));

            seat.setSeatType(
                    i < regularCount
                            ? SeatType.REGULAR
                            : SeatType.PREMIUM);

            seat.setScreen(screen);

            seats.add(seat);
        }

        List<Seat> savedSeats = seatRepository.saveAll(seats);

        List<SeatResponseDTO> responseList = new ArrayList<>();

        for (Seat seat : savedSeats) {

            SeatResponseDTO response = modelMapper.map(
                    seat, SeatResponseDTO.class);

            response.setScreenId(screen.getId());
            response.setScreenName(screen.getScreenName());

            responseList.add(response);
        }

        return responseList;
    }
    
    
    
}
