package com.example.ticket_booking_system.service;

import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.example.ticket_booking_system.dto.MovieRequestDTO;
import com.example.ticket_booking_system.dto.MovieResponseDTO;
import com.example.ticket_booking_system.entity.Movie;
import com.example.ticket_booking_system.enums.MovieStatus;
import com.example.ticket_booking_system.exception.ResourceNotFoundException;
import com.example.ticket_booking_system.repository.MovieRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovieService {

	private final MovieRepository movieRepository;
	private final ModelMapper modelMapper;
	
	public MovieResponseDTO createMovie(MovieRequestDTO movieRequestDTO) {
		
		Movie movie = modelMapper.map(movieRequestDTO,Movie.class);
		movie.setStatus(MovieStatus.ACTIVE);
		Movie savedMovie= movieRepository.save(movie);
		return modelMapper.map(savedMovie,MovieResponseDTO.class);
		
	}
	
	public List<MovieResponseDTO> getAllMoviesForAdmin() {
	    return movieRepository.findAll()
	            .stream()
	            .map(movie -> modelMapper.map(movie, MovieResponseDTO.class))
	            .toList();
	}
	
	public List<MovieResponseDTO> getAllMovies(){
		
		List<Movie> movies = movieRepository.findByStatus(MovieStatus.ACTIVE);
		List<MovieResponseDTO> movieResponseDTOs = new ArrayList<>();
		
		for(Movie movie:movies) {
			movieResponseDTOs.add(modelMapper.map(movie, MovieResponseDTO.class));
		}
		return movieResponseDTOs;
	}
	
	public MovieResponseDTO getMovieById(Long id) {
		Movie movie=movieRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Movie Id :-"+id+" not Found"));
		
		return modelMapper.map(movie,MovieResponseDTO.class);
	}
	
	public List<MovieResponseDTO> getAllMoviesByTitle(String title) {
		List<Movie> movies= movieRepository.findByTitle(title);
		List<MovieResponseDTO> movieResponseDTOs = new ArrayList<>();
		
		for(Movie movie:movies) {
			movieResponseDTOs.add(modelMapper.map(movie, MovieResponseDTO.class));
		}
		return movieResponseDTOs;
	}
	
	public List<MovieResponseDTO> getAllMoviesByGenre(String genre) {
		List<Movie> movies= movieRepository.findByGenre(genre);
		List<MovieResponseDTO> movieResponseDTOs = new ArrayList<>();
		
		for(Movie movie:movies) {
			movieResponseDTOs.add(modelMapper.map(movie, MovieResponseDTO.class));
		}
		return movieResponseDTOs;
	}
	
	public MovieResponseDTO updateMovieById(Long id,MovieRequestDTO movieRequestDTO) {
		Movie movie= movieRepository.findById(id).orElseThrow(
				()->new ResourceNotFoundException("Movie id "+" Not Found"));
//		movie.setCertificate(movieRequestDTO.getCertificate());
//		movie.setDescription(movieRequestDTO.getDescription());
//		movie.setDuration(movieRequestDTO.getDuration());
//		movie.setGenre(movieRequestDTO.getGenre());
//		movie.setLanguage(movieRequestDTO.getLanguage());
//		movie.setReleaseDate(movieRequestDTO.getReleaseDate());
//		movie.setTitle(movieRequestDTO.getTitle());
		//OR
		modelMapper.map(movieRequestDTO, movie);
		Movie updatedMovie=movieRepository.save(movie);
				
		return modelMapper.map(updatedMovie, MovieResponseDTO.class);
	}

	public void deleteMovie(Long id) {
		Movie movie=movieRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Movie Id :-"+id+" not Found"));
		
		movieRepository.deleteById(id);
	}
	
	public MovieResponseDTO updateMovieStatus(
	        Long movieId, MovieStatus status) {

	    Movie movie = movieRepository.findById(movieId)
	            .orElseThrow(() -> new ResourceNotFoundException(
	                    "Movie not found with id: " + movieId
	            ));

	    movie.setStatus(status);

	    Movie updatedMovie = movieRepository.save(movie);

	    return modelMapper.map(updatedMovie, MovieResponseDTO.class);
	}
}
