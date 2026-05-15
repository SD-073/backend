import type { RequestHandler } from 'express';
import { ACCESS_JWT_SECRET, REFRESH_TOKEN_TTL, SALT_ROUNDS } from '#config';
import { RefreshToken, User } from '#models';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
export const register: RequestHandler = async (req, res) => {

  // try catch....

  
  // TODO: Implement user registration
  // Query the DB for an existing user with that email
  // get data and model
  // Throw an error if a user with that email if found
  // Salt and hash the user's password
  // Save the user to the database with the hashed password


  // Generate access token (JWT) and refresh token (random string saved to database)
  // Send the access token (in the response body) and the refresh token (in a cookie)
  const {firstName, lastName, email, password} = req.body
  const isExsit = await User.exists({email})
  // console.log("from is exist:......... ", isExsit);

  if(isExsit == null){
    const hashedPassword = await bcrypt.hash(password,SALT_ROUNDS )
    // console.log("hashed password: ", hashedPassword);

    const createdUser = await User.create({firstName, lastName, email, password: hashedPassword})


    const accessToken = jwt.sign({ id: createdUser._id, name: createdUser.firstName }, ACCESS_JWT_SECRET)
    // console.log("access token: ", accessToken);

    const refreshToken = jwt.sign({ id: createdUser._id,token: accessToken }, ACCESS_JWT_SECRET)
    
    // const comparsionResult = await bcrypt.compare(password , hashedPassword)
    // console.log("compared password", comparsionResult); // ture
    
    res.cookie("refreshToken", RefreshToken)
    res.status(201).json({ message: 'POST /register', accessToken });
    
  } else {
    res.status(400).json({message: "User is already exsit!"})
  }

  

};

export const login: RequestHandler = async (req, res) => {
  // TODO: Implement user login
  //   Query the DB for an existing user with that email (make sure to .select('+password') so we can compare it to the hashed password)
  // Throw an error is a user with that email is NOT found
  // Compare the hashed password to the password the user provided
  // Throw an error if the passwords don't match
  // Delete all refresh tokens from that user
  // Generate access token (JWT) and refresh token (random string saved to database)
  // Send the access token (in the response body) and the refresh token (in a cookie)
  res.json({ message: 'POST /login', body: req.body });
};

export const refresh: RequestHandler = async (req, res) => {
  // TODO: Implement access token refresh and refresh token rotation
  // Destructure the refreshToken from req.cookies
  // Throw an error if there is no refreshToken cookie
  // Query the database for the matching stored refresh token
  // Throw an error if no stored token was found
  // Delete the stored token (since we'll be rotating it with a new refresh token)
  // Query the database for the user associated with that token
  // Throw an error if no user is found
  // Generate access token (JWT) and refresh token (random string saved to database)
  // Send the access token (in the response body) and the refresh token (in a cookie)
  res.json({ message: 'POST /refresh' });
};

export const logout: RequestHandler = async (req, res) => {
  // TODO: Implement logout by removing the tokens
  //   Get the refreshToken cookie
  // If a refreshToken cookie is found, delete the corresponding stored token from the database
  // Clear the refreshToken cookie
  // Send a success message in the response body
  res.json({ message: 'DELETE /refresh' });
};

export const me: RequestHandler = async (req, res, next) => {
  // TODO: Implement a me handler
  // Get the access token from the request headers
  // Get the Authorization header from the request
  // Isolate the access token
  // Throw an error if there is not access token
  // Verify the access token
  // If token is expired, add code: ACCESS_TOKEN_EXPIRED to error
  // Query the database for the user who is the sub of the access token
  // Throw an error if no user is found
  // Send user profile with success message in response body
  res.json({ message: 'GET /me' });
};
