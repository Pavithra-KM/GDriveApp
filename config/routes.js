import express from "express";
import { google } from "googleapis";
import fs from 'fs';
import gDriveController from "../app/gDriveController.js"
import dotenv from 'dotenv';
dotenv.config();

const route = express.Router();

// Set the credentials to authorize API requests
export const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
)

try {
  const creds = fs.readFileSync("creds.json")
  oauth2Client.setCredentials(JSON.parse(creds))
} catch (err) {
  console.log("No creds");
}

route.get('/google/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly']
  })
  res.redirect(url)
});

route.get('/redirect/google', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  fs.writeFileSync('creds.json', JSON.stringify(tokens));
  res.redirect("/home")
})

route.post('/getVideoFilesList', gDriveController.getVideoFilesList)
route.post('/videoDownload', gDriveController.videoDownload)

export default route;