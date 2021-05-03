const btoa = require("btoa");

function serializedId(text) {
	return btoa(text).slice(0, 22);
};

function artistSerializer(artist) {
	return {
		ID: artist.id,
	    Name: artist.name,
	    Age: artist.age,
	    Albums: `artists/${artist.id}/albums`,
	    Tracks: `artists/${artist.id}/tracks`,
	    Self: `artists/${artist.id}`,
	};
};

function albumSerializer(album) {
  return {
    ID: album.id,
    Name: album.name,
    Genre: album.genre,
    Artist: `artists/${album.artistId}/albums`,
    Tracks: `albums/${album.id}/tracks`,
    Self: `albums/${album.id}`,
    ArtistId: album.artistId,
  };
};

function trackSerializer(track, artistId) {
  return {
    id: track.id,
    album_id: track.albumId,
    name: track.name,
    duration: track.duration,
    times_played: track.timesPlayed,
    artist: `artists/${artistId}`,
    album: `albums/${track.albumId}`,
    self: `tracks/${track.id}`,
  };
};

module.exports = {
	serializedId,
	artistSerializer,
	albumSerializer,
	TrackSerializer
}