import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, Film, Languages } from "lucide-react";
import { apiCall, endpoints } from "../services/api";
import { ErrorMessage, Loading } from "../components/UI";
export default function MovieDetails(){
 const {id}=useParams(); const [movie,setMovie]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{apiCall("get",`${endpoints.movies}/${id}`).then(setMovie).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[id]);
 if(loading)return <Loading/>; if(error)return <ErrorMessage>{error}</ErrorMessage>; if(!movie)return null;
 return <section className="detail-layout page-section"><div className="detail-poster poster poster-violet"><strong>{movie.title}</strong><span className="poster-ornament">✦</span></div><div className="detail-copy"><Link to="/movies" className="back-link"><ArrowLeft size={15}/> All movies</Link><span className="eyebrow">MOVIE DETAILS</span><h1>{movie.title}</h1><p className="lead">{movie.description}</p><div className="detail-facts"><span><Film/> {movie.genre}</span><span><Languages/> {movie.language}</span><span><Clock3/> {movie.duration} min</span><span><CalendarDays/> {movie.releaseDate}</span></div><div className="detail-tags"><span>{movie.certificate || "Not rated"}</span><span>{movie.status || "Listed"}</span></div><Link className="button button-primary" to={`/shows?movieId=${movie.id}`}>Find showtimes <CalendarDays size={16}/></Link></div></section>;
}