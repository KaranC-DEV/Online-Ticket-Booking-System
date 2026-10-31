package com.example.ticket_booking_system.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ticket_booking_system.entity.Seat;
import com.example.ticket_booking_system.entity.Show;
import com.example.ticket_booking_system.entity.ShowSeat;
import com.example.ticket_booking_system.enums.SeatStatus;
import com.example.ticket_booking_system.enums.SeatType;
import com.example.ticket_booking_system.exception.ResourceNotFoundException;
import com.example.ticket_booking_system.repository.SeatRepository;
import com.example.ticket_booking_system.repository.ShowRepository;
import com.example.ticket_booking_system.repository.ShowSeatRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShowSeatService {

    private final ShowSeatRepository showSeatRepository;
    private final ShowRepository showRepository;
    private final SeatRepository seatRepository;

    public List<ShowSeat> getShowSeats(Long showId) {
    	 if (!showRepository.existsById(showId)) {
             throw new ResourceNotFoundException(
                 "Show not found with ID: " + showId
             );
         }
        return showSeatRepository.findByShowId(showId);
    }
    

@Transactional
public int generateShowSeats(Long showId) {

    Show show = showRepository.findById(showId)
            .orElseThrow(() -> new ResourceNotFoundException(
                    "Show not found with ID: " + showId));

    // Prevent duplicate generation
    if (!showSeatRepository.findByShowId(showId).isEmpty()) {
        throw new IllegalArgumentException(
                "ShowSeats already exist for this show");
    }

    Long screenId = show.getScreen().getId();

    List<Seat> seats = seatRepository.findByScreenId(screenId);

    if (seats.isEmpty()) {
        throw new IllegalArgumentException(
                "No physical seats found for this screen");
    }

    List<ShowSeat> showSeats = new ArrayList<>();

    for (Seat seat : seats) {

        ShowSeat showSeat = new ShowSeat();

        showSeat.setShow(show);
        showSeat.setSeat(seat);
        showSeat.setStatus(SeatStatus.AVAILABLE);

        showSeat.setPrice(
                seat.getSeatType() == SeatType.PREMIUM
                        ? show.getTicketPrice() + 100
                        : show.getTicketPrice()
        );

        showSeats.add(showSeat);
    }

    showSeatRepository.saveAll(showSeats);

    return showSeats.size();
}

}