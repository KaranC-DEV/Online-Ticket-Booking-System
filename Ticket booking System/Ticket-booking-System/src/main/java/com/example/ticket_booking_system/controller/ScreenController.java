package com.example.ticket_booking_system.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ticket_booking_system.dto.ScreenRequestDTO;
import com.example.ticket_booking_system.dto.ScreenResponseDTO;
import com.example.ticket_booking_system.service.ScreenService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/theatres/{theatreId}/screens")
@Validated
public class ScreenController {
	
	private final ScreenService screenService;
	@PostMapping
	public ResponseEntity<ScreenResponseDTO> addScreen(@PathVariable Long theatreId,@Valid	@RequestBody ScreenRequestDTO screenRequestDTO){
		return new ResponseEntity<>(screenService.addScreen(theatreId, screenRequestDTO),HttpStatus.CREATED);
	}
	 @GetMapping
	    public ResponseEntity<List<ScreenResponseDTO>> getScreensByTheatre(
	            @PathVariable Long theatreId) {

	        return ResponseEntity.ok(
	                screenService.getScreensByTheatreId(theatreId)
	        );
	    }
	}