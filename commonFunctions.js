const btoa = require("btoa");

function serializedId(text) {
	return btoa(text).slice(0, 22);
};

function artistSerializer(artist) {
	return {
	    name: artist.name,
	    age: artist.age,
	    albums: `https://tarea-2-integracion.herokuapp.com/api/artists/${artist.id}/albums`,
	    tracks: `https://tarea-2-integracion.herokuapp.com/api/artists/${artist.id}/tracks`,
	    self: `https://tarea-2-integracion.herokuapp.com/api/artists/${artist.id}`,
	};
};

function albumSerializer(album) {
  return {
    name: album.name,
    genre: album.genre,
    artist: `https://tarea-2-integracion.herokuapp.com/api/artists/${album.artistId}/albums`,
    tracks: `https://tarea-2-integracion.herokuapp.com/api/albums/${album.id}/tracks`,
    self: `https://tarea-2-integracion.herokuapp.com/api/albums/${album.id}`,
    artistId: album.artistId,
  };
};

function trackSerializer(track, artistId) {
  return {
    album_id: track.albumId,
    name: track.name,
    duration: track.duration,
    times_played: track.timesPlayed,
    artist: `https://tarea-2-integracion.herokuapp.com/api/artists/${artistId}`,
    album: `https://tarea-2-integracion.herokuapp.com/api/albums/${track.albumId}`,
    self: `https://tarea-2-integracion.herokuapp.com/api/tracks/${track.id}`,
  };
};

module.exports = {
	serializedId,
	artistSerializer,
	albumSerializer,
	trackSerializer
}