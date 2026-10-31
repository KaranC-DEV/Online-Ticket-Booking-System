package com.example.ticket_booking_system.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ticket_booking_system.dto.ShowRequestDTO;
import com.example.ticket_booking_system.dto.ShowResponseDTO;
import com.example.ticket_booking_system.entity.Movie;
import com.example.ticket_booking_system.entity.Screen;
import com.example.ticket_booking_system.entity.Seat;
import com.example.ticket_booking_system.entity.Show;
import com.example.ticket_booking_system.entity.ShowSeat;
import com.example.ticket_booking_system.enums.MovieStatus;
import com.example.ticket_booking_system.enums.SeatStatus;
import com.example.ticket_booking_system.enums.SeatType;
import com.example.ticket_booking_system.enums.ShowStatus;
import com.example.ticket_booking_system.exception.ResourceNotFoundException;
import com.example.ticket_booking_system.repository.MovieRepository;
import com.example.ticket_booking_system.repository.ScreenRepository;
import com.example.ticket_booking_system.repository.SeatRepository;
import com.example.ticket_booking_system.repository.ShowRepository;
import com.example.ticket_booking_system.repository.ShowSeatRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class ShowService {

    private final ShowRepository showRepository;
    private final MovieRepository movieRepository;
    private final ScreenRepository screenRepository;
    private final SeatRepository seatRepository;
    private final ShowSeatRepository showSeatRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public ShowResponseDTO addShow(
            Long movieId, Long screenId, ShowRequestDTO requestDTO) {

        if (!requestDTO.getEndTime().isAfter(requestDTO.getStartTime())) {
            throw new IllegalArgumentException(
                    "End time must be after start time");
        }

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Movie not found with ID: " + movieId));

        if (movie.getStatus() != MovieStatus.ACTIVE) {
            throw new IllegalArgumentException(
                    "Cannot schedule a show for an inactive movie");
        }

        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Screen not found with ID: " + screenId));

        boolean overlapping = showRepository.existsOverlappingShow(
                screenId,
                requestDTO.getShowDate(),
                requestDTO.getStartTime(),
                requestDTO.getEndTime());

        if (overlapping) {
            throw new IllegalArgumentException(
                    "Another show is already scheduled during this time on the screen");
        }

        Show show = modelMapper.map(requestDTO, Show.class);

        show.setMovie(movie);
        show.setScreen(screen);
        show.setStatus(ShowStatus.SCHEDULED);

        Show savedShow = showRepository.save(show);

        List<Seat> seats = seatRepository.findByScreenId(screenId);
        List<ShowSeat> showSeats = new ArrayList<>();

        for (Seat seat : seats) {
            ShowSeat showSeat = new ShowSeat();

            showSeat.setShow(savedShow);
            showSeat.setSeat(seat);
            showSeat.setStatus(SeatStatus.AVAILABLE);

            showSeat.setPrice(
                    seat.getSeatType() == SeatType.PREMIUM
                            ? savedShow.getTicketPrice() + 100
                            : savedShow.getTicketPrice());

            showSeats.add(showSeat);
        }

        showSeatRepository.saveAll(showSeats);

        return mapToResponse(savedShow);
    }

    public List<ShowResponseDTO> getAllShows(
            Long movieId, Long theatreId, LocalDate showDate) {

        List<Show> shows = showRepository.findShowsByFilters(
                movieId, theatreId, showDate);

        List<ShowResponseDTO> responseDTOs = new ArrayList<>();

        for (Show show : shows) {
            responseDTOs.add(mapToResponse(show));
        }

        return responseDTOs;
    }

    public ShowResponseDTO getShowById(Long id) {

        Show show = showRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Show not found with ID: " + id));

        return mapToResponse(show);
    }

    private ShowResponseDTO mapToResponse(Show show) {

        ShowResponseDTO responseDTO =
                modelMapper.map(show, ShowResponseDTO.class);

        Screen screen = show.getScreen();

        responseDTO.setTheatreId(screen.getTheatre().getId());
        responseDTO.setTheatreName(screen.getTheatre().getName());

        return responseDTO;
    }
    
    @Transactional
    public void updateShowStatuses(LocalDateTime now) {

        List<Show> shows = showRepository.findAll();

        for (Show show : shows) {

            // Never change cancelled or completed shows
            if (show.getStatus() == ShowStatus.CANCELLED ||
                show.getStatus() == ShowStatus.COMPLETED) {
                continue;
            }

            LocalDateTime startDateTime =
                    LocalDateTime.of(
                        show.getShowDate(),
                        show.getStartTime()
                    );

            LocalDateTime endDateTime =
                    LocalDateTime.of(
                        show.getShowDate(),
                        show.getEndTime()
                    );

            if (!now.isBefore(endDateTime)) {

                show.setStatus(ShowStatus.COMPLETED);

            } else if (!now.isBefore(startDateTime)) {

                show.setStatus(ShowStatus.ONGOING);

            } else {

                show.setStatus(ShowStatus.SCHEDULED);
            }
        }

        showRepository.saveAll(shows);
    }
    
}