# Git Proxyserver
This server handles all git-related requests from the <a href="https://github.com/TGlas/tscript">TScript web IDE</a>.
This includes:
- the initial token authorization flow according to the <a href="https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps">OAuth2 authorization standard</a>.
- Requesting a list of the user's repositories from the GitLab / GitHub API.
- Deleting TScript from the user's authorized applications (logout).

Additionally, a separate server runs on a different port that works as a CORS proxy server.<br>
<a href="https://isomorphic-git.org/en/">isomorphic-git</a> cannot make any requests to the GitLab / GitHub API directly from the frontend due to CORS policy. Therefore, a CORS proxy server is needed, through which all repository related traffic is routed.

# Configuration
## Creating a new configuration
Create a file named `config.js` and copy the contents of the `exampleConfig.js` file to your newly created file.<br>
You can then start the server using `node server.js`
## Config values explained
- `CLIENT_SECRET_GITLAB` is a string that contains the client secret issued by GitLab when creating a new application. This is needed for any tasks that need authorization.
- `CLIENT_SECRET_GITHUB` is a string that contains the client secret issued by GitHub when creating a new application. This is needed for any tasks that need authorization.
- `FRONTEND_URL` is the url the TScript IDE is running on. This is needed to tell GitLab / GitHub where to redirect the user to after attempting authorization.
- `SERVER_PORT` is the port on which the basic server is running.
- `PROXY_PORT` is the port on which the proxy server is running.