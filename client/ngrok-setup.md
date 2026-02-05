# ngrok-setup.md

## How to use ngrok with your React project

1. **Install ngrok** (if not already installed):
   ```sh
   npm install -g ngrok
   # or download from https://ngrok.com/download
   ```

2. **Start your React development server:**
   ```sh
   npm start
   # or
   yarn start
   ```

3. **Expose your local server with ngrok:**
   ```sh
   ngrok http 3000
   ```
   - This will give you a public URL (https://...) that tunnels to your local React app.

4. **Update your API URLs (if needed):**
   - If your backend needs to receive requests from the ngrok URL, update CORS settings on your backend.
   - If you want to test webhooks or external integrations, use the ngrok public URL.

5. **(Optional) Add ngrok to your scripts:**
   - You can add a script to your `package.json` for convenience:
   ```json
   "scripts": {
     "ngrok": "ngrok http 3000"
   }
   ```
   - Then run:
   ```sh
   npm run ngrok
   ```

---

**Note:** Never commit your ngrok auth token or sensitive URLs to public repos.
