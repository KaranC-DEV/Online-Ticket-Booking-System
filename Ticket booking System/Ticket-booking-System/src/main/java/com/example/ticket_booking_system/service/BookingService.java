package com.example.ticket_booking_system.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.modelmapper.ModelMapper;

import org.springframework.stereotype.Service;

import com.example.ticket_booking_system.dto.BookingResponseDTO;
import com.example.ticket_booking_system.entity.Booking;
import com.example.ticket_booking_system.entity.BookingSeat;
import com.example.ticket_booking_system.entity.Show;
import com.example.ticket_booking_system.entity.ShowSeat;
import com.example.ticket_booking_system.entity.User;
import com.example.ticket_booking_system.enums.BookingStatus;
import com.example.ticket_booking_system.enums.MovieStatus;
import com.example.ticket_booking_system.enums.SeatStatus;
import com.example.ticket_booking_system.enums.ShowStatus;
import com.example.ticket_booking_system.exception.ResourceNotFoundException;
import com.example.ticket_booking_system.repository.BookingRepository;
import com.example.ticket_booking_system.repository.BookingSeatRepository;
import com.example.ticket_booking_system.repository.ShowRepository;
import com.example.ticket_booking_system.repository.ShowSeatRepository;
import com.example.ticket_booking_system.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ShowRepository showRepository;
    private final ShowSeatRepository showSeatRepository;
    private final BookingSeatRepository bookingSeatRepository;
    
    private final ModelMapper modelMapper;

    @Transactional
    public BookingResponseDTO createBooking(
            Long userId,
            Long showId,
            Long showSeatId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));

        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Show not found with ID: " + showId));
        
        if (show.getMovie().getStatus() == MovieStatus.INACTIVE) {
            throw new IllegalStateException(
                "Booking is unavailable because this movie is inactive."
            );
        }
        
        if (show.getStatus() != ShowStatus.SCHEDULED) {
            throw new IllegalArgumentException(
                    "This show is not available for booking");
        }

        ShowSeat showSeat = showSeatRepository.findById(showSeatId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Show seat not found with ID: " + showSeatId));

        if (!showSeat.getShow().getId().equals(showId)) {
            throw new IllegalArgumentException(
                    "The selected seat does not belong to this show");
        }

        if (showSeat.getStatus() != SeatStatus.AVAILABLE) {
            throw new IllegalArgumentException(
                    "The selected seat is not available");
        }

        // Create Booking
        Booking booking = new Booking();
        booking.setCustomer(user);
        booking.setShow(show);
        booking.setTotalAmount(showSeat.getPrice());
        booking.setBookingDateTime(LocalDateTime.now());
        booking.setStatus(BookingStatus.CONFIRMED);

        // Generate booking reference
        booking.setBookingReference(
                "BK-" + UUID.randomUUID()
                        .toString().substring(0, 8).toUpperCase());

        Booking savedBooking = bookingRepository.save(booking);

        // Create BookingSeat
        BookingSeat bookingSeat = new BookingSeat();
        bookingSeat.setBooking(savedBooking);
        bookingSeat.setShowSeat(showSeat);
        bookingSeat.setPriceAtBooking(showSeat.getPrice());

        bookingSeatRepository.save(bookingSeat);

        // Update ShowSeat status
        showSeat.setStatus(SeatStatus.BOOKED);
        showSeatRepository.save(showSeat);

        // Convert Booking entity to response DTO
        BookingResponseDTO responseDTO =
                modelMapper.map(savedBooking, BookingResponseDTO.class);

        responseDTO.setCustomerId(user.getId());
        responseDTO.setCustomerName(user.getName());
        responseDTO.setShowId(show.getId());

        return responseDTO;
    }
    
    public List<BookingResponseDTO> getUserBookings(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException(
                    "User not found with ID: " + userId);
        }

        List<Booking> bookings =
                bookingRepository.findByCustomerIdOrderByBookingDateTimeDesc(userId);

        List<BookingResponseDTO> responseList = new ArrayList<>();

        for (Booking booking : bookings) {

            BookingResponseDTO response = modelMapper.map(
                    booking, BookingResponseDTO.class);

            response.setCustomerId(booking.getCustomer().getId());
            response.setCustomerName(booking.getCustomer().getName());
            response.setShowId(booking.getShow().getId());

            responseList.add(response);
        }

        return responseList;
    }
}