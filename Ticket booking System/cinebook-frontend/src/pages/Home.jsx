import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { apiCall, endpoints } from "../services/api";
import MovieCard from "../components/MovieCard";
import { Empty, Loading, SectionHeading } from "../components/UI";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { apiCall("get", endpoints.movies).then(d => setMovies(Array.isArray(d) ? d : d?.content || [])).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <>
    <section className="hero">
      <div className="hero-content"><span className="hero-tag"><Sparkles size={14}/> THE BIG SCREEN EXPERIENCE</span><h1>Stories worth<br/><em>stepping into.</em></h1><p>Find the movies you love. Pick your seats. Make tonight unforgettable.</p><div className="hero-actions"><Link className="button button-primary" to="/movies">Explore movies <ArrowRight size={17}/></Link><a className="button button-ghost" href="#now-showing"><Play size={16}/> Now showing</a></div><div className="hero-stats"><div><strong>01</strong><span>Find a film</span></div><div><strong>02</strong><span>Choose a show</span></div><div><strong>03</strong><span>Enjoy the magic</span></div></div></div>
      <div className="hero-art"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-ticket"><span>ADMIT ONE</span><strong>YOUR<br/>NEXT<br/><i>STORY</i></strong><small>THE CINEMA IS CALLING</small></div><div className="floating-chip chip-top">✦ &nbsp; BIG SCREEN</div><div className="floating-chip chip-bottom">● &nbsp; BOOK TONIGHT</div></div>
    </section>
    <section id="now-showing" className="content-section">
      <SectionHeading eyebrow="HANDPICKED FOR YOU" title="Now showing" action={<Link className="text-link" to="/movies">View all <ArrowRight size={15}/></Link>}/>
      {loading ? <Loading label="Loading movies..."/> : error ? <div className="alert alert-error">{error}</div> : movies.length ? <div className="movie-grid">{movies.slice(0,8).map((m,i)=><MovieCard key={m.id ?? i} movie={m} index={i}/>)}</div> : <Empty title="No movies available" detail="Add movies from the admin dashboard or check your backend connection."/>}
    </section>
  </>;
}