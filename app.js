const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertMovieDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorDbObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie;`
  const moviesArray = await database.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`
  const movie = await database.get(getMovieQuery)
  response.send(convertMovieDbObjectToResponseObject(movie))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
  INSERT INTO
    movie ( director_id, movie_name, lead_actor)
  VALUES
    (${directorId}, '${movieName}', '${leadActor}');`
  await database.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
            UPDATE
              movie
            SET
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'
            WHERE
              movie_id = ${movieId};`

  await database.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`
  await database.run(deleteMovieQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`
  const directorsArray = await database.all(getDirectorsQuery)
  response.send(
    directorsArray.map(eachDirector =>
      convertDirectorDbObjectToResponseObject(eachDirector),
    ),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`
  const moviesArray = await database.all(getDirectorMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})
module.exports = app

// const express = require('express')
// const app = express()
// const sqlite3 = require('sqlite3')
// const {open} = require('sqlite')
// app.use(express.json())
// const path = require('path')
// const dbPath = path.join(__dirname, 'moviesData.db')

// let db = null

// const inicializeDBAndServer = async () => {
//   try {
//     db = await open({
//       filename: dbPath,
//       driver: sqlite3.Database,
//     })
//     app.listen(3000, () => {
//       console.log('server started')
//     })
//   } catch (e) {
//     console.log(`DB error ${e.message}`)
//     process.exit(1)
//   }
// }

// inicializeDBAndServer()

// // convert snakeCase to camelCase
// const convertDbObjectToResponseObject = dbObject => {
//   return {
//     movieId: dbObject.movie_id,
//     directorId: dbObject.director_id,
//     movieName: dbObject.movie_name,
//     leadActor: dbObject.lead_actor,
//     directorName: dbObject.director_name,
//   }
// }

// //get Movies API1
// app.get('/movies/', async (request, response) => {
//   const allMovieNames = `SELECT movie_name FROM movie `
//   const api1 = await db.all(allMovieNames)
//   response.send(api1.map(eachMovie => ({movieName: eachMovie.movie_name})))
// })

// //creat a new Movie API2
// app.post('/movies/', async (request, response) => {
//   const movieDetails = request.body
//   const {directorId, movieName, leadActor} = movieDetails
//   const newMovie = `INSERT INTO movie(director_id, movie_name, lead_actor)
//   VALUES(${directorId}, '${movieName}', '${leadActor}')`
//   const api2 = await db.run(newMovie)
//   const {movieId} = api2.lastID
//   response.send('Movie Successfully Added')
// })

// //get a Movie API3
// app.get('/movies/:movieId/', async (request, response) => {
//   const {movieId} = request.params
//   const aMovieDetails = `SELECT * FROM movie WHERE movie_id = ${movieId}`
//   const api3 = await db.get(aMovieDetails)
//   response.send(convertDbObjectToResponseObject(api3))
// })

// // udate the Movie API4
// app.put('/movies/:movieId/', async (request, response) => {
//   const {movieId} = request.params
//   const {directorId, movieName, leadActor} = request.body
//   const udateMoviequery = `UPDATE movie SET director_id=${directorId},
//    movie_name='${movieName}', lead_actor='${leadActor}' WHERE movie_id=${movieId}`
//   await db.run(udateMoviequery)
//   response.send('Movie Details Updated')
// })

// // movie delete API5
// app.delete('/movies/:movieId/', async (request, response) => {
//   const {movieId} = request.params
//   const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId}`
//   await db.run(deleteMovieQuery)
//   console.log(movieId)
//   response.send('Movie Removed')
// })

// // Returns a list of all directors in the director table API6
// app.get('/directors/', async (request, response) => {
//   const getDirectorsquery = `SELECT * FROM director`
//   const directorApi = await db.all(getDirectorsquery)
//   response.send(
//     directorApi.map(eachDirector =>
//       convertDbObjectToResponseObject(eachDirector),
//     ),
//   )
// })

// // Returns a list of all movie names directed by a specific director API7
// app.get('/directors/:directorId/movies/', async (request, response) => {
//   const {directorId} = request.params
//   const getDirectorOfAllMoviessquery = `SELECT movie_name FROM director INNER JOIN movie
//   ON director.director_id = movie.director_id WHERE director.director_id=${directorId}`
//   const directorAllMoviesApi = await db.all(getDirectorOfAllMoviessquery)
//   response.send(
//     directorAllMoviesApi.map(eachDirector =>
//       convertDbObjectToResponseObject(eachDirector),
//     ),
//   )
//   console.log(directorAllMoviesApi)
// })

// module.exports = app
