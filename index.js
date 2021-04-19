const axios = require('axios');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
let episodes_breaking = [];
let episodes_better = [];
axios('https://tarea-1-breaking-bad.herokuapp.com/api/episodes?series=Breaking+Bad').then(x => episodes_breaking = x.data);
axios('https://tarea-1-breaking-bad.herokuapp.com/api/episodes?series=Better+Call+Saul').then(x => episodes_better = x.data);

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
  	let seasons_break = [...new Set(episodes_breaking.map(x => x.season))];
  	let seasons_better = [...new Set(episodes_breaking.map(x => x.season))]
  	res.render('pages/index', {
  		seasons_break: seasons_break,
  		seasons_better: seasons_better,
  	});
  })
  .get('/episodes', (req, res) => {
  	let show = req.query.show;
  	let season = req.query.season;
  	let index = req.query.index;
  	if (show && season && !index) {
  		let episodes = [];
  		if (show === 'Breaking-Bad') {
  			episodes = episodes_breaking.filter(x => x.season == season);
  		} else {
  			episodes = episodes_better.filter(x => x.season == season);
  		};
  		res.render('pages/episodes', {
	  		show: show.replace("-", " "),
	  		season: season,
	  		episodes: episodes,
	  	});
  	} else if (!show && !season && index) {
  		let breaking = episodes_breaking.filter(x => x.episode_id == index);
  		let better = episodes_better.filter(x => x.episode_id == index);
  		let episode = breaking.concat(better);
  		if (episode.length) {
  			res.render('pages/episode-data', {
  				episode: episode[0]
  			});
  		} else {
  			res.render('pages/404');
  		};
  	} else {
  		res.render('pages/404');
  	};
  })
  .get('/search', (req, res) => {
  	let offset = req.query.page ? req.query.page : 1;
  	const link = 'https://tarea-1-breaking-bad.herokuapp.com/api/characters?offset='
  	let name = req.query.name;
  	let results = [];
  	axios(link + (offset-1)*10 + '&name=' + name).then(x => results = x.data);
  	setTimeout( x => {
	  	res.render('pages/results', {
	  		name: name,
	  		results: results,
        page: offset,
	  })}, 1000);
  })
  .get('/characters', (req, res) => {
  	let name = req.query.name;
  	let results = [];
  	axios('https://tarea-1-breaking-bad.herokuapp.com/api/characters?name=' + name).then(x => results = x.data);
 	setTimeout( x => {
  	 	if (results.length) {
	  		res.render('pages/characters', {
	  			character: results[0],
	  		});
	  	} else {
	  		res.render('pages/404');
	}}, 1000);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
