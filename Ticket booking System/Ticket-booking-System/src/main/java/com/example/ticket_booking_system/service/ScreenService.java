package com.example.ticket_booking_system.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.example.ticket_booking_system.dto.ScreenRequestDTO;
import com.example.ticket_booking_system.dto.ScreenResponseDTO;
import com.example.ticket_booking_system.entity.Screen;
import com.example.ticket_booking_system.entity.Theatre;
import com.example.ticket_booking_system.exception.ResourceNotFoundException;
import com.example.ticket_booking_system.repository.ScreenRepository;
import com.example.ticket_booking_system.repository.TheatreRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScreenService {

    private final ScreenRepository screenRepository;
    private final TheatreRepository theatreRepository;
    private final ModelMapper modelMapper;

    public ScreenResponseDTO addScreen(
            Long theatreId, ScreenRequestDTO requestDTO) {

        Theatre theatre = theatreRepository.findById(theatreId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Theatre not found"));

        Screen screen = modelMapper.map(requestDTO, Screen.class);

        screen.setId(null);
        screen.setTheatre(theatre);

        Screen savedScreen = screenRepository.save(screen);

        ScreenResponseDTO responseDTO =
                modelMapper.map(savedScreen, ScreenResponseDTO.class);

        responseDTO.setTheatreId(theatre.getId());
        responseDTO.setTheatreName(theatre.getName());

        return responseDTO;
    }
    
    public List<ScreenResponseDTO> getScreensByTheatreId(Long theatreId) {

        Theatre theatre = theatreRepository.findById(theatreId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Theatre not found with id: " + theatreId
                        )
                );

        List<Screen> screens =
                screenRepository.findByTheatreId(theatreId);

        return screens.stream()
                .map(screen -> modelMapper.map(
                        screen, ScreenResponseDTO.class
                ))
                .toList();
    }
}