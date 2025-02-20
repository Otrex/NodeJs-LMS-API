const request = require("request-promise");
const { google } = require("googleapis");
const utils = require("../../utils");

// Google Auth
const googleConfig = {
  clientId : process.env.GOOGLE_CLIENT_ID,
  clientSecret : process.env.GOOGLE_CLIENT_SECRET,
  redirect : "https://dev.acadabay.com?auth=google",
  userInfoUrl : "https://www.googleapis.com/oauth2/v3/userinfo"
};
const createGoogleConnection = () => {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
};
const googleAuth = createGoogleConnection();
const defaultScope = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];
const getGoogleConnectionUrl = (auth) => {
  return auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: defaultScope
  });
};

// Facebook auth
const facebookConfig = {
  client_id: process.env.FACEBOOK_CLIENT_ID,
  redirect_uri: "https://dev.acadabay.com/?auth=facebook",
  scope: "email",
  response_type: "code",
  auth_type: "rerequest",
};

module.exports = {
  google : {
    signInUrl : () => {
      return getGoogleConnectionUrl(googleAuth);
    },
    getProfile: async(authCode) => {
      try {
        let { tokens } = await googleAuth.getToken(authCode);
        if(tokens && tokens.access_token){
          let userProfile = await request.get(`${googleConfig.userInfoUrl}?access_token=${tokens.access_token}`,{
            json : true
          });
          if(userProfile){
            return userProfile;
          } else {
            return null;
          }
        } else {
          return null;
        }
      } catch(e){
        utils.writeToFile(e.toString());
        return null;
      }
    }
  },
  facebook: {
    signInUrl : () => {
      let url = "https://www.facebook.com/v4.0/dialog/oauth?";
      for(let field in facebookConfig){
        url += `${field}=${facebookConfig[field]}&`;
      }
      return url;
    },
    getProfile: async(authCode) => {
      let accessTokenUrl = "https://graph.facebook.com/v4.0/oauth/access_token";
      let userProfileUrl = "https://graph.facebook.com/v2.9/me";
      try  {
        let token = await request.get(accessTokenUrl,{
          qs : {
            client_id : process.env.FACEBOOK_CLIENT_ID,
            client_secret : process.env.FACEBOOK_CLIENT_SECRET,
            redirect_uri : facebookConfig.redirect_uri,
            code : authCode
          },
          json : true
        });
        if(token && token.access_token){
          let userProfile = await request.get(userProfileUrl,{
            qs : {
              access_token : token.access_token,
              fields : "id,email,first_name,last_name"
            },
            json : true
          });
          return userProfile;
        } else {
          return null;
        }
      } catch(e){
        utils.writeToFile(e.toString());
        return null;
      }
    }
  }
};