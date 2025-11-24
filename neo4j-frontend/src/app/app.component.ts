import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService, Movie, Recommendation } from './services/movie.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private movieService = inject(MovieService);

  activeTab: 'search' | 'admin' = 'search'; 
  isLoading = false;

  movies: Movie[] = [];
  actors: string[] = [];
  recommendations: Recommendation[] = [];
  
  selectedActor: string = '';

  newActorName: string = '';
  newMovieTitle: string = '';
  newMovieYear: number | null = null;
  
  relActor: string = '';
  relMovie: string = '';

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData() {
    this.movieService.getMovies().subscribe(data => this.movies = data);
    this.movieService.getActors().subscribe(data => this.actors = data);
  }
  onActorChange() {
    if (!this.selectedActor) return;
    this.isLoading = true;
    this.movieService.getRecommendations(this.selectedActor).subscribe({
      next: (data) => {
        this.recommendations = data;
        this.isLoading = false;
      },
      error: (e) => this.isLoading = false
    });
  }
  
  handleAddActor() {
    if(!this.newActorName) return;
    this.movieService.addActor(this.newActorName).subscribe(() => {
      alert('Dodano aktora!');
      this.newActorName = '';
      this.loadInitialData();
    });
  }

  handleAddMovie() {
    if(!this.newMovieTitle || !this.newMovieYear) return;
    this.movieService.addMovie(this.newMovieTitle, this.newMovieYear).subscribe(() => {
      alert('Dodano film!');
      this.newMovieTitle = '';
      this.newMovieYear = null;
      this.loadInitialData();
    });
  }

  handleAddRelationship() {
    if(!this.relActor || !this.relMovie) return;
    this.movieService.addRelationship(this.relActor, this.relMovie).subscribe(() => {
      alert(`Połączono: ${this.relActor} gra w ${this.relMovie}`);
      this.relActor = '';
      this.relMovie = '';
    });
  }
}