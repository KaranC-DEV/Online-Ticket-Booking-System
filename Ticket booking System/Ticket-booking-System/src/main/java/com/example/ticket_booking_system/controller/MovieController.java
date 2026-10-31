package com.example.ticket_booking_system.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.ticket_booking_system.dto.MovieRequestDTO;
import com.example.ticket_booking_system.dto.MovieResponseDTO;
import com.example.ticket_booking_system.enums.MovieStatus;
import com.example.ticket_booking_system.service.MovieService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/movies")
@Validated
public class MovieController {

	private final MovieService movieService;
	
	@PostMapping
	public ResponseEntity<MovieResponseDTO> createMovie(
		@Valid	@RequestBody MovieRequestDTO movieRequestDTO){
		return new ResponseEntity<>(movieService.createMovie(movieRequestDTO),HttpStatus.CREATED);
		
	}
	
	@GetMapping
	public ResponseEntity <List<MovieResponseDTO>> getAllMovies(){
		List<MovieResponseDTO> movieResponseDTOs = movieService.getAllMovies();
		return new ResponseEntity<>(movieResponseDTOs,HttpStatus.OK);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity <MovieResponseDTO> getMovie(@PathVariable @Positive Long id){
		MovieResponseDTO movieResponseDTO=movieService.getMovieById(id);
		return new ResponseEntity<>(movieResponseDTO,HttpStatus.OK);
	}
	
	@GetMapping("/title/{title}")
	public ResponseEntity<List<MovieResponseDTO>> getAllMoviesByTitle(@PathVariable String title){
		List<MovieResponseDTO> movieResponseDTOs = movieService.getAllMoviesByTitle(title);
		return new ResponseEntity<>(movieResponseDTOs,HttpStatus.OK);
		
	}
	@GetMapping("/genre/{genre}")
	public ResponseEntity<List<MovieResponseDTO>> getAllMoviesByGenre(@PathVariable String genre){
		List<MovieResponseDTO> movieResponseDTOs = movieService.getAllMoviesByGenre(genre);
		return new ResponseEntity<>(movieResponseDTOs,HttpStatus.OK);
		
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<MovieResponseDTO> updateMovieById(
			@PathVariable @Positive Long id,
			@RequestBody MovieRequestDTO movieRequestDTO){
		
		return new ResponseEntity<>(
				movieService.updateMovieById(id, movieRequestDTO), 
				HttpStatus.OK);
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteMovie(@PathVariable Long id){
		
		movieService.deleteMovie(id);
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}
	@PutMapping("/{movieId}/status")
	public ResponseEntity<MovieResponseDTO> updateMovieStatus(
	        @PathVariable Long movieId,
	        @RequestParam MovieStatus status) {

	    return ResponseEntity.ok(
	        movieService.updateMovieStatus(movieId, status)
	    );
	}

	@GetMapping("/admin")
	public ResponseEntity<List<MovieResponseDTO>> getAllMoviesForAdmin() {
	    return ResponseEntity.ok(movieService.getAllMoviesForAdmin());
	}

}
