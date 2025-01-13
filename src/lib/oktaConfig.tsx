export const oktaConfig = {
    clientId: '0oamjzyxlvU95UWJt5d7',
    issuer: 'https://dev-68711173.okta.com/oauth2/default',
    redirectUri: 'http://localhost:3000/login/callback',
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    disableHttpsCheck: true,
}