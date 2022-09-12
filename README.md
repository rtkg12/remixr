
# ![remixr](https://github.com/rtkg12/remixr/blob/master/client/public/logo.png)  
  
  
Smart playlist generator for Spotify  
  
### Features - Spotify login  
- Generate playlists based on artist, track or playlist seeds  
- Generate playlists based on personal playlist as a seed  
- Tune parameters like popularity, mood, energy, etc. to further customize the playlist  

## Overview of Algorithm Used to Generate Similar Playlists

 - A set of parameters are generated to bound the traits of similar tracks, while a set of seeds are used to compare the similarity of others tracks

 - Calculate a range on features of tracks to use as parameters
	 1. Get all tracks in the specified playlist from the Spotify API
	 2. Query Spotify for different track features, including:
		- Descriptors of mood (Danceability, Valence, Energy, Tempo)
		- Properties (Loudness, Speechiness, Instrumentalness)
		- Context (Liveness, Acousticness)
		- Numerical values (Bars, Beats, Pitches, Timbre)
	 3. Calculate the 0.1 and 0.9 quantile range for each feature
		- This involved removing the lowest and highest 10% of values for each feature
		- This will somewhat normalize the feature values
	 4. Use these as min and max targets for each feature
		- These parameter values will bound all tracks to be added to generated playlist

- Extract most relevant artists and tracks to use as seeds
	1. Count the number of times each artist appears in the provided playlist
	2. Count the number of times each artist appears in the user's listening history
		- Listening history tracked across short (4 weeks), medium (6 months), and long (several years) terms
		- Top 100 tracks are used from each time range
		- Only artists that have at least one track in the provided playlist are counted from the listening history
	3. Combine these two lists for a total artist list and count
		- The top 2 most frequent artists from this list are chosen
		- Ties are broken randomly
	4. Count the number of times each track appears in the user's listening history
		- Generated using a combination of the same short, medium, and long time frames
		- The top 3 most frequent tracks from this list are chosen
		- Ties are broken randomly
	4. These 2 artists and 3 tracks are the seeds used to generate other tracks

- The Spotify API is queried with the provided seeds and bounded by the paramaters to create a list of 25 recommended tracks
  
## Installation  
  
### Clone  
  
	 git clone https://github.com/rtkg12/remixr.git  

### Pre-requisites  
  
1. Make a developer account at https://developer.spotify.com
2. Create an app through your developer dashboard to obtain a `Client ID` and `Client Secret`  
3. Update `server/app.env` to add the `Client ID` and `Client Secret` from your dashboard

|Property| Description  |
|--|--|
| REACT_APP_API_URL | Use `/api` for default configuration. Replace with backend server address for custom deployment |
|REACT_APP_TRACKING_ID|`optional` Google Analytics Tracking Id |
|CLIENT_URL|Address of the client application|
|REDIRECT_URI|Callback endpoint for Spotify authentication. `Note` Make sure this matches the Redirect URL in the Spotify API console|

### Installation

	yarn install

### Building and developing locally

#### Configuration
 
 |Environment variable| Value  |
|--|--|
| REACT_APP_API_URL | `http://localhost:8080/api` |
|CLIENT_URL|`http://localhost:3000`|
|REDIRECT_URI|`http://localhost:8080/api/callback`|

#### Running the project	
	yarn develop

The React app should start running in port `3000` and the Node.js app will be running in `8080`

### Deploying to Production

#### Configuration
 
 |Environment variable| Value  |
|--|--|
| REACT_APP_API_URL | `/api` |
|CLIENT_URL|`http://PUBLIC_URL`|
|REDIRECT_URI|`http://PUBLIC_URL/api/callback`|

#### Deploying
	yarn deploy

This will build the React app and serve the build folder from Express. Express should be running in port `8080`

## Future Areas of Improvement

- Add support for greater than five seeds using random sampling from generated playlists
- Functionality to add individual songs to library directly from the app
- Regenerate, re-order and edit the playlist dynamically before saving
- Session-wide playlist building. Add songs from multiple queries, save in the end
- Algorithm improvements - different statistical measures, collaborative filtering

## Contribute

Please feel free to open an issue/pull request if you wish to work on any of the above features, or if you have any other suggestions for improvement.



