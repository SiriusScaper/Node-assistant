require('dotenv').config();
const fs = require('fs');

const keys = require('./keys.js');

const Twitter = require('twitter');
const Spotify = require('node-spotify-api');
const request = require('request');

//Node Assistant functionality

function runThis() {
	if (process.argv[2] == 'my-tweets') {
		getTweets();
	} else if (process.argv[2] == 'spotify-this-song') {
		searchThisSong();
	} else if (process.argv[2] == 'movie-this') {
		searchMovie();
	} else if (process.argv[2] == 'do-what-it-says') {
		doThisInstead();
	}
}

//OMDB Functionality
let movieName = '';

function searchMovie(defaultMovie) {
	let movieTitle = defaultMovie || process.argv[3] || 'Star Wars';

	request('http://www.omdbapi.com/?apikey=trilogy&t=' + movieTitle, function(
		error,
		response,
		body
	) {
		if (!error && response.statusCode === 200) {
			let jsonReturn = JSON.parse(body);

			let movie = jsonReturn.Title;
			let year = jsonReturn.Year;
			let IMDBrating = jsonReturn.Ratings[0].Source;
			let RTrating = jsonReturn.Ratings[1].Source;
			let country = jsonReturn.Country;
			let language = jsonReturn.Language;
			let plot = jsonReturn.Plot;
			let actors = jsonReturn.Actors;

			console.log(`Movie title: ${movie}
        Year:  ${year}
        IMBD Rating: ${IMDBrating}
        Rotten Tomatoes Rating: ${RTrating}
        Country: ${country}
        Language: ${language}
        Plot: ${plot}
        Actors: ${actors}`);
		}
	});
}

//Twitter functionality
let client = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

function getTweets() {
	let required = { screen_name: 'SiriusScaper', count: 20 };
	client.get('statuses/user_timeline', required, function(
		error,
		tweet,
		response
	) {
		if (error) throw error;
		for (let i = 0; i < tweet.length; i++) {
			console.log(`${tweet[i].created_at} 
            ${tweet[i].text}`);
		}
	});
}

//Spotify funcitonality

let spotify = new Spotify({
	id: keys.spotify.id,
	secret: keys.spotify.secret
});

function searchThisSong(defaultSong) {
	let song = defaultSong || process.argv[3] || 'The Sign Ace of Base';
	spotify
		.search({ type: 'track', query: song, limit: 1 })
		.then(function(data) {
			if (data.tracks.items.length > 0) {
				for (let i = 0; i < data.tracks.items[0].artists.length; i++) {
					console.log(`${data.tracks.itmes[0].artists[i].name}
                    `);
				}
			}
			console.log(`${data.tracks.itmes[0].name}
            ${data.tracks.itmes[0].preview_url}
            ${data.tracks.itmes[0].album.name}
            `);
		})
		.catch(function(err) {
			console.log(err);
		});
}

//do-what-it-says functionality
function doThisInstead() {
	fs.readFile('./random.txt', 'utf8', function(error, data) {
		if (error) throw error;
		data = data.split(',');
		switch (data[0]) {
			case 'my-tweets':
				tweetThis();
				break;
			case 'spotify-this-song':
				searchThisSong(data[1]);
				break;
			case 'movie-this':
				searchMovie(data[1]);
				break;
		}
	});
}

runThis();
